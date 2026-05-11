"""API routes for manuscript management."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, FileResponse
from typing import Optional
from pydantic import BaseModel
from pathlib import Path

from utils.db import get_db_connection, json_deserialize, json_serialize
from utils.config import VAULT_ROOT
from services.export import export_docx_manuscript, export_epub_manuscript
from utils.llm import llm
import uuid
import json
import re
from datetime import datetime

router = APIRouter(prefix="/api/books", tags=["manuscript"])


class ExportRequest(BaseModel):
    format: str = "markdown"
    template: Optional[str] = None


@router.get("/{book_id}/manuscript")
async def get_manuscript(book_id: str):
    """Get the stitched manuscript for a book."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check book exists
    cursor.execute("SELECT id FROM book_projects WHERE id = ?", (book_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get final context
    cursor.execute("SELECT * FROM final_context WHERE book_id = ?", (book_id,))
    final_context = cursor.fetchone()
    conn.close()
    
    if not final_context:
        return {
            "book_id": book_id,
            "manuscript": "",
            "word_count": 0,
            "locked_sections": 0
        }
    
    manuscript = final_context["stitched_text"] or ""
    word_count = len(manuscript.split())
    
    # Count locked sections
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM outline_nodes
        WHERE book_id = ? AND status = 'locked'
    """, (book_id,))
    locked_count = cursor.fetchone()["count"]
    conn.close()
    
    return {
        "book_id": book_id,
        "manuscript": manuscript,
        "word_count": word_count,
        "locked_sections": locked_count
    }


@router.post("/{book_id}/export")
async def export_manuscript(
    book_id: str,
    request: Optional[ExportRequest] = None,
    format: Optional[str] = None,
    template: Optional[str] = None
):
    """Export manuscript in various formats."""
    # Support both query param (legacy) and body (new)
    if request:
        format = request.format
        template = request.template
    elif format is None:
        format = "markdown"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get book metadata
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        raise HTTPException(status_code=404, detail="Book not found")
    book = dict(book)
    
    # Get manuscript
    cursor.execute("SELECT * FROM final_context WHERE book_id = ?", (book_id,))
    final_context = cursor.fetchone()
    conn.close()
    
    if not final_context:
        raise HTTPException(status_code=404, detail="No manuscript found")
    
    manuscript = final_context["stitched_text"] or ""
    working_title = book.get("working_title", "Untitled")
    
    # Extract author and date from metadata_json if available
    author = None
    date = None
    if book.get("metadata_json"):
        metadata = json_deserialize(book["metadata_json"])
        author = metadata.get("author")
        date = metadata.get("date")
    
    if format == "markdown":
        return Response(
            content=manuscript,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="manuscript_{book_id}.md"'}
        )
    elif format == "txt":
        return Response(
            content=manuscript,
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="manuscript_{book_id}.txt"'}
        )
    elif format == "docx":
        # DOCX export with publisher standard manuscript format
        if template == "manuscript" or template is None:
            try:
                filepath = export_docx_manuscript(
                    book_id=book_id,
                    manuscript_text=manuscript,
                    working_title=working_title,
                    author=author,
                    date=date
                )
                return FileResponse(
                    path=str(filepath),
                    media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    filename=filepath.name
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to export DOCX: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported template: {template}")
    elif format == "epub":
        # EPUB export (offline, with pandoc or ebooklib fallback)
        try:
            filepath = export_epub_manuscript(
                book_id=book_id,
                manuscript_text=manuscript,
                working_title=working_title,
                author=author,
                date=date,
                language="en"  # Default to English, can be extracted from metadata later
            )
            return FileResponse(
                path=str(filepath),
                media_type="application/epub+zip",
                filename=filepath.name
            )
        except ImportError as e:
            raise HTTPException(
                status_code=503,
                detail=f"EPUB export unavailable: {str(e)}. Please install pandoc or ebooklib."
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to export EPUB: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")


@router.post("/{book_id}/backmatter/generate")
async def generate_backmatter(book_id: str):
    """Generate back-matter sections (appendix, glossary, references, etc.) for a book."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get book details
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        raise HTTPException(status_code=404, detail="Book not found")
    book = dict(book)
    
    # Get existing outline to understand structure
    cursor.execute("""
        SELECT * FROM outline_nodes
        WHERE book_id = ?
        ORDER BY order_index DESC
        LIMIT 1
    """, (book_id,))
    last_node = cursor.fetchone()
    max_order = last_node["order_index"] if last_node else -1
    
    # Get locked sections count for context
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM outline_nodes
        WHERE book_id = ? AND status = 'locked'
    """, (book_id,))
    locked_count = cursor.fetchone()["count"]
    
    # Get manuscript text for context
    cursor.execute("SELECT stitched_text FROM final_context WHERE book_id = ?", (book_id,))
    final_context = cursor.fetchone()
    manuscript_preview = ""
    if final_context and final_context["stitched_text"]:
        manuscript_preview = final_context["stitched_text"][:2000]  # First 2000 chars for context
    
    conn.close()
    
    # Build prompt for back-matter generation
    prompt = f"""Generate back-matter sections for the book: {book['working_title']}

Book focus: {book.get('focus', 'Not specified')}
Purpose: {book.get('purpose', 'Not specified')}
Audience: {book.get('audience', 'Not specified')}
Locked sections: {locked_count}

Manuscript preview (first 2000 chars):
{manuscript_preview}

Suggest appropriate back-matter sections such as:
- Appendix (if technical details, extended examples, or supplementary material)
- Glossary (if specialized terms are used)
- References (if sources, citations, or bibliography)
- Acknowledgments (standard)
- About the Author (standard)

Return JSON with this structure:
{{
  "nodes": [
    {{
      "node_type": "backmatter|appendix|glossary|references",
      "title": "Section Title",
      "goal": "What this section should contain",
      "order_index": {max_order + 1}
    }}
  ]
}}"""
    
    system = "You are a book writing assistant. Generate appropriate back-matter sections based on the book's content and genre."
    
    # Generate back-matter suggestions
    response_text = await llm.generate(prompt, system=system, temperature=0.7)
    
    # Parse JSON
    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if json_match:
        backmatter_data = json.loads(json_match.group())
    else:
        raise HTTPException(status_code=500, detail="Failed to parse back-matter JSON")
    
    # Create outline nodes for back-matter
    node_ids = []
    conn = get_db_connection()
    cursor = conn.cursor()
    
    current_order = max_order + 1
    for node_data in backmatter_data.get("nodes", []):
        node_id = str(uuid.uuid4())
        node_ids.append(node_id)
        
        # Determine node_type (ensure it's valid)
        node_type = node_data.get("node_type", "backmatter")
        if node_type not in ["backmatter", "appendix", "glossary", "references"]:
            node_type = "backmatter"
        
        cursor.execute("""
            INSERT INTO outline_nodes (
                id, book_id, parent_id, node_type, title, goal,
                order_index, status, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            node_id,
            book_id,
            None,  # Back-matter nodes are typically top-level
            node_type,
            node_data.get("title", "Untitled"),
            node_data.get("goal"),
            node_data.get("order_index", current_order),
            "proposed",  # Start as proposed, user can approve/edit
            json_serialize(node_data.get("metadata", {}))
        ))
        current_order += 1
    
    conn.commit()
    conn.close()
    
    return {
        "node_ids": node_ids,
        "count": len(node_ids),
        "message": f"Generated {len(node_ids)} back-matter sections"
    }

