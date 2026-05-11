"""API routes for evidence mapping."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uuid

from utils.db import get_db_connection, json_serialize, json_deserialize
from services.retrieval import vector_store

router = APIRouter(prefix="/api", tags=["evidence"])


class EvidenceAttach(BaseModel):
    chunk_id: str
    relevance_score: Optional[float] = None


@router.post("/books/{book_id}/evidence/map")
async def map_evidence(book_id: str):
    """Map evidence chunks to outline nodes."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all outline nodes
    cursor.execute("""
        SELECT * FROM outline_nodes
        WHERE book_id = ? AND status != 'locked'
        ORDER BY order_index ASC
    """, (book_id,))
    nodes = [dict(row) for row in cursor.fetchall()]
    
    # Get book for context
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (book_id,))
    book = dict(cursor.fetchone()) if cursor.fetchone() else {}
    
    evidence_links_created = []
    
    for node in nodes:
        # Build query from node
        query_parts = [node["title"]]
        if node.get("goal"):
            query_parts.append(node["goal"])
        query = " ".join(query_parts)
        
        # Search for relevant chunks
        results = await vector_store.search(query, top_k=10)
        
        # Create evidence links
        for result in results[:5]:  # Top 5 per node
            chunk_id = result.get("chunk_id")
            if not chunk_id:
                continue
            
            link_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO evidence_links (
                    id, outline_node_id, chunk_id, relevance_score
                ) VALUES (?, ?, ?, ?)
            """, (
                link_id,
                node["id"],
                chunk_id,
                result.get("_distance", 0.0)  # LanceDB distance
            ))
            evidence_links_created.append(link_id)
    
    conn.commit()
    conn.close()
    
    return {
        "message": "Evidence mapped",
        "links_created": len(evidence_links_created)
    }


@router.get("/outline/{node_id}/evidence")
async def get_node_evidence(node_id: str):
    """Get evidence chunks for an outline node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get evidence links
    cursor.execute("""
        SELECT el.*, c.chunk_text, c.raw_item_id, ri.title as raw_title, ri.type as raw_type
        FROM evidence_links el
        JOIN chunks c ON el.chunk_id = c.id
        JOIN raw_items ri ON c.raw_item_id = ri.id
        WHERE el.outline_node_id = ?
        ORDER BY el.relevance_score ASC
    """, (node_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    evidence = []
    for row in rows:
        evidence.append({
            "link_id": row["id"],  # Include link_id for detach
            "chunk_id": row["chunk_id"],
            "chunk_text": row["chunk_text"],
            "relevance_score": row["relevance_score"],
            "raw_item_id": row["raw_item_id"],
            "raw_title": row["raw_title"],
            "raw_type": row["raw_type"],
            "manual_link": row.get("manual_link", False)
        })
    
    # Check if thin evidence
    is_thin = len(evidence) < 3
    
    return {
        "node_id": node_id,
        "evidence": evidence,
        "count": len(evidence),
        "is_thin": is_thin,
        "warning": "Thin evidence (< 3 chunks). Add sources or edit goal." if is_thin else None
    }


@router.post("/outline/{node_id}/evidence/search")
async def search_evidence(node_id: str, query: str = Query(..., description="Search query"), top_k: int = Query(10, description="Number of results")):
    """Search for chunks to manually attach to a node."""
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter required")
    results = await vector_store.search(query, top_k=top_k)
    
    # Format for UI
    formatted = []
    for result in results:
        # Get chunk details
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, ri.title as raw_title, ri.type as raw_type
            FROM chunks c
            JOIN raw_items ri ON c.raw_item_id = ri.id
            WHERE c.id = ?
        """, (result.get("chunk_id"),))
        chunk_row = cursor.fetchone()
        conn.close()
        
        if chunk_row:
            formatted.append({
                "chunk_id": result.get("chunk_id"),
                "chunk_text": chunk_row["chunk_text"][:200] + "..." if len(chunk_row["chunk_text"]) > 200 else chunk_row["chunk_text"],
                "full_text": chunk_row["chunk_text"],
                "relevance_score": result.get("_distance", 0.0),
                "raw_title": chunk_row["raw_title"],
                "raw_type": chunk_row["raw_type"]
            })
    
    return {"results": formatted}


@router.post("/outline/{node_id}/evidence/attach")
async def attach_evidence(node_id: str, attach: EvidenceAttach):
    """Manually attach a chunk to an outline node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if already attached
    cursor.execute("""
        SELECT id FROM evidence_links
        WHERE outline_node_id = ? AND chunk_id = ?
    """, (node_id, attach.chunk_id))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Chunk already attached")
    
    # Create link
    link_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO evidence_links (
            id, outline_node_id, chunk_id, relevance_score
        ) VALUES (?, ?, ?, ?)
    """, (
        link_id,
        node_id,
        attach.chunk_id,
        attach.relevance_score or 0.0
    ))
    
    conn.commit()
    conn.close()
    
    return {"message": "Evidence attached", "link_id": link_id}


@router.delete("/outline/{node_id}/evidence/{link_id}")
async def detach_evidence(node_id: str, link_id: str):
    """Remove an evidence link."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        DELETE FROM evidence_links
        WHERE id = ? AND outline_node_id = ?
    """, (link_id, node_id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Evidence link not found")
    
    conn.commit()
    conn.close()
    
    return {"message": "Evidence detached"}
