"""API routes for raw items ingestion."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Optional
from pydantic import BaseModel

from services.ingest import create_raw_item, get_raw_item, list_raw_items, detect_type
from services.extract import extract_text

router = APIRouter(prefix="/api/raw-items", tags=["raw-items"])


class RawItemCreate(BaseModel):
    type: str
    source_name: Optional[str] = None
    title: Optional[str] = None
    text_content: Optional[str] = None
    file_path: Optional[str] = None
    metadata: Optional[dict] = None


class RawItemPaste(BaseModel):
    text: str
    title: Optional[str] = None
    source_name: Optional[str] = None


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file and create a raw item."""
    import tempfile
    import shutil
    from pathlib import Path
    from utils.config import VAULT_ROOT
    
    # Save uploaded file temporarily
    file_type = detect_type(file.filename, file.content_type)
    project_raw_dir = VAULT_ROOT / "projects" / "default" / "raw"
    project_raw_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = project_raw_dir / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    # Extract text if possible
    text_content = None
    try:
        text_content = await extract_text(str(file_path), file_type)
    except Exception as e:
        # Log error but continue
        print(f"Extraction error: {e}")
    
    # Create raw item
    item_id = await create_raw_item(
        type=file_type,
        source_name=file.filename,
        title=file.filename,
        text_content=text_content,
        file_path=str(file_path),
        metadata={"content_type": file.content_type}
    )
    
    return {"id": item_id, "type": file_type, "file_path": str(file_path)}


@router.post("/paste")
async def paste_text(data: RawItemPaste):
    """Create a raw item from pasted text."""
    item_id = await create_raw_item(
        type="note",
        source_name=data.source_name or "pasted",
        title=data.title or "Pasted Text",
        text_content=data.text,
        metadata={"source": "paste"}
    )
    
    return {"id": item_id}


@router.get("")
async def get_raw_items(limit: int = 100, offset: int = 0):
    """List raw items."""
    items = list_raw_items(limit=limit, offset=offset)
    return {"items": items, "count": len(items)}


@router.get("/{item_id}")
async def get_item(item_id: str):
    """Get a specific raw item."""
    item = get_raw_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Raw item not found")
    return item


@router.post("/{item_id}/process")
async def process_raw_item(item_id: str):
    """Process a raw item into chunks and generate embeddings."""
    from services.chunk import create_chunks_for_raw_item
    from services.retrieval import vector_store
    from utils.db import get_db_connection
    
    # Get raw item
    item = get_raw_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Raw item not found")
    
    if not item.get("text_content"):
        raise HTTPException(status_code=400, detail="Raw item has no text content to process")
    
    # Check if chunks already exist
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM chunks WHERE raw_item_id = ?", (item_id,))
    existing_count = cursor.fetchone()["count"]
    conn.close()
    
    if existing_count > 0:
        return {
            "message": "Raw item already processed",
            "chunk_count": existing_count,
            "item_id": item_id
        }
    
    # Create chunks
    chunk_ids = create_chunks_for_raw_item(item_id, item["text_content"])
    
    # Generate embeddings for each chunk
    conn = get_db_connection()
    cursor = conn.cursor()
    processed = 0
    errors = []
    
    for chunk_id in chunk_ids:
        cursor.execute("SELECT chunk_text FROM chunks WHERE id = ?", (chunk_id,))
        chunk_row = cursor.fetchone()
        if chunk_row:
            try:
                await vector_store.upsert_chunk(
                    chunk_id,
                    item_id,
                    chunk_row["chunk_text"],
                    item.get("type", "note"),
                    item.get("title", "Untitled")
                )
                processed += 1
            except Exception as e:
                errors.append({"chunk_id": chunk_id, "error": str(e)})
    
    conn.close()
    
    return {
        "message": "Raw item processed",
        "chunk_count": len(chunk_ids),
        "embeddings_created": processed,
        "errors": errors,
        "item_id": item_id
    }


@router.post("/process-all")
async def process_all_raw_items():
    """Process all unprocessed raw items into chunks and generate embeddings."""
    from services.chunk import create_chunks_for_raw_item
    from services.retrieval import vector_store
    from utils.db import get_db_connection
    
    # Get all raw items with text_content but no chunks
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ri.*
        FROM raw_items ri
        LEFT JOIN chunks c ON ri.id = c.raw_item_id
        WHERE ri.text_content IS NOT NULL
        AND ri.text_content != ''
        AND c.id IS NULL
    """)
    unprocessed = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    if not unprocessed:
        return {
            "message": "All raw items already processed",
            "processed": 0,
            "total": 0
        }
    
    total_chunks = 0
    total_embeddings = 0
    errors = []
    
    for item in unprocessed:
        try:
            # Create chunks
            chunk_ids = create_chunks_for_raw_item(item["id"], item["text_content"])
            total_chunks += len(chunk_ids)
            
            # Generate embeddings
            conn = get_db_connection()
            cursor = conn.cursor()
            for chunk_id in chunk_ids:
                cursor.execute("SELECT chunk_text FROM chunks WHERE id = ?", (chunk_id,))
                chunk_row = cursor.fetchone()
                if chunk_row:
                    try:
                        await vector_store.upsert_chunk(
                            chunk_id,
                            item["id"],
                            chunk_row["chunk_text"],
                            item.get("type", "note"),
                            item.get("title", "Untitled")
                        )
                        total_embeddings += 1
                    except Exception as e:
                        errors.append({"chunk_id": chunk_id, "error": str(e)})
            conn.close()
        except Exception as e:
            errors.append({"item_id": item["id"], "error": str(e)})
    
    return {
        "message": "Processing complete",
        "items_processed": len(unprocessed),
        "chunks_created": total_chunks,
        "embeddings_created": total_embeddings,
        "errors": errors
    }

