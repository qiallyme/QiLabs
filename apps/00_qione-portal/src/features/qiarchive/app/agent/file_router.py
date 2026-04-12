import os
import shutil
from pathlib import Path

def move_to_archive(file_path: str, archive_dir: str):
    """
    Move a file to the successfully uploaded documents folder.
    """
    dest_dir = Path(archive_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / os.path.basename(file_path)
    shutil.move(file_path, dest_path)
    return str(dest_path)

def move_to_duplicates(file_path: str, duplicates_dir: str):
    """
    Move a file to the duplicates bucket.
    """
    dest_dir = Path(duplicates_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / os.path.basename(file_path)
    shutil.move(file_path, dest_path)
    return str(dest_path)

def move_to_review(file_path: str, review_dir: str):
    """
    Move a file to the manual review bucket.
    """
    dest_dir = Path(review_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / os.path.basename(file_path)
    shutil.move(file_path, dest_path)
    return str(dest_path)
