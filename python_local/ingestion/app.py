import os
import json
import httpx
import boto3
from openai import OpenAI
import asyncio
from datetime import datetime
from typing import List, Tuple
import PyPDF2
from io import BytesIO
from neo4j import GraphDatabase

NOCO_API_URL = os.getenv("NOCO_API_URL", "http://localhost:8080").rstrip("/")
NOCO_API_KEY = os.getenv("NOCO_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))
BUCKET_NAME = os.getenv("BUCKET_NAME", "")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

s3_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("BUCKET_ENDPOINT"),
    aws_access_key_id=os.getenv("BUCKET_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("BUCKET_SECRET_KEY"),
    region_name=os.getenv("BUCKET_REGION", "us-east-1")
)

# Neo4j connection
neo4j_uri = f"bolt://{os.getenv('NEO4J_URI', 'localhost:7687')}"
neo4j_user = os.getenv("NEO4J_USER", "neo4j")
neo4j_password = os.getenv("NEO4J_PASSWORD", "password")

try:
    neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
except Exception as e:
    print(f"Warning: Neo4j connection failed: {e}")
    neo4j_driver = None

class DocumentIngestionWithKG:
    def __init__(self):
        self.noco_headers = {"xc-auth": NOCO_API_KEY}

    def chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list:
        """Split text into overlapping chunks"""
        chunks = []
        words = text.split()
        current_chunk = []
        current_size = 0

        for word in words:
            current_chunk.append(word)
            current_size += len(word) + 1

            if current_size >= chunk_size:
                chunk = " ".join(current_chunk)
                if chunk.strip():
                    chunks.append(chunk)
                # Keep last overlap words
                overlap_words = int(overlap / 5)  # Rough estimate
                current_chunk = current_chunk[-overlap_words:] if overlap_words > 0 else []
                current_size = sum(len(w) for w in current_chunk) + len(current_chunk)

        # Add remaining
        if current_chunk:
            chunk = " ".join(current_chunk)
            if chunk.strip():
                chunks.append(chunk)

        return chunks

    def get_embedding(self, text: str) -> list:
        """Get embedding from OpenAI"""
        try:
            response = openai_client.embeddings.create(
                input=text[:8000],
                model=EMBEDDING_MODEL
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            return []

    def extract_entities_and_relationships(self, text: str) -> Tuple[list, list]:
        """Use LLM to extract entities and relationships"""
        try:
            prompt = f"""Extract entities and relationships from this text.
Return JSON with format:
{{
    "entities": [
        {{"name": "...", "type": "...", "description": "..."}}
    ],
    "relationships": [
        {{"source": "...", "target": "...", "type": "...", "confidence": 0.9}}
    ]
}}

Text: {text[:2000]}"""

            response = openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=500
            )

            try:
                result = json.loads(response.choices[0].message.content)
                return result.get("entities", []), result.get("relationships", [])
            except:
                return [], []
        except Exception as e:
            print(f"Error extracting entities: {e}")
            return [], []

    def create_kg_nodes(self, entities: list, relationships: list):
        """Create entities and relationships in Neo4j"""
        if not neo4j_driver:
            return

        try:
            with neo4j_driver.session() as session:
                for entity in entities:
                    session.run(
                        """
                        MERGE (e:Entity {name: $name})
                        SET e.type = $type, e.description = $description, e.created_at = datetime()
                        """,
                        name=entity.get("name"),
                        type=entity.get("type"),
                        description=entity.get("description")
                    )

                for rel in relationships:
                    try:
                        session.run(
                            """
                            MATCH (source:Entity {name: $source}), (target:Entity {name: $target})
                            MERGE (source)-[r:RELATED_TO {type: $rel_type}]->(target)
                            SET r.confidence = $confidence, r.updated_at = datetime(), r.created_at = COALESCE(r.created_at, datetime())
                            """,
                            source=rel.get("source"),
                            target=rel.get("target"),
                            rel_type=rel.get("type"),
                            confidence=rel.get("confidence", 0.8)
                        )
                    except:
                        pass  # Relationship might already exist
        except Exception as e:
            print(f"Error creating KG nodes: {e}")

    async def ingest_documents(self, table_name: str = "documents"):
        """Process documents with entity extraction"""
        async with httpx.AsyncClient(timeout=60) as client:
            try:
                url = f"{NOCO_API_URL}/api/v2/tables/{table_name}/records"
                response = await client.get(url, headers=self.noco_headers)
                documents = response.json().get("list", [])
            except Exception as e:
                print(f"Error fetching documents: {e}")
                return {"processed_chunks": 0, "documents": 0}

            processed = 0
            for doc in documents:
                if doc.get("status") == "processed":
                    continue

                s3_key = doc.get("s3_key")
                if not s3_key:
                    continue

                try:
                    # Download file
                    file_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_key)
                    file_content = file_obj["Body"].read()

                    # Extract text
                    if s3_key.endswith(".pdf"):
                        try:
                            pdf_file = BytesIO(file_content)
                            reader = PyPDF2.PdfReader(pdf_file)
                            content = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
                        except:
                            content = file_content.decode("utf-8", errors="ignore")
                    else:
                        content = file_content.decode("utf-8", errors="ignore")

                    # Chunk text
                    chunks = self.chunk_text(content)

                    # Process each chunk
                    for idx, chunk in enumerate(chunks):
                        # Get embedding
                        embedding = self.get_embedding(chunk)

                        # Extract entities and relationships
                        entities, relationships = self.extract_entities_and_relationships(chunk)

                        # Create KG nodes
                        self.create_kg_nodes(entities, relationships)

                        # Save chunk to NocoDB
                        chunk_data = {
                            "chunk_index": idx,
                            "chunk_content": chunk,
                            "vector": json.dumps(embedding) if embedding else "[]",
                            "source_id": doc.get("id"),
                            "source_filename": doc.get("filename"),
                            "entities": json.dumps(entities),
                            "relationships": json.dumps(relationships),
                            "created_at": datetime.now().isoformat()
                        }

                        chunks_url = f"{NOCO_API_URL}/api/v2/tables/document_chunks/records"
                        await client.post(chunks_url, headers=self.noco_headers, json=chunk_data)
                        processed += 1

                    # Update document status
                    update_url = f"https://{NOCO_API_URL}/api/v2/tables/{table_name}/records/{doc.get('id')}"
                    await client.patch(update_url, headers=self.noco_headers, json={"status": "processed"})
                    print(f"✓ Processed: {doc.get('filename')} ({len(chunks)} chunks)")

                except Exception as e:
                    print(f"✗ Error processing {doc.get('filename')}: {str(e)}")
                    try:
                        update_url = f"https://{NOCO_API_URL}/api/v2/tables/{table_name}/records/{doc.get('id')}"
                        await client.patch(update_url, headers=self.noco_headers, json={"status": "error", "error_message": str(e)})
                    except:
                        pass

            return {"processed_chunks": processed, "documents": len(documents)}

async def main():
    print("Starting document ingestion...")
    ingestion = DocumentIngestionWithKG()
    result = await ingestion.ingest_documents("documents")
    print(f"Ingestion complete: {result}")

if __name__ == "__main__":
        asyncio.run(main())
