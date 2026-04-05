"""Canonical ingestion orchestrator — the core pipeline entry point.

Implements the blueprint-defined flow:
  detect → register → extract → enrich → chunk → embed → index → route
"""

from __future__ import annotations

import logging
import shutil
from pathlib import Path
from typing import Optional

from .archive import register_file
from .chunk import chunk_text
from .classify import classify_document
from .config import (
    FAILED_DIR,
    INBOX_DIR,
    REVIEWED_DIR,
    EXTRACTED_DIR,
    DEFAULT_CHUNK_SIZE,
    DEFAULT_CHUNK_OVERLAP,
)
from .embed import embed_chunks
from .extract import extract_text
from .models import (
    ArchiveRecord,
    ChunkRecord,
    IngestJob,
    IngestResult,
    PipelineState,
)
from .state_machine import advance, on_failure

log = logging.getLogger(__name__)

# Lazy imports for Supabase (optional — pipeline can run without cloud)
try:
    from .api_client import (
        upsert_archive_record,
        update_archive_status,
        upsert_chunk_records,
        insert_ingest_job,
        update_ingest_job,
        insert_file_history,
    )

    _HAS_CLOUD = True
except Exception:
    _HAS_CLOUD = False


def ingest_file(
    path: Path,
    domain: str = "",
    push_to_cloud: bool = True,
) -> IngestResult:
    """Run a single file through the full canonical ingestion pipeline.

    Args:
        path: Absolute path to the source file.
        domain: Optional domain namespace prefix.
        push_to_cloud: If True, push records to Supabase. Set False for
            offline / local-only runs.
    """
    job: Optional[IngestJob] = None

    try:
        # ── 1. DETECT / REGISTER ──────────────────────────────────────
        log.info("[1/6] Registering %s", path.name)
        record = register_file(path, domain=domain)
        state = advance(PipelineState.DETECTED, PipelineState.REGISTERED)
        record.status = state

        if push_to_cloud and _HAS_CLOUD:
            upsert_archive_record(record)
            job = IngestJob(archive_id=record.id, state=state)
            insert_ingest_job(job)
            insert_file_history(record.id, "registered")

        # ── 2. EXTRACT TEXT ───────────────────────────────────────────
        log.info("[2/6] Extracting text from %s", record.normalized_filename)
        extracted = extract_text(Path(record.storage_path))
        state = advance(state, PipelineState.EXTRACTED)
        record.status = state
        record.extracted_text = extracted.get("text", "")

        # Persist extracted text for debugging
        if record.extracted_text:
            text_file = EXTRACTED_DIR / f"{record.id}.txt"
            text_file.write_text(record.extracted_text, encoding="utf-8")

        if push_to_cloud and _HAS_CLOUD:
            update_archive_status(record.id, state)
            if job:
                update_ingest_job(job.id, state)

        # ── 3. ENRICH METADATA ────────────────────────────────────────
        log.info("[3/6] Enriching metadata for %s", record.short_code)
        classification = classify_document(
            record.original_filename,
            record.mime_type,
            record.extracted_text[:500],
        )
        state = advance(state, PipelineState.ENRICHED)
        record.status = state

        if push_to_cloud and _HAS_CLOUD:
            update_archive_status(
                record.id,
                state,
                metadata={"classification": classification},
            )
            if job:
                update_ingest_job(job.id, state)

        # ── 4. CHUNK ──────────────────────────────────────────────────
        log.info("[4/6] Chunking text (%d chars)", len(record.extracted_text))
        raw_chunks = chunk_text(
            record.extracted_text,
            chunk_size=DEFAULT_CHUNK_SIZE,
            overlap=DEFAULT_CHUNK_OVERLAP,
        )
        state = advance(state, PipelineState.CHUNKED)
        record.status = state

        if push_to_cloud and _HAS_CLOUD:
            update_archive_status(record.id, state)
            if job:
                update_ingest_job(job.id, state)

        # ── 5. EMBED ──────────────────────────────────────────────────
        log.info("[5/6] Embedding %d chunks", len(raw_chunks))
        chunk_texts = [c["text"] for c in raw_chunks]
        if chunk_texts:
            vectors = embed_chunks(chunk_texts)
        else:
            vectors = []

        chunk_records = [
            ChunkRecord(
                archive_id=record.id,
                chunk_index=i,
                text=raw_chunks[i]["text"],
                embedding=vectors[i] if i < len(vectors) else [],
            )
            for i in range(len(raw_chunks))
        ]

        state = advance(state, PipelineState.EMBEDDED)
        record.status = state

        # ── 6. INDEX (push to pgvector) ───────────────────────────────
        log.info("[6/6] Indexing %d chunks", len(chunk_records))
        if push_to_cloud and _HAS_CLOUD and chunk_records:
            upsert_chunk_records(chunk_records)

        state = advance(state, PipelineState.INDEXED)
        record.status = state

        if push_to_cloud and _HAS_CLOUD:
            update_archive_status(record.id, state)
            if job:
                update_ingest_job(job.id, state)
            insert_file_history(record.id, "indexed")

        # Move to reviewed tier
        _move_to_reviewed(record)

        log.info(
            "✓ Ingested %s → %s (%d chunks)",
            path.name,
            record.short_code,
            len(chunk_records),
        )

        return IngestResult(
            ok=True,
            archive_id=record.id,
            short_code=record.short_code,
            state=state,
            chunk_count=len(chunk_records),
        )

    except Exception as exc:
        log.exception("Ingestion failed for %s", path.name)
        _handle_failure(path, exc, job)
        return IngestResult(
            ok=False,
            state=PipelineState.FAILED,
            error=str(exc),
        )


def _move_to_reviewed(record: ArchiveRecord) -> None:
    """Copy processed file to reviewed tier."""
    src = Path(record.storage_path)
    if src.exists():
        dest = REVIEWED_DIR / record.normalized_filename
        try:
            shutil.copy2(src, dest)
        except Exception:
            pass  # non-fatal


def _handle_failure(
    path: Path,
    exc: Exception,
    job: Optional[IngestJob] = None,
) -> None:
    """Move failed file to failed tier and update tracking."""
    # Move file to failed dir
    try:
        dest = FAILED_DIR / path.name
        if path.exists() and not dest.exists():
            shutil.copy2(path, dest)
    except Exception:
        pass

    if job and _HAS_CLOUD:
        try:
            update_ingest_job(job.id, PipelineState.FAILED, str(exc))
        except Exception:
            pass


def scan_inbox(
    inbox: Path | None = None,
    domain: str = "",
    push_to_cloud: bool = True,
) -> list[IngestResult]:
    """One-shot scan: ingest every supported file in the inbox."""
    inbox = inbox or INBOX_DIR
    results: list[IngestResult] = []

    for entry in sorted(inbox.iterdir()):
        if entry.is_file() and entry.suffix.lower() in {
            ".pdf",
            ".png",
            ".jpg",
            ".jpeg",
            ".docx",
            ".txt",
            ".md",
            ".csv",
        }:
            log.info("Scanning: %s", entry.name)
            result = ingest_file(entry, domain=domain, push_to_cloud=push_to_cloud)
            results.append(result)

    return results
