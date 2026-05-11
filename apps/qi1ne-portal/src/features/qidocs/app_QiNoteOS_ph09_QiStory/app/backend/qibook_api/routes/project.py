"""Project pack/unpack and portability routes."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from typing import Dict, Any
import json
import zipfile
import shutil
from pathlib import Path
from datetime import datetime
import tempfile

from utils.db import get_db_connection, json_serialize, json_deserialize
from utils.config import VAULT_ROOT
from services.retrieval import vector_store

router = APIRouter(prefix="/api/books", tags=["project"])


@router.post("/{book_id}/pack")
async def pack_project(book_id: str):
    """Pack a project into a portable zip file."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get book
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        raise HTTPException(status_code=404, detail="Book not found")
    book = dict(book)
    
    # Get outline nodes
    cursor.execute("SELECT * FROM outline_nodes WHERE book_id = ?", (book_id,))
    nodes = [dict(row) for row in cursor.fetchall()]
    
    # Get draft sections
    node_ids = [n["id"] for n in nodes]
    drafts = []
    if node_ids:
        placeholders = ",".join(["?"] * len(node_ids))
        cursor.execute(f"""
            SELECT * FROM draft_sections
            WHERE outline_node_id IN ({placeholders})
        """, node_ids)
        drafts = [dict(row) for row in cursor.fetchall()]
    
    # Get final context
    cursor.execute("SELECT * FROM final_context WHERE book_id = ?", (book_id,))
    final_context = cursor.fetchone()
    final_context = dict(final_context) if final_context else None
    
    conn.close()
    
    # Create manifest
    manifest = {
        "book_id": book_id,
        "working_title": book["working_title"],
        "created_at": book["created_at"],
        "schema_version": "0.1.0",
        "embeddings_present": vector_store._table is not None,
        "files": [],
        "packed_at": datetime.utcnow().isoformat(),
    }
    
    # Create temp zip
    zip_path = VAULT_ROOT / f"exports" / f"{book_id}_pack.zip"
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add manifest
        zipf.writestr("manifest.json", json.dumps(manifest, indent=2))
        
        # Add book data
        zipf.writestr("book.json", json.dumps(book, indent=2))
        zipf.writestr("outline.json", json.dumps(nodes, indent=2))
        zipf.writestr("drafts.json", json.dumps(drafts, indent=2))
        if final_context:
            zipf.writestr("final_context.json", json.dumps(final_context, indent=2))
        
        # Add raw items (if accessible)
        raw_dir = VAULT_ROOT / "projects" / book_id / "raw"
        if raw_dir.exists():
            for file_path in raw_dir.rglob("*"):
                if file_path.is_file():
                    arcname = f"raw/{file_path.relative_to(raw_dir)}"
                    zipf.write(file_path, arcname)
                    manifest["files"].append(arcname)
    
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename=f"{book['working_title'].replace(' ', '_')}_pack.zip"
    )


@router.post("/import")
async def import_project(file: UploadFile = File(...)):
    """Import a packed project from uploaded zip file."""
    # Save uploaded file to temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_path = Path(tmp_file.name)
    
    try:
        with zipfile.ZipFile(tmp_path, 'r') as zipf:
            # Read manifest
            manifest_data = zipf.read("manifest.json")
            manifest = json.loads(manifest_data)
            
            # Read book data
            book_data = json.loads(zipf.read("book.json"))
            nodes_data = json.loads(zipf.read("outline.json"))
            drafts_data = json.loads(zipf.read("drafts.json"))
            
            # Import into database
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Insert book (use existing ID or generate new)
            book_id = book_data["id"]
            cursor.execute("""
                INSERT OR REPLACE INTO book_projects (
                    id, working_title, focus, purpose, audience,
                    length_target_words, chapter_count, status,
                    created_at, updated_at, style_anchor
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                book_id,
                book_data["working_title"],
                book_data.get("focus"),
                book_data.get("purpose"),
                book_data.get("audience"),
                book_data.get("length_target_words"),
                book_data.get("chapter_count"),
                book_data.get("status", "proposing"),
                book_data.get("created_at", datetime.utcnow().isoformat()),
                datetime.utcnow().isoformat(),
                book_data.get("style_anchor"),
            ))
            
            # Insert nodes
            for node in nodes_data:
                cursor.execute("""
                    INSERT OR REPLACE INTO outline_nodes (
                        id, book_id, parent_id, node_type, title, goal,
                        order_index, status, word_target, metadata_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    node["id"],
                    book_id,
                    node.get("parent_id"),
                    node["node_type"],
                    node["title"],
                    node.get("goal"),
                    node["order_index"],
                    node["status"],
                    node.get("word_target"),
                    node.get("metadata_json"),
                ))
            
            # Insert drafts
            for draft in drafts_data:
                cursor.execute("""
                    INSERT OR REPLACE INTO draft_sections (
                        id, outline_node_id, draft_text, draft_version,
                        status, content_hash, word_count, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    draft["id"],
                    draft["outline_node_id"],
                    draft["draft_text"],
                    draft["draft_version"],
                    draft["status"],
                    draft.get("content_hash"),
                    draft.get("word_count"),
                    draft["created_at"],
                ))
            
            conn.commit()
            conn.close()
            
            # Extract raw files
            raw_dir = VAULT_ROOT / "projects" / book_id / "raw"
            raw_dir.mkdir(parents=True, exist_ok=True)
            
            for file_info in zipf.infolist():
                if file_info.filename.startswith("raw/"):
                    zipf.extract(file_info, raw_dir.parent)
        
        result = {
            "message": "Project imported",
            "book_id": book_id,
            "manifest": manifest
        }
    finally:
        # Clean up temp file
        if tmp_path.exists():
            tmp_path.unlink()
    
    return result


@router.post("/{book_id}/rebuild-embeddings")
async def rebuild_embeddings(book_id: str):
    """Rebuild vector index for a book's chunks."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all chunks for this book's raw items
    cursor.execute("""
        SELECT c.*, ri.id as raw_item_id, ri.type as raw_type
        FROM chunks c
        JOIN raw_items ri ON c.raw_item_id = ri.id
        WHERE ri.id IN (
            SELECT DISTINCT raw_item_id
            FROM chunks
            WHERE raw_item_id IN (
                SELECT id FROM raw_items
            )
        )
    """)
    
    chunks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    # Rebuild embeddings
    rebuilt = 0
    errors = []
    
    for chunk in chunks:
        try:
            await vector_store.upsert_chunk(
                chunk["id"],
                chunk["raw_item_id"],
                chunk["chunk_text"],
                chunk["raw_type"],
                f"Rebuilt chunk {chunk['id'][:8]}"
            )
            rebuilt += 1
        except Exception as e:
            errors.append({"chunk_id": chunk["id"], "error": str(e)})
    
    return {
        "message": "Embeddings rebuilt",
        "rebuilt": rebuilt,
        "total": len(chunks),
        "errors": errors
    }

