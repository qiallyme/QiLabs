"""
QiArchive Pipeline — Repair Module
Finds records in qiarchive.ingest_jobs with status='failed'
and requeues them for retry.
"""

import os
from datetime import datetime, timezone
from rich.console import Console
import typer

app = typer.Typer()
console = Console()

@app.command()
def main(
    dry_run: bool = typer.Option(False, "--dry-run", help="List failed jobs without retrying")
):
    """Find and retry failed archive jobs."""
    console.print("[yellow]Repair:[/yellow] Checking for failed ingest jobs...")

    try:
        from supabase import create_client
        url = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        db = create_client(url, key)

        res = db.schema("qiarchive").from_("ingest_jobs").select("*").eq("status", "failed").execute()
        jobs = res.data

        if not jobs:
            console.print("[green]No failed jobs found.[/green]")
            return

        console.print(f"Found [bold]{len(jobs)}[/bold] failed job(s)")

        if dry_run:
            for j in jobs:
                console.print(f"  - {j.get('id')} | {j.get('file_name')} | {j.get('error_message', 'no message')}")
            return

        for j in jobs:
            db.schema("qiarchive").from_("ingest_jobs").update({
                "status": "queued",
                "retry_count": (j.get("retry_count") or 0) + 1,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", j["id"]).execute()
            console.print(f"  [green]Requeued:[/green] {j.get('id')}")

        console.print(f"[green]Done.[/green] {len(jobs)} job(s) requeued.")

    except KeyError as e:
        console.print(f"[red]Missing env var:[/red] {e}")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()
