"""Retrieval service for vector similarity search."""
from typing import List, Dict, Any, Optional
import lancedb
import numpy as np
from pathlib import Path

from utils.config import LANCEDB_PATH, RETRIEVAL_TOP_K
from utils.embeddings import embeddings


class VectorStore:
    """LanceDB vector store wrapper."""
    
    def __init__(self):
        self.db_path = LANCEDB_PATH
        self.db_path.mkdir(parents=True, exist_ok=True)
        self.db = lancedb.connect(str(self.db_path))
        self.table_name = "chunks"
        self._table = None
        self._ensure_table()
    
    def _ensure_table(self):
        """Ensure the chunks table exists."""
        try:
            self._table = self.db.open_table(self.table_name)
        except Exception:
            # Table doesn't exist, will be created on first insert
            self._table = None
    
    async def upsert_chunk(
        self,
        chunk_id: str,
        raw_item_id: str,
        chunk_text: str,
        item_type: str,
        title: Optional[str] = None,
        tags: Optional[List[str]] = None
    ):
        """Upsert a chunk with its embedding."""
        # Generate embedding
        embedding_vec = await embeddings.embed([chunk_text])
        embedding = np.array(embedding_vec[0], dtype=np.float32)
        
        # Prepare data
        data = {
            "chunk_id": chunk_id,
            "raw_item_id": raw_item_id,
            "type": item_type,
            "embedding": embedding,
            "created_at": "",
            "title": title or "",
            "tags": ",".join(tags) if tags else ""
        }
        
        # Upsert to LanceDB
        if self._table is None:
            # Create table with first insert
            self._table = self.db.create_table(self.table_name, [data])
        else:
            self._table.add([data], mode="overwrite")
    
    async def search(
        self,
        query_text: str,
        top_k: int = RETRIEVAL_TOP_K,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar chunks."""
        if self._table is None:
            return []
        
        # Generate query embedding
        query_embedding = await embeddings.embed([query_text])
        query_vec = np.array(query_embedding[0], dtype=np.float32)
        
        # Search
        search = self._table.search(query_vec).limit(top_k)
        
        # Apply filters if provided
        if filters:
            if "type" in filters:
                search = search.where(f"type = '{filters['type']}'")
            if "raw_item_id" in filters:
                search = search.where(f"raw_item_id = '{filters['raw_item_id']}'")
        
        # Convert to list of dicts
        df = search.to_pandas()
        if df.empty:
            return []
        
        # Add distance as relevance_score (inverted - lower is better)
        results = []
        for _, row in df.iterrows():
            result = row.to_dict()
            # LanceDB returns distance, convert to score
            if "_distance" in result:
                result["relevance_score"] = float(result["_distance"])
            results.append(result)
        
        return results
    
    async def for_outline_node(self, node_id: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """Get evidence chunks for a specific outline node."""
        from utils.db import get_db_connection
        
        # Get node details
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
        node = cursor.fetchone()
        if not node:
            conn.close()
            return []
        node = dict(node)
        conn.close()
        
        # Build query from node
        query_parts = [node["title"]]
        if node.get("goal"):
            query_parts.append(node["goal"])
        query = " ".join(query_parts)
        
        # Search
        results = await self.search(query, top_k=top_k)
        
        # Filter to ensure minimum evidence
        if len(results) < 3:
            # Try broader search
            broader_results = await self.search(node["title"], top_k=top_k * 2)
            results = broader_results[:top_k]
        
        return results


# Global instance
vector_store = VectorStore()

