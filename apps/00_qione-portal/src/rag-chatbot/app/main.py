import os
import json
import httpx
import redis
from openai import OpenAI
import boto3
from neo4j import GraphDatabase
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize clients
redis_client = redis.from_url(os.getenv("REDIS_URL"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# NocoDB Configuration
NOCO_API_URL = os.getenv("NOCO_API_URL", "https://app.nocodb.com/api/v2")
NOCO_API_KEY = os.getenv("NOCO_API_KEY") or os.getenv("NOCO_DB_API_KEY", "")
# Table IDs for NocoDB
TABLE_IDS = {
    "cases": "mrcbbwsfmgkyndt",
    "documents": "m1hfu7vs5p5w4gt",
    "document_chunks": "document_chunks", # Assuming this is the name or ID used in the new rag app
    "actors": "mo4acrd2up7jsib",
    "events": "mcn5qg6ta18im5c",
    "filings": "m7ifjf1dx48whdp",
}

# Neo4j connection
neo4j_uri = f"bolt://{os.getenv('NEO4J_URI', 'localhost:7687')}"
# ... (rest of Neo4j and S3 initialization remains same)
neo4j_user = os.getenv("NEO4J_USER", "neo4j")
neo4j_password = os.getenv("NEO4J_PASSWORD", "password")

try:
    neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
except Exception as e:
    print(f"Warning: Neo4j connection failed: {e}")
    neo4j_driver = None

# S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("BUCKET_ENDPOINT"),
    aws_access_key_id=os.getenv("BUCKET_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("BUCKET_SECRET_KEY"),
    region_name=os.getenv("BUCKET_REGION", "us-east-1")
)

BUCKET_NAME = os.getenv("BUCKET_NAME", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4-turbo")
MEMORY_TTL = int(os.getenv("MEMORY_TTL_SECONDS", "86400"))

class KnowledgeGraphManager:
# ... (KnowledgeGraphManager implementation remains same)
    """Manages Neo4j knowledge graph operations"""

    def __init__(self, driver):
        self.driver = driver

    def create_entity(self, entity_name: str, entity_type: str, description: str, embedding: List[float]) -> str:
        """Create entity node in Neo4j"""
        if not self.driver:
            return None
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MERGE (e:Entity {name: $name, type: $type})
                    SET e.description = $description, e.created_at = datetime()
                    RETURN id(e) as id
                    """,
                    name=entity_name,
                    type=entity_type,
                    description=description
                )
                record = result.single()
                return str(record["id"]) if record else None
        except Exception as e:
            print(f"Error creating entity: {e}")
            return None

    def create_relationship(self, source_entity: str, target_entity: str, rel_type: str, confidence: float, evidence: str) -> bool:
        """Create relationship between entities"""
        if not self.driver:
            return False
        try:
            with self.driver.session() as session:
                session.run(
                    """
                    MATCH (source:Entity {name: $source}), (target:Entity {name: $target})
                    CREATE (source)-[r:RELATED_TO {type: $rel_type, confidence: $confidence, evidence: $evidence, created_at: datetime()}]->(target)
                    """,
                    source=source_entity,
                    target=target_entity,
                    rel_type=rel_type,
                    confidence=confidence,
                    evidence=evidence
                )
            return True
        except Exception as e:
            print(f"Error creating relationship: {e}")
            return False

    def find_related_entities(self, entity_name: str, depth: int = 2) -> List[Dict]:
        """Find related entities using graph traversal"""
        if not self.driver:
            return []
        try:
            with self.driver.session() as session:
                result = session.run(
                    f"""
                    MATCH (e:Entity {{name: $name}})-[r*1..{depth}]->(related:Entity)
                    RETURN related.name as name, related.type as type, related.description as description,
                           length(r) as distance
                    LIMIT 10
                    """,
                    name=entity_name
                )
                return [dict(record) for record in result]
        except Exception as e:
            print(f"Error finding related entities: {e}")
            return []

    def semantic_search(self, top_k: int = 5) -> List[Dict]:
        """Find entities"""
        if not self.driver:
            return []
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (e:Entity)
                    RETURN e.name as name, e.type as type, e.description as description
                    LIMIT $limit
                    """,
                    limit=top_k
                )
                return [dict(record) for record in result]
        except Exception as e:
            print(f"Error in semantic search: {e}")
            return []

class RAGChatbot:
    """RAG Chatbot with Knowledge Graph integration"""

    def __init__(self):
        self.noco_headers = {
            "xc-token": NOCO_API_KEY, # Fixed from xc-auth
            "Content-Type": "application/json"
        }
        self.kg_manager = KnowledgeGraphManager(neo4j_driver) if neo4j_driver else None

    async def fetch_records(self, table_name_or_id: str, limit: int = 100):
        """Fetch records from NocoDB using ID or Alias"""
        table_id = TABLE_IDS.get(table_name_or_id, table_name_or_id)
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                url = f"{NOCO_API_URL}/tables/{table_id}/records"
                print(f"Fetching from NocoDB: {url}")
                response = await client.get(url, headers=self.noco_headers, params={"limit": limit})
                response.raise_for_status()
                data = response.json()
                
                # NocoDB v2 typically returns {"list": [...]}, MCP tool uses {"records": [...]}
                # We handle both for robustness
                records = data.get("list") or data.get("records")
                
                if records is None:
                    # If it's already a list, return it
                    if isinstance(data, list):
                        records = data
                    else:
                        print(f"Warning: Unexpected NocoDB response format for {table_name_or_id}: {data}")
                        records = []
                
                print(f"Successfully fetched {len(records)} records from {table_name_or_id}")
                return records
        except Exception as e:
            print(f"Error fetching records from {table_name_or_id}: {e}")
            return []

    async def create_record(self, table_name_or_id: str, data: dict):
        """Create record in NocoDB"""
        table_id = TABLE_IDS.get(table_name_or_id, table_name_or_id)
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                url = f"{NOCO_API_URL}/tables/{table_id}/records"
                response = await client.post(url, headers=self.noco_headers, json=data)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error creating record in {table_name_or_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def get_embedding(self, text: str) -> list:
# ... (rest of RAGChatbot implementation remains same)
        """Get embedding from OpenAI"""
        try:
            response = openai_client.embeddings.create(
                input=text[:8000],  # Limit to 8000 chars
                model=EMBEDDING_MODEL
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            return []

    def cosine_similarity(self, vec1: list, vec2: list) -> float:
        """Calculate cosine similarity"""
        if not vec1 or not vec2:
            return 0
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = sum(a ** 2 for a in vec1) ** 0.5
        norm2 = sum(b ** 2 for b in vec2) ** 0.5
        return dot_product / (norm1 * norm2) if norm1 and norm2 else 0

    def retrieve_relevant_chunks(self, query: str, documents: list, top_k: int = 5) -> list:
        """Retrieve chunks using vector similarity"""
        try:
            query_embedding = self.get_embedding(query)
            if not query_embedding:
                return documents[:top_k]

            scored_docs = []
            for doc in documents:
                if "vector" in doc and doc["vector"]:
                    try:
                        doc_vector = json.loads(doc["vector"]) if isinstance(doc["vector"], str) else doc["vector"]
                        similarity = self.cosine_similarity(query_embedding, doc_vector)
                        scored_docs.append((doc, similarity))
                    except:
                        continue

            scored_docs.sort(key=lambda x: x[1], reverse=True)
            return [doc for doc, _ in scored_docs[:top_k]]
        except Exception as e:
            print(f"Error retrieving chunks: {e}")
            return documents[:top_k]

    def get_conversation_memory(self, session_id: str) -> list:
        """Get conversation history from Redis"""
        try:
            memory_key = f"chat_memory:{session_id}"
            memory_data = redis_client.get(memory_key)
            return json.loads(memory_data) if memory_data else []
        except Exception as e:
            print(f"Error getting memory: {e}")
            return []

    def save_conversation_memory(self, session_id: str, messages: list):
        """Save conversation history to Redis"""
        try:
            memory_key = f"chat_memory:{session_id}"
            redis_client.setex(memory_key, MEMORY_TTL, json.dumps(messages))
        except Exception as e:
            print(f"Error saving memory: {e}")

    def upload_file_to_s3(self, file_content: bytes, filename: str, folder: str = "documents") -> str:
        """Upload file to S3"""
        try:
            key = f"{folder}/{datetime.now().strftime('%Y%m%d')}/{filename}"
            s3_client.put_object(Bucket=BUCKET_NAME, Key=key, Body=file_content)
            return key
        except Exception as e:
            print(f"Error uploading to S3: {e}")
            raise

    async def generate_response(self, query: str, context: str, kg_context: str, session_id: str) -> str:
        """Generate LLM response with document and knowledge graph context"""
        try:
            memory = self.get_conversation_memory(session_id)

            system_prompt = """You are a helpful assistant with access to document context and a knowledge graph.
Use both the document chunks and the knowledge graph relationships to provide comprehensive answers.
When referencing entities, mention their relationships when relevant.
If information is not available, say so clearly."""

            messages = [{"role": "system", "content": system_prompt}]

            # Add conversation history
            for msg in memory[-10:]:
                messages.append(msg)

            # Combine contexts
            full_context = f"""Document Context:
{context}

Knowledge Graph Context:
{kg_context}

User Question: {query}"""

            messages.append({"role": "user", "content": full_context})

            # Get LLM response
            response = openai_client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )

            answer = response.choices[0].message.content

            # Update memory
            memory.append({"role": "user", "content": query})
            memory.append({"role": "assistant", "content": answer})
            self.save_conversation_memory(session_id, memory)

            return answer
        except Exception as e:
            print(f"Error generating response: {e}")
            raise

# FastAPI app
app = FastAPI(title="FCFCU Unified API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # Changed to False for broad compatibility
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = RAGChatbot()

# === Models ===

class ChatRequest(BaseModel):
    query: str
    session_id: str
    table_name: str = "document_chunks"
    top_k: int = 5
    use_kg: bool = True

class ChatResponse(BaseModel):
    answer: str
    sources: list
    kg_entities: list
    session_id: str

class CaseCreate(BaseModel):
    case_name: str
    cause_number: Optional[str] = None
    court: Optional[str] = None
    status: str = "Active"
    summary: Optional[str] = None

# === Endpoints ===

@app.post("/chat")
@app.post("/ai/chat") # Alias for compatibility
async def chat(request: ChatRequest) -> ChatResponse:
    """RAG chatbot with knowledge graph"""
    try:
        # Fetch document chunks
        documents = await chatbot.fetch_records(request.table_name)
        if not documents:
            # Fallback or empty context
            doc_context = "No documents found."
            relevant_chunks = []
        else:
            relevant_chunks = chatbot.retrieve_relevant_chunks(request.query, documents, request.top_k)
            doc_context = "\n\n".join([
                f"[{doc.get('id', 'unknown')}] {doc.get('chunk_content', '')}"
                for doc in relevant_chunks
            ])

        # Get knowledge graph context
        kg_entities = []
        kg_context = ""
        if request.use_kg and chatbot.kg_manager:
            kg_entities = chatbot.kg_manager.semantic_search(request.top_k)
            kg_context = "\n".join([
                f"- {entity['name']} ({entity['type']}): {entity['description']}"
                for entity in kg_entities
            ])

        # Generate response
        answer = await chatbot.generate_response(request.query, doc_context, kg_context, request.session_id)

        return ChatResponse(
            answer=answer,
            sources=[doc.get('id') for doc in relevant_chunks],
            kg_entities=[e['name'] for e in kg_entities],
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cases")
async def list_cases():
    """List cases from NocoDB"""
    records = await chatbot.fetch_records("cases")
    return records

@app.post("/cases")
async def create_case(payload: CaseCreate):
    """Create a new case in NocoDB"""
    return await chatbot.create_record("cases", payload.dict())

@app.get("/jobs/ping")
async def ping_jobs():
    """Compatibility ping endpoint"""
    return {"ok": True, "service": "fcfcu-unified-api"}

@app.post("/jobs/ingest")
async def trigger_ingest():
    """Compatibility ingest endpoint (placeholder)"""
    return {"status": "enqueued", "message": "Ingestion task triggered."}

@app.post("/upload")
# ... (rest of upload and health endpoints remain same)
async def upload_file(file: UploadFile = File(...), session_id: str = None) -> dict:
    """Upload document file"""
    try:
        content = await file.read()
        s3_key = chatbot.upload_file_to_s3(content, file.filename)

        # Register in NocoDB
        doc_data = {
            "filename": file.filename,
            "s3_key": s3_key,
            "size": len(content),
            "uploaded_at": datetime.now().isoformat(),
            "session_id": session_id,
            "status": "pending_processing"
        }
        await chatbot.create_record("documents", doc_data)

        return {
            "filename": file.filename,
            "s3_key": s3_key,
            "size": len(content),
            "uploaded_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/memory/{session_id}")
async def get_memory(session_id: str):
    """Get conversation memory"""
    memory = chatbot.get_conversation_memory(session_id)
    return {"session_id": session_id, "messages": memory}

@app.delete("/memory/{session_id}")
async def clear_memory(session_id: str):
    """Clear session memory"""
    redis_client.delete(f"chat_memory:{session_id}")
    return {"status": "cleared", "session_id": session_id}

@app.get("/sessions")
async def list_sessions():
    """List all active sessions"""
    try:
        keys = redis_client.keys("chat_memory:*")
        sessions = [key.decode().replace("chat_memory:", "") for key in keys]
        return {"sessions": sessions, "count": len(sessions)}
    except:
        return {"sessions": [], "count": 0}

@app.get("/kg/entities")
async def list_entities():
    """List all entities in knowledge graph"""
    if not chatbot.kg_manager:
        return {"entities": [], "count": 0}
    try:
        with neo4j_driver.session() as session:
            result = session.run("MATCH (e:Entity) RETURN e.name as name, e.type as type LIMIT 100")
            entities = [dict(record) for record in result]
        return {"entities": entities, "count": len(entities)}
    except:
        return {"entities": [], "count": 0}

@app.get("/kg/entity/{entity_name}")
async def get_entity_details(entity_name: str):
    """Get entity details and relationships"""
    if not chatbot.kg_manager:
        return {"entity": entity_name, "related_entities": []}
    related = chatbot.kg_manager.find_related_entities(entity_name, depth=2)
    return {"entity": entity_name, "related_entities": related}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)