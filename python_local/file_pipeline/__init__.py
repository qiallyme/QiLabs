"""Local file ingestion pipeline — QiOS canonical intake.

Usage:
    # Watch inbox for new files
    from file_pipeline import run_watcher
    run_watcher()

    # One-shot ingest a single file
    from file_pipeline import ingest_file
    result = ingest_file(Path("path/to/file.pdf"))

    # Scan entire inbox
    from file_pipeline import scan_inbox
    results = scan_inbox()
"""

from .ingest import ingest_file, scan_inbox
from .watcher import run_watcher
from .models import ArchiveRecord, IngestResult, PipelineState
from .config import INBOX_DIR

__all__ = [
    "ingest_file",
    "scan_inbox",
    "run_watcher",
    "ArchiveRecord",
    "IngestResult",
    "PipelineState",
    "INBOX_DIR",
]
