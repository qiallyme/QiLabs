"""
QiArchive Pipeline — Scan Module
Scans a directory for new files, assigns a canonical run ID,
and prepares a manifest list for the ingest pipeline.
"""

import os
import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import typer
from rich.console import Console
from rich.table import Table

app = typer.Typer()
console = Console()

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def scan_directory(inbox: Path, extensions: Optional[list[str]] = None) -> list[dict]:
    """Scan inbox directory and return list of file records."""
    records = []
    for f in inbox.rglob("*"):
        if not f.is_file():
            continue
        if extensions and f.suffix.lower() not in extensions:
            continue
        record = {
            "scan_id": str(uuid.uuid4()),
            "original_path": str(f),
            "filename": f.name,
            "extension": f.suffix.lower(),
            "size_bytes": f.stat().st_size,
            "checksum": sha256_file(f),
            "scanned_at": datetime.now(timezone.utc).isoformat(),
            "status": "scanned",
        }
        records.append(record)
    return records

@app.command()
def main(
    inbox: Path = typer.Option(
        Path(os.environ.get("QI_INBOX_DIR", "C:/QiData/inbox")),
        help="Inbox directory to scan"
    ),
    output: Optional[Path] = typer.Option(None, help="Write manifest JSON to this path"),
):
    """Scan the inbox and produce a file manifest."""
    console.print(f"[green]Scanning:[/green] {inbox}")

    if not inbox.exists():
        console.print(f"[red]ERROR:[/red] Inbox does not exist: {inbox}")
        raise typer.Exit(1)

    records = scan_directory(inbox)
    console.print(f"Found [bold]{len(records)}[/bold] files")

    table = Table(title="Scan Results")
    table.add_column("Filename", style="cyan")
    table.add_column("Size", justify="right")
    table.add_column("Checksum (8 chars)")
    for r in records:
        table.add_row(r["filename"], str(r["size_bytes"]), r["checksum"][:8])
    console.print(table)

    if output:
        output.write_text(json.dumps(records, indent=2))
        console.print(f"[green]Manifest written to:[/green] {output}")
    else:
        print(json.dumps(records, indent=2))

if __name__ == "__main__":
    app()
