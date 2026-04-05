"""Supabase API client — pushes canonical records to qiarchive tables.

Uses the supabase-py SDK with the service-role key (bypasses RLS)
for backend ingestion writes.
"""

from __future__ import annotations

import logging
from typing import Optional

from supabase import create_client, Client

from .config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from .models import ArchiveRecord, ChunkRecord, IngestJob, PipelineState

log = logging.getLogger(__name__)

_client: Optional[Client] = None


def get_client() -> Client:
    """Lazy-init singleton Supabase client."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise EnvironmentError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
            )
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


def upsert_archive_record(record: ArchiveRecord) -> dict:
    """Insert or update a record in qiarchive.archive_files."""
    supa = get_client()
    payload = record.model_dump()
    payload["created_at"] = payload["created_at"]
    payload["updated_at"] = payload["updated_at"]
    result = (
        supa.table("qiarchive.archive_files")
        .upsert(payload, on_conflict="id")
        .execute()
    )
    log.info("Upserted archive_files id=%s short_code=%s", record.id, record.short_code)
    return result.data[0] if result.data else {}


def update_archive_status(archive_id: str, status: PipelineState, **extra) -> None:
    """Update just the status (and optional fields) on an archive record."""
    supa = get_client()
    payload = {"status": status.value, **extra}
    supa.table("qiarchive.archive_files").update(payload).eq("id", archive_id).execute()
    log.info("Updated archive_files id=%s status=%s", archive_id, status.value)


def upsert_chunk_records(records: list[ChunkRecord]) -> None:
    """Batch-insert chunk records into qiarchive.archive_chunks."""
    if not records:
        return
    supa = get_client()
    payloads = [r.model_dump() for r in records]
    supa.table("qiarchive.archive_chunks").upsert(payloads).execute()
    log.info("Upserted %d chunks", len(payloads))


def insert_ingest_job(job: IngestJob) -> None:
    """Insert a pipeline tracking row into qiarchive.ingest_jobs."""
    supa = get_client()
    supa.table("qiarchive.ingest_jobs").insert(job.model_dump()).execute()


def update_ingest_job(job_id: str, state: PipelineState, error: str = "") -> None:
    """Update ingest_jobs state."""
    supa = get_client()
    payload = {
        "state": state.value,
        "updated_at": __import__("datetime").datetime.utcnow().isoformat(),
    }
    if error:
        payload["error_message"] = error
    supa.table("qiarchive.ingest_jobs").update(payload).eq("id", job_id).execute()


def insert_file_history(
    archive_id: str, event_type: str, meta: dict | None = None
) -> None:
    """Append a lineage event to qiarchive.file_history."""
    supa = get_client()
    payload = {
        "archive_id": archive_id,
        "event_type": event_type,
        "meta": meta or {},
    }
    supa.table("qiarchive.file_history").insert(payload).execute()
