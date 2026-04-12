"""Text chunking service."""
import uuid
from typing import List, Dict, Any
from utils.config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP
) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks.
    
    Returns list of dicts with:
    - chunk_text: the text content
    - chunk_order: sequential order
    - start_pos: character position in original text
    - end_pos: character position in original text
    """
    if not text or len(text) <= chunk_size:
        return [{
            "chunk_text": text,
            "chunk_order": 0,
            "start_pos": 0,
            "end_pos": len(text)
        }]
    
    chunks = []
    start = 0
    order = 0
    
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk_text = text[start:end]
        
        chunks.append({
            "chunk_text": chunk_text,
            "chunk_order": order,
            "start_pos": start,
            "end_pos": end
        })
        
        start = end - overlap
        order += 1
        
        # Prevent infinite loop
        if start >= len(text) - overlap:
            break
    
    return chunks


def create_chunks_for_raw_item(
    raw_item_id: str,
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP
) -> List[str]:
    """Create chunk records for a raw item and return chunk IDs."""
    from utils.db import get_db_connection
    
    chunks = chunk_text(text, chunk_size, overlap)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    chunk_ids = []
    
    for chunk_data in chunks:
        chunk_id = str(uuid.uuid4())
        chunk_ids.append(chunk_id)
        
        cursor.execute("""
            INSERT INTO chunks (
                id, raw_item_id, chunk_text, chunk_order,
                timestamp_range_json
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            chunk_id,
            raw_item_id,
            chunk_data["chunk_text"],
            chunk_data["chunk_order"],
            None  # timestamp_range_json - can be populated later
        ))
    
    conn.commit()
    conn.close()
    
    return chunk_ids

