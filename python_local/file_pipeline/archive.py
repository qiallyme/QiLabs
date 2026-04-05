"""Archive registration — assigns canonical identity to detected files.

Per blueprint §data_flow:
  1. Assign canonical ID (UUID)
  2. Assign short visible code (Q + 6 hex)
  3. Calculate SHA-256 checksum
  4. Resolve MIME type
  5. Normalize filename: {domain}_{name}_{QXXXXXX}.ext
"""

from __future__ import annotations

import hashlib
import os
import secrets
import shutil
import uuid
from pathlib import Path
from typing import Optional

from .config import (
    DEVICE_ID,
    AGENT_ID,
    INGEST_MODE,
    MIME_MAP,
    PROCESSING_DIR,
    SUPPORTED_EXTENSIONS,
)
from .models import ArchiveRecord, PipelineState


def _generate_short_code() -> str:
    """Generate Q + 6-hex-char human-visible code."""
    return "Q" + secrets.token_hex(3).upper()


def _compute_checksum(path: Path, chunk_size: int = 65_536) -> str:
    """SHA-256 hex digest of file contents."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def _resolve_mime(path: Path) -> str:
    ext = path.suffix.lower()
    return MIME_MAP.get(ext, "application/octet-stream")


def _normalize_filename(original: str, short_code: str, domain: str = "") -> str:
    """Build normalized filename: {domain}_{stem}_{short_code}.ext"""
    p = Path(original)
    stem = p.stem
    ext = p.suffix
    # Strip unsafe chars from stem
    safe_stem = "".join(c if c.isalnum() or c in "-_ " else "_" for c in stem).strip()
    safe_stem = safe_stem[:80]  # cap length
    if domain:
        return f"{domain}_{safe_stem}_{short_code}{ext}"
    return f"{safe_stem}_{short_code}{ext}"


def _move_to_processing(src: Path, normalized_name: str) -> Path:
    """Copy file into processing tier with normalized name."""
    dest = PROCESSING_DIR / normalized_name
    # Handle collisions
    if dest.exists():
        dest = PROCESSING_DIR / f"{uuid.uuid4().hex[:8]}_{normalized_name}"
    shutil.copy2(src, dest)
    return dest


def register_file(
    path: Path,
    domain: str = "",
    ingest_mode: str = "",
    source_device_id: str = "",
    source_agent_id: str = "",
) -> ArchiveRecord:
    """Register a detected file and return its canonical ArchiveRecord."""
    if not path.exists():
        raise FileNotFoundError(f"Cannot register missing file: {path}")

    ext = path.suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported file extension: {ext}")

    canonical_id = str(uuid.uuid4())
    short_code = _generate_short_code()
    checksum = _compute_checksum(path)
    mime_type = _resolve_mime(path)
    normalized_name = _normalize_filename(path.name, short_code, domain)
    storage_path = str(_move_to_processing(path, normalized_name))

    return ArchiveRecord(
        id=canonical_id,
        short_code=short_code,
        domain_prefix=domain,
        original_filename=path.name,
        normalized_filename=normalized_name,
        checksum=checksum,
        mime_type=mime_type,
        status=PipelineState.REGISTERED,
        storage_path=storage_path,
        source_device_id=source_device_id or DEVICE_ID,
        source_agent_id=source_agent_id or AGENT_ID,
        source_path=str(path),
        ingest_mode=ingest_mode or INGEST_MODE,
    )
