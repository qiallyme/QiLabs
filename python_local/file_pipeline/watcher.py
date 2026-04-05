"""Filesystem watcher — monitors inbox for new files and triggers ingestion."""

from __future__ import annotations

import logging
from pathlib import Path
from time import sleep

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

from .config import INBOX_DIR, SUPPORTED_EXTENSIONS
from .ingest import ingest_file

log = logging.getLogger(__name__)


class InboxHandler(FileSystemEventHandler):
    """Triggers ingestion when a new supported file lands in the inbox."""

    def __init__(self, domain: str = "", push_to_cloud: bool = True):
        super().__init__()
        self.domain = domain
        self.push_to_cloud = push_to_cloud

    def on_created(self, event: FileCreatedEvent) -> None:
        if event.is_directory:
            return
        path = Path(event.src_path)
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            log.debug("Ignoring unsupported file: %s", path.name)
            return
        # Small delay — file may still be writing
        sleep(0.5)
        log.info("New file detected: %s", path.name)
        ingest_file(path, domain=self.domain, push_to_cloud=self.push_to_cloud)


def run_watcher(
    inbox: Path | str | None = None,
    domain: str = "",
    push_to_cloud: bool = True,
) -> None:
    """Start watching the inbox directory (blocking)."""
    inbox = Path(inbox) if inbox else INBOX_DIR
    inbox.mkdir(parents=True, exist_ok=True)

    log.info("Starting file watcher on %s", inbox)
    observer = Observer()
    handler = InboxHandler(domain=domain, push_to_cloud=push_to_cloud)
    observer.schedule(handler, str(inbox), recursive=False)
    observer.start()

    try:
        while True:
            sleep(1)
    except KeyboardInterrupt:
        log.info("Watcher stopped by user")
    finally:
        observer.stop()
        observer.join()
