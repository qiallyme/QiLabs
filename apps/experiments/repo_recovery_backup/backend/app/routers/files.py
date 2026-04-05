"""File upload + ingestion router."""

import hashlib
import io
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from app.deps import get_current_user, get_service_client

router = APIRouter()

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200


def _chunk_text(text: str) -> list[tuple[int, str, int, int]]:
    chunks = []
    start = 0
    idx = 0
    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        if end < len(text):
            last_period = text.rfind(". ", start, end)
            if last_period > start + CHUNK_SIZE // 2:
                end = last_period + 2
        chunk = text[start:end].strip()
        if chunk:
            chunks.append((idx, chunk, start, end))
            idx += 1
        start = end - CHUNK_OVERLAP if end - CHUNK_OVERLAP > start else end
        if start >= len(text):
            break
    return chunks


def _extract_pdf(content: bytes) -> tuple[str, int]:
    try:
        import fitz
        doc = fitz.open(stream=content, filetype="pdf")
        pages = [page.get_text() for page in doc]
        doc.close()
        return "\n".join(pages), len(pages)
    except Exception as e:
        return f"[PDF extraction failed: {e}]", 0


def _extract_text(filename: str, content: bytes) -> tuple[str, int]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "pdf":
        return _extract_pdf(content)
    elif ext in ("txt", "md", "csv", "log"):
        for enc in ("utf-8", "latin-1", "cp1252"):
            try:
                return content.decode(enc), 1
            except Exception:
                continue
        return "[Could not read file]", 0
    elif ext == "docx":
        try:
            import zipfile
            import xml.etree.ElementTree as ET
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                xml_content = z.read("word/document.xml")
            root = ET.fromstring(xml_content)
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            paras = root.findall(".//w:p", ns)
            lines = []
            for p in paras:
                texts = [t.text or "" for t in p.findall(".//w:t", ns)]
                lines.append("".join(texts))
            return "\n".join(lines), len(lines) // 40 + 1
        except Exception as e:
            return f"[DOCX extraction failed: {e}]", 0
    return f"[Unsupported file type: {filename}]", 0


MIME_MAP = {
    "pdf": "application/pdf", "png": "image/png", "jpg": "image/jpeg",
    "jpeg": "image/jpeg", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "txt": "text/plain", "md": "text/markdown", "csv": "text/csv",
}


@router.get("")
async def list_files(matter_id: str, category: Optional[str] = None, user: dict = Depends(get_current_user)):
    db = get_service_client()
    q = db.table("file_registry").select("*").eq("matter_id", matter_id)
    if category:
        q = q.eq("category", category)
    result = q.order("created_at", desc=True).execute()
    return result.data


@router.post("/upload", status_code=201)
async def upload_file(
    matter_id: str,
    file: UploadFile = File(...),
    category: str = "inbox",
    user: dict = Depends(get_current_user),
):
    db = get_service_client()
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()

    # Check for duplicate
    existing = db.table("file_registry").select("id").eq("matter_id", matter_id).eq("content_hash", file_hash).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="File already uploaded (duplicate hash)")

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""
    mime = MIME_MAP.get(ext, file.content_type or "application/octet-stream")

    # Upload to Supabase Storage
    storage_path = f"{matter_id}/{file_hash}/{file.filename}"
    try:
        db.storage.from_("case-files").upload(storage_path, content, {"content-type": mime})
    except Exception:
        pass  # Storage bucket may not exist yet — still register the file

    # Register file
    file_data = {
        "matter_id": matter_id,
        "filename": file.filename or "unknown",
        "relative_path": storage_path,
        "storage_path": storage_path,
        "category": category,
        "mime_type": mime,
        "file_size": len(content),
        "content_hash": file_hash,
    }
    file_result = db.table("file_registry").insert(file_data).execute()
    if not file_result.data:
        raise HTTPException(status_code=500, detail="Failed to register file")

    file_id = file_result.data[0]["id"]

    # Extract text and ingest
    text, page_count = _extract_text(file.filename or "", content)
    doc_data = {
        "matter_id": matter_id,
        "file_id": file_id,
        "title": file.filename or "Unknown",
        "doc_type": "other",
        "page_count": page_count,
        "extracted_text": text,
    }
    doc_result = db.table("documents").insert(doc_data).execute()
    doc_id = doc_result.data[0]["id"] if doc_result.data else None

    chunk_count = 0
    if doc_id and text and not text.startswith("["):
        chunks = _chunk_text(text)
        chunk_rows = [
            {
                "document_id": doc_id,
                "file_id": file_id,
                "chunk_index": idx,
                "chunk_text": ct,
                "char_start": cs,
                "char_end": ce,
            }
            for idx, ct, cs, ce in chunks
        ]
        if chunk_rows:
            db.table("text_chunks").insert(chunk_rows).execute()
            chunk_count = len(chunk_rows)

    # Mark as ingested
    db.table("file_registry").update({"ingested": True, "ingested_at": "now()"}).eq("id", file_id).execute()

    return {
        "file_id": file_id,
        "doc_id": doc_id,
        "chunks": chunk_count,
        "filename": file.filename,
    }
