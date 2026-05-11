#!/usr/bin/env python3
"""
Flip Videos Script
==================
Processes all videos in the 1_flip folder and flips them (corrects orientation).
"""

import typer
from pathlib import Path
import subprocess
from rich.console import Console

app = typer.Typer(add_completion=False)
con = Console()

def flip_video(input_path: Path, output_path: Path):
    """Flip a video horizontally and vertically"""
    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-vf", "hflip,vflip",  # Flip horizontally and vertically
        "-c:v", "h264", "-preset", "fast", "-crf", "23",  # Video codec
        "-c:a", "aac", "-b:a", "128k",  # Audio codec
        str(output_path)
    ]
    subprocess.run(cmd, check=True)

@app.command()
def flip(
    workdir: str = typer.Option("S:\\", help="Root directory containing 1_flip folder"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Show what would be processed without actually doing it")
):
    """Flip all videos in the 1_flip folder"""
    work_dir = Path(workdir)
    flip_dir = work_dir / "1_flip"
    
    if dry_run:
        con.print("[yellow]🔍 DRY RUN MODE - No files will be processed[/yellow]")
    
    if not flip_dir.exists():
        con.print(f"[red]Error: 1_flip folder not found at {flip_dir}[/red]")
        return
    
    # Find all video files in flip folder
    video_extensions = {'.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.media'}
    video_files = [f for f in flip_dir.iterdir() if f.is_file() and f.suffix.lower() in video_extensions]
    
    if not video_files:
        con.print("[yellow]No video files found in 1_flip folder.[/yellow]")
        return
    
    con.print(f"[cyan]Found {len(video_files)} videos to flip:[/cyan]")
    for i, video_file in enumerate(video_files, 1):
        con.print(f"  {i:02d}. {video_file.name}")
    
    if dry_run:
        con.print(f"[blue]Would flip {len(video_files)} videos[/blue]")
        return
    
    # Create done folder for flipped videos
    done_dir = work_dir / "5_Done"
    done_dir.mkdir(exist_ok=True)
    
    # Process each video
    successful = 0
    failed = 0
    
    for video_file in video_files:
        try:
            con.print(f"[cyan]Flipping: {video_file.name}[/cyan]")
            
            # Create output filename
            output_name = f"FLIPPED_{video_file.stem}.mp4"
            output_path = done_dir / output_name
            
            # Handle filename conflicts
            counter = 1
            while output_path.exists():
                output_name = f"FLIPPED_{video_file.stem}_{counter}.mp4"
                output_path = done_dir / output_name
                counter += 1
            
            # Flip the video
            flip_video(video_file, output_path)
            
            # Move original to trash
            trash_dir = work_dir / "4_Trash"
            trash_dir.mkdir(exist_ok=True)
            trash_path = trash_dir / video_file.name
            
            # Handle trash filename conflicts
            counter = 1
            while trash_path.exists():
                name_without_ext = video_file.stem
                ext = video_file.suffix
                trash_path = trash_dir / f"{name_without_ext}_{counter}{ext}"
                counter += 1
            
            video_file.rename(trash_path)
            
            con.print(f"[green]✓ Flipped {video_file.name} -> {output_name}[/green]")
            successful += 1
            
        except Exception as e:
            con.print(f"[red]✗ Failed to flip {video_file.name}: {e}[/red]")
            failed += 1
    
    # Summary
    con.print(f"\n[bold green]Flip processing complete![/bold green]")
    con.print(f"Successfully flipped: {successful}/{len(video_files)} videos")
    if failed > 0:
        con.print(f"[red]Failed: {failed} videos[/red]")

if __name__ == "__main__":
    app()
