import typer
from pathlib import Path
from src.miniapp.logic import do_run, do_batch, do_combine, do_collect, do_undo, do_combine_drive

app = typer.Typer(add_completion=False)

@app.command()
def run(workdir: str = typer.Option(str(Path.cwd()), help="Folder containing MKVs")):
    do_run(Path(workdir))

@app.command()
def batch(workdir: str = typer.Option("S:\\", help="Folder containing subfolders with videos")):
    do_batch(Path(workdir))

@app.command()
def combine(
    workdir: str = typer.Option("S:\\", help="Quick combine videos without flipping - processes 0_Convert folder"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Show what would be processed without actually doing it"),
    no_ai: bool = typer.Option(False, "--no-ai", help="Disable AI human detection and process all videos")
):
    do_combine(Path(workdir), dry_run, no_ai)

@app.command()
def combine_drive(
    drive_path: str = typer.Option("G:\\stream\\My Drive\\Private_Media\\ALFREDO SUAREZ", help="Google Drive path containing videos to combine"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Show what would be processed without actually doing it")
):
    """Combine all videos from a Google Drive folder into one video titled with the folder name"""
    do_combine_drive(Path(drive_path), dry_run)

@app.command()
def hq_combine(
    workdir: str = typer.Option("S:\\", help="High-quality combine videos - processes 0_Convert folder"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Show what would be processed without actually doing it"),
    no_ai: bool = typer.Option(False, "--no-ai", help="Disable AI human detection and process all videos")
):
    """High-quality video processing that preserves and enhances audio/video quality"""
    from src.miniapp.hq_logic import do_hq_combine
    do_hq_combine(Path(workdir), dry_run, no_ai)

@app.command()
def flip(
    workdir: str = typer.Option("S:\\", help="Root directory containing 1_flip folder"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Show what would be processed without actually doing it")
):
    """Flip all videos in the 1_flip folder"""
    from flip_videos import flip
    flip(workdir, dry_run)

@app.command()
def collect(workdir: str = typer.Option("S:\\", help="Move all .mp4 files from subfolders to root")):
    do_collect(Path(workdir))

@app.command()
def undo(workdir: str = typer.Option(str(Path.cwd()), help="Folder containing logs to undo")):
    do_undo(Path(workdir))

@app.command()
def idle(
    idle_minutes: int = typer.Option(5, "--idle-minutes", help="Minutes of inactivity before starting processing"),
    active_seconds: int = typer.Option(60, "--active-seconds", help="Seconds of activity before stopping processing")
):
    """Start idle detection - automatically process videos when system is idle"""
    from src.miniapp.idle_detector import IdleDetector
    detector = IdleDetector(idle_threshold=idle_minutes*60, active_threshold=active_seconds)
    detector.start_monitoring()

if __name__ == "__main__":
    app()
