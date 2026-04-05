"""Pydantic models for the local ingestion pipeline."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Optional

from pydantic import BaseModel, Field


class PipelineState(str, Enum):
    """Canonical pipeline states per blueprint §pipelines."""

    DETECTED = "detected"
    REGISTERED = "registered"
    NORMALIZED = "normalized"
    EXTRACTED = "extracted"
    ENRICHED = "enriched"
    CHUNKED = "chunked"
    EMBEDDED = "embedded"
    INDEXED = "indexed"
    REVIEW_PENDING = "review_pending"
    ROUTED = "routed"
    FINALIZED = "finalized"
    FAILED = "failed"


VALID_TRANSITIONS: dict[PipelineState, set[PipelineState]] = {
    PipelineState.DETECTED: {PipelineState.REGISTERED, PipelineState.FAILED},
    PipelineState.REGISTERED: {
        PipelineState.NORMALIZED,
        PipelineState.EXTRACTED,
        PipelineState.FAILED,
    },
    PipelineState.NORMALIZED: {PipelineState.EXTRACTED, PipelineState.FAILED},
    PipelineState.EXTRACTED: {
        PipelineState.ENRICHED,
        PipelineState.CHUNKED,
        PipelineState.FAILED,
    },
    PipelineState.ENRICHED: {PipelineState.CHUNKED, PipelineState.FAILED},
    PipelineState.CHUNKED: {PipelineState.EMBEDDED, PipelineState.FAILED},
    PipelineState.EMBEDDED: {PipelineState.INDEXED, PipelineState.FAILED},
    PipelineState.INDEXED: {
        PipelineState.ROUTED,
        PipelineState.REVIEW_PENDING,
        PipelineState.FAILED,
    },
    PipelineState.REVIEW_PENDING: {PipelineState.ROUTED, PipelineState.FAILED},
    PipelineState.ROUTED: {PipelineState.FINALIZED, PipelineState.FAILED},
    PipelineState.FAILED: {PipelineState.DETECTED},  # retry resets to detected
}


class ArchiveRecord(BaseModel):
    """Canonical archive file record — maps to qiarchive.archive_files."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    short_code: str = ""
    domain_prefix: str = ""
    original_filename: str = ""
    normalized_filename: str = ""
    checksum: str = ""
    mime_type: str = ""
    status: PipelineState = PipelineState.DETECTED
    storage_path: str = ""
    source_device_id: str = ""
    source_agent_id: str = ""
    source_path: str = ""
    ingest_mode: str = ""
    extracted_text: str = ""
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class ChunkRecord(BaseModel):
    """Single text chunk linked to an archive record — qiarchive.archive_chunks."""

    archive_id: str
    chunk_index: int
    text: str
    embedding: list[float] = Field(default_factory=list)


class IngestJob(BaseModel):
    """Pipeline state tracking — qiarchive.ingest_jobs."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    archive_id: str
    state: PipelineState = PipelineState.DETECTED
    error_message: str = ""
    retry_count: int = 0
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class IngestResult(BaseModel):
    """Result of a single file ingestion run."""

    ok: bool
    archive_id: str = ""
    short_code: str = ""
    state: PipelineState = PipelineState.DETECTED
    error: str = ""
    chunk_count: int = 0
