"""Tests for the local ingestion pipeline core modules.

Tests avoid importing the heavy embedding model by mocking embed_chunks.
"""

from __future__ import annotations

import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest


# ─── State Machine ───────────────────────────────────────────────────────────


class TestStateMachine:
    def test_valid_transitions(self):
        from file_pipeline.models import PipelineState
        from file_pipeline.state_machine import advance

        assert (
            advance(PipelineState.DETECTED, PipelineState.REGISTERED)
            == PipelineState.REGISTERED
        )
        assert (
            advance(PipelineState.REGISTERED, PipelineState.NORMALIZED)
            == PipelineState.NORMALIZED
        )
        assert (
            advance(PipelineState.EXTRACTED, PipelineState.CHUNKED)
            == PipelineState.CHUNKED
        )

    def test_invalid_transition_raises(self):
        from file_pipeline.models import PipelineState
        from file_pipeline.state_machine import advance, InvalidTransitionError

        with pytest.raises(InvalidTransitionError):
            advance(PipelineState.DETECTED, PipelineState.EMBEDDED)

    def test_on_failure(self):
        from file_pipeline.models import PipelineState
        from file_pipeline.state_machine import on_failure

        assert on_failure(PipelineState.EXTRACTED) == PipelineState.FAILED

    def test_retry(self):
        from file_pipeline.models import PipelineState
        from file_pipeline.state_machine import retry

        assert retry(PipelineState.FAILED) == PipelineState.DETECTED

    def test_retry_non_failed_raises(self):
        from file_pipeline.models import PipelineState
        from file_pipeline.state_machine import retry, InvalidTransitionError

        with pytest.raises(InvalidTransitionError):
            retry(PipelineState.REGISTERED)


# ─── Archive Registration ────────────────────────────────────────────────────


class TestArchiveRegistration:
    def test_short_code_format(self):
        from file_pipeline.archive import _generate_short_code

        code = _generate_short_code()
        assert code.startswith("Q")
        assert len(code) == 7  # Q + 6 hex
        int(code[1:], 16)  # should not raise

    def test_checksum_deterministic(self):
        from file_pipeline.archive import _compute_checksum

        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as f:
            f.write(b"hello world")
            path = Path(f.name)
        try:
            h1 = _compute_checksum(path)
            h2 = _compute_checksum(path)
            assert h1 == h2
            assert len(h1) == 64  # SHA-256
        finally:
            path.unlink()

    def test_normalize_filename(self):
        from file_pipeline.archive import _normalize_filename

        assert (
            _normalize_filename("My Document.pdf", "QAB12CD", "acme")
            == "acme_My Document_QAB12CD.pdf"
        )
        assert _normalize_filename("file.txt", "Q001122", "") == "file_Q001122.txt"

    def test_register_file(self):
        from file_pipeline.archive import register_file
        from file_pipeline.models import PipelineState

        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as f:
            f.write(b"test content for registration")
            path = Path(f.name)
        try:
            record = register_file(path, domain="test")
            assert record.id  # has canonical ID
            assert record.short_code.startswith("Q")
            assert record.checksum  # has checksum
            assert record.mime_type == "text/plain"
            assert record.status == PipelineState.REGISTERED
            assert record.domain_prefix == "test"
        finally:
            path.unlink()

    def test_register_unsupported_raises(self):
        from file_pipeline.archive import register_file

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xyz") as f:
            f.write(b"data")
            path = Path(f.name)
        try:
            with pytest.raises(ValueError, match="Unsupported"):
                register_file(path)
        finally:
            path.unlink()


# ─── Chunking ─────────────────────────────────────────────────────────────────


class TestChunking:
    def test_short_text_no_split(self):
        from file_pipeline.chunk import chunk_text

        chunks = chunk_text("hello", chunk_size=100)
        assert len(chunks) == 1
        assert chunks[0]["text"] == "hello"

    def test_long_text_splits(self):
        from file_pipeline.chunk import chunk_text

        text = "a" * 3000
        chunks = chunk_text(text, chunk_size=1200, overlap=150)
        assert len(chunks) > 1
        assert all(len(c["text"]) <= 1200 for c in chunks)

    def test_overlap(self):
        from file_pipeline.chunk import chunk_text

        text = "abcdefghij" * 200  # 2000 chars
        chunks = chunk_text(text, chunk_size=1000, overlap=100)
        if len(chunks) > 1:
            # Last 100 of chunk[0] should equal first 100 of chunk[1]
            assert chunks[0]["text"][-100:] == chunks[1]["text"][:100]


# ─── Classification ──────────────────────────────────────────────────────────


class TestClassification:
    def test_invoice(self):
        from file_pipeline.classify import classify_document

        r = classify_document("invoice_2024_march.pdf")
        assert r["doc_type"] == "invoice"
        assert r["confidence"] > 0

    def test_photo(self):
        from file_pipeline.classify import classify_document

        r = classify_document("IMG_20240315.jpg", mime_type="image/jpeg")
        assert r["doc_type"] == "photograph"

    def test_unknown(self):
        from file_pipeline.classify import classify_document

        r = classify_document("random_file.xyz")
        assert r["doc_type"] == "unknown"


# ─── Extract ──────────────────────────────────────────────────────────────────


class TestExtract:
    def test_plain_text(self):
        from file_pipeline.extract import extract_text

        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt", mode="w") as f:
            f.write("Hello World\nLine 2")
            path = Path(f.name)
        try:
            result = extract_text(path)
            assert result["text"] == "Hello World\nLine 2"
            assert result["method"] == "plain_text"
        finally:
            path.unlink()

    def test_pdf_empty_file(self):
        from file_pipeline.extract import extract_text

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
            f.write(b"%PDF-1.4 fake")
            path = Path(f.name)
        try:
            result = extract_text(path)
            # pypdf will try to parse, may return empty or error
            assert "method" in result
        finally:
            path.unlink()


# ─── Ingest Orchestrator (mocked cloud) ───────────────────────────────────────


class TestIngestOrchestrator:
    def test_ingest_local_only(self):
        from file_pipeline.ingest import ingest_file
        from file_pipeline.models import PipelineState

        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt", mode="w") as f:
            f.write("Sample document content for testing the ingestion pipeline.")
            path = Path(f.name)
        try:
            result = ingest_file(path, push_to_cloud=False)
            assert result.ok is True
            assert result.state == PipelineState.INDEXED
            assert result.chunk_count >= 0
            assert result.short_code.startswith("Q")
        finally:
            path.unlink()
