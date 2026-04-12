"""Ingestion service for raw data files."""
import uuid
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List
import mimetypes

from utils.db import get_db_connection, json_serialize


def generate_id() -> str:
    """Generate a unique ID."""
    return str(uuid.uuid4())


def detect_type(file_path: Optional[str], mime_type: Optional[str] = None) -> str:
    """Detect raw item type from file path or MIME type."""
    if not file_path and not mime_type:
        return "note"
    
    if mime_type:
        if "pdf" in mime_type:
            return "pdf"
        elif "image" in mime_type:
            return "image"
        elif "audio" in mime_type:
            return "audio"
        elif "video" in mime_type:
            return "video"
        elif "word" in mime_type or "document" in mime_type:
            return "docx"
    
    if file_path:
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            return "pdf"
        elif ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
            return "image"
        elif ext in [".mp3", ".wav", ".m4a", ".flac"]:
            return "audio"
        elif ext in [".mp4", ".avi", ".mov", ".mkv"]:
            return "video"
        elif ext in [".docx", ".doc"]:
            return "docx"
        elif ext == ".ics":
            return "calendar"
        elif ext in [".json", ".csv", ".txt"]:
            return "chat"  # Could be chat export
    
    return "note"


async def create_raw_item(
    type: str,
    source_name: Optional[str] = None,
    title: Optional[str] = None,
    text_content: Optional[str] = None,
    file_path: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> str:
    """Create a raw item record."""
    item_id = generate_id()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO raw_items (
            id, type, source_name, title, created_at, imported_at,
            text_content, file_path, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item_id,
        type,
        source_name,
        title,
        metadata.get("created_at") if metadata else None,
        datetime.utcnow().isoformat(),
        text_content,
        file_path,
        json_serialize(metadata)
    ))
    
    conn.commit()
    conn.close()
    return item_id


def get_raw_item(item_id: str) -> Optional[Dict[str, Any]]:
    """Get a raw item by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM raw_items WHERE id = ?", (item_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    return dict(row)


def list_raw_items(limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    """List raw items with chunk count and embedding status."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get raw items with chunk counts
    # Note: Embeddings are stored in LanceDB, not SQLite, so we can't count them directly.
    # We assume embeddings exist if chunks exist (since process_all creates both together).
    cursor.execute("""
        SELECT 
            ri.*,
            COUNT(DISTINCT c.id) as chunk_count
        FROM raw_items ri
        LEFT JOIN chunks c ON ri.id = c.raw_item_id
        GROUP BY ri.id
        ORDER BY ri.imported_at DESC
        LIMIT ? OFFSET ?
    """, (limit, offset))
    
    rows = cursor.fetchall()
    conn.close()
    
    # Convert Row objects to dictionaries
    items = []
    for row in rows:
        chunk_count = row['chunk_count'] or 0
        has_text = bool(row['text_content'])
        
        # Determine status
        # Note: We assume embeddings exist if chunks exist (since process_all creates both)
        if not has_text:
            status = 'pending'
        elif chunk_count == 0:
            status = 'processed'  # Text extracted but not chunked
        else:
            status = 'ready'  # Chunked (and assumed to have embeddings)
        
        item = {
            'id': row['id'],
            'type': row['type'],
            'source_name': row['source_name'],
            'title': row['title'],
            'created_at': row['created_at'],
            'imported_at': row['imported_at'],
            'text_content': row['text_content'],
            'file_path': row['file_path'],
            'metadata_json': row['metadata_json'],
            'chunk_count': chunk_count,
            'embedding_count': chunk_count,  # Assume embeddings = chunks (since process_all creates both)
            'status': status
        }
        items.append(item)
    
    return items

