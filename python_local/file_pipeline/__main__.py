#!/usr/bin/env python3
"""Local ingestion pipeline — CLI entry point.

Usage:
    python -m file_pipeline watch              # Watch inbox for new files
    python -m file_pipeline scan               # One-shot scan of inbox
    python -m file_pipeline ingest <file>      # Ingest a single file
    python -m file_pipeline status             # Show pipeline config + status
"""

from __future__ import annotations

import argparse
import io
import logging
import sys
from pathlib import Path

# Fix Windows console encoding for Unicode characters
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("file_pipeline")


def cmd_watch(args: argparse.Namespace) -> None:
    from .watcher import run_watcher

    run_watcher(
        inbox=args.inbox,
        domain=args.domain,
        push_to_cloud=not args.local_only,
    )


def cmd_scan(args: argparse.Namespace) -> None:
    from .ingest import scan_inbox

    results = scan_inbox(
        inbox=Path(args.inbox) if args.inbox else None,
        domain=args.domain,
        push_to_cloud=not args.local_only,
    )
    ok = sum(1 for r in results if r.ok)
    fail = len(results) - ok
    print(f"\nScan complete: {ok} ingested, {fail} failed, {len(results)} total")
    for r in results:
        tag = "✓" if r.ok else "✗"
        print(
            f"  {tag} {r.short_code or '---'}  state={r.state.value}  error={r.error}"
        )


def cmd_ingest(args: argparse.Namespace) -> None:
    from .ingest import ingest_file

    path = Path(args.file)
    if not path.exists():
        log.error("File not found: %s", path)
        sys.exit(1)
    result = ingest_file(
        path,
        domain=args.domain,
        push_to_cloud=not args.local_only,
    )
    if result.ok:
        print(
            f"✓ {result.short_code}  state={result.state.value}  chunks={result.chunk_count}"
        )
    else:
        print(f"✗ FAILED: {result.error}")
        sys.exit(1)


def cmd_status(args: argparse.Namespace) -> None:
    from .config import (
        INBOX_DIR,
        PROCESSING_DIR,
        REVIEWED_DIR,
        FAILED_DIR,
        EXTRACTED_DIR,
        EMBEDDINGS_CACHE_DIR,
        SUPABASE_URL,
        DEVICE_ID,
        EMBEDDING_MODEL,
    )

    print("QiOS Local Ingestion Pipeline")
    print("=" * 50)
    print(f"  Inbox:      {INBOX_DIR}")
    print(f"  Processing: {PROCESSING_DIR}")
    print(f"  Reviewed:   {REVIEWED_DIR}")
    print(f"  Failed:     {FAILED_DIR}")
    print(f"  Extracted:  {EXTRACTED_DIR}")
    print(f"  Embed cache:{EMBEDDINGS_CACHE_DIR}")
    print()
    print(f"  Supabase:   {'connected' if SUPABASE_URL else 'NOT SET'}")
    print(f"  Device ID:  {DEVICE_ID or 'NOT SET'}")
    print(f"  Embed model:{EMBEDDING_MODEL}")
    print()

    # Count files in inbox
    inbox_files = list(INBOX_DIR.iterdir()) if INBOX_DIR.exists() else []
    print(f"  Files in inbox: {len(inbox_files)}")


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="file_pipeline",
        description="QiOS Local Ingestion Pipeline",
    )
    sub = parser.add_subparsers(dest="command")

    # watch
    p_watch = sub.add_parser("watch", help="Watch inbox for new files")
    p_watch.add_argument("--inbox", default=None, help="Inbox directory")
    p_watch.add_argument("--domain", default="", help="Domain namespace prefix")
    p_watch.add_argument("--local-only", action="store_true", help="Skip cloud push")
    p_watch.set_defaults(func=cmd_watch)

    # scan
    p_scan = sub.add_parser("scan", help="One-shot scan of inbox")
    p_scan.add_argument("--inbox", default=None, help="Inbox directory")
    p_scan.add_argument("--domain", default="", help="Domain namespace prefix")
    p_scan.add_argument("--local-only", action="store_true", help="Skip cloud push")
    p_scan.set_defaults(func=cmd_scan)

    # ingest
    p_ingest = sub.add_parser("ingest", help="Ingest a single file")
    p_ingest.add_argument("file", help="Path to file")
    p_ingest.add_argument("--domain", default="", help="Domain namespace prefix")
    p_ingest.add_argument("--local-only", action="store_true", help="Skip cloud push")
    p_ingest.set_defaults(func=cmd_ingest)

    # status
    p_status = sub.add_parser("status", help="Show pipeline config and status")
    p_status.set_defaults(func=cmd_status)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
