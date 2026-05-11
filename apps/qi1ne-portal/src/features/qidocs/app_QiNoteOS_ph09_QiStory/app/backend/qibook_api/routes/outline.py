"""API routes for outline management."""
from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import uuid

from utils.db import get_db_connection, json_serialize, json_deserialize
from utils.llm import llm
from services.retrieval import vector_store

router = APIRouter(prefix="/api", tags=["outline"])


class OutlineNodeCreate(BaseModel):
    node_type: str  # prologue | chapter | section | epilogue | appendix
    title: str
    goal: Optional[str] = None
    parent_id: Optional[str] = None
    order_index: int
    metadata: Optional[dict] = None


class OutlineNodeUpdate(BaseModel):
    title: Optional[str] = None
    goal: Optional[str] = None
    status: Optional[str] = None  # proposed | approved | locked
    word_target: Optional[int] = None
    metadata: Optional[dict] = None


class OutlineReorder(BaseModel):
    node_ids: List[str]  # ordered list


@router.post("/books/{book_id}/outline/generate")
async def generate_outline(book_id: str):
    """Generate outline for a book using LLM."""
    # Get book details
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        raise HTTPException(status_code=404, detail="Book not found")
    book = dict(book)
    
    # Get raw items count for context
    cursor.execute("SELECT COUNT(*) as count FROM raw_items")
    raw_count = cursor.fetchone()["count"]
    conn.close()
    
    # Build prompt for outline generation
    prompt = f"""Generate a book outline for: {book['working_title']}

Focus: {book.get('focus', 'Not specified')}
Purpose: {book.get('purpose', 'Not specified')}
Audience: {book.get('audience', 'Not specified')}
Target length: {book.get('length_target_words', 'Not specified')} words
Chapters: {book.get('chapter_count', 'Not specified')}

Based on {raw_count} raw data items, create a structured outline.

Return JSON with this structure:
{{
  "nodes": [
    {{
      "node_type": "prologue|chapter|section|epilogue",
      "title": "Chapter Title",
      "goal": "What this section should accomplish",
      "order_index": 0
    }}
  ]
}}"""
    
    system = "You are a book writing assistant. Generate structured outlines in JSON format."
    
    # Generate outline
    response_text = await llm.generate(prompt, system=system, temperature=0.7)
    
    # Parse JSON (simple extraction - in production, use proper JSON parsing)
    import json
    import re
    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if json_match:
        outline_data = json.loads(json_match.group())
    else:
        raise HTTPException(status_code=500, detail="Failed to parse outline JSON")
    
    # Create outline nodes
    node_ids = []
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for node_data in outline_data.get("nodes", []):
        node_id = str(uuid.uuid4())
        node_ids.append(node_id)
        
        cursor.execute("""
            INSERT INTO outline_nodes (
                id, book_id, parent_id, node_type, title, goal,
                order_index, status, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            node_id,
            book_id,
            node_data.get("parent_id"),
            node_data["node_type"],
            node_data["title"],
            node_data.get("goal"),
            node_data["order_index"],
            "proposed",
            json_serialize(node_data.get("metadata"))
        ))
    
    conn.commit()
    conn.close()
    
    return {"node_ids": node_ids, "count": len(node_ids)}


@router.get("/books/{book_id}/outline")
async def get_outline(book_id: str):
    """Get outline for a book."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM outline_nodes
        WHERE book_id = ?
        ORDER BY order_index ASC
    """, (book_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    nodes = []
    for row in rows:
        node = dict(row)
        if node.get("metadata_json"):
            node["metadata"] = json_deserialize(node["metadata_json"])
        nodes.append(node)
    
    return {"nodes": nodes}


@router.patch("/outline/{node_id}")
async def update_outline_node(node_id: str, update: OutlineNodeUpdate):
    """Update an outline node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check exists
    cursor.execute("SELECT id FROM outline_nodes WHERE id = ?", (node_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Outline node not found")
    
    # Build update
    updates = []
    values = []
    
    if update.title is not None:
        updates.append("title = ?")
        values.append(update.title)
    if update.goal is not None:
        updates.append("goal = ?")
        values.append(update.goal)
    if update.status is not None:
        updates.append("status = ?")
        values.append(update.status)
    if update.word_target is not None:
        updates.append("word_target = ?")
        values.append(update.word_target)
    if update.metadata is not None:
        updates.append("metadata_json = ?")
        values.append(json_serialize(update.metadata))
    
    if not updates:
        conn.close()
        return {"message": "No updates provided"}
    
    values.append(node_id)
    query = f"UPDATE outline_nodes SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, values)
    
    conn.commit()
    conn.close()
    
    return {"message": "Node updated"}


@router.post("/books/{book_id}/outline/reorder")
async def reorder_outline(book_id: str, reorder: OutlineReorder):
    """Reorder outline nodes."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update order_index for each node
    for index, node_id in enumerate(reorder.node_ids):
        cursor.execute("""
            UPDATE outline_nodes
            SET order_index = ?
            WHERE id = ? AND book_id = ?
        """, (index, node_id, book_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Outline reordered"}

