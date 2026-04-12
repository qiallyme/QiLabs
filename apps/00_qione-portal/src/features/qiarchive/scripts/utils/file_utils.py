import shutil
import os
import time

def ensure_dir(directory: str):
    """Ensures a directory exists."""
    os.makedirs(directory, exist_ok=True)

def safe_move(src: str, dest: str):
    """
    Moves a file to dest. If dest exists, appends a timestamp to the filename 
    to avoid overwriting (primarily for quarantine).
    """
    ensure_dir(os.path.dirname(dest))
    if os.path.exists(dest):
        base, ext = os.path.splitext(dest)
        timestamp = int(time.time())
        dest = f"{base}_{timestamp}{ext}"
    shutil.move(src, dest)

def is_supported_file(path: str, allowed_extensions: set = {".pdf"}) -> bool:
    """Checks if file has a supported extension."""
    _, ext = os.path.splitext(path)
    return ext.lower() in allowed_extensions

def build_canonical_filename(doc_id: str, slug: str, doc_date: str = "undated") -> str:
    """Combines segments into a QDOC filename."""
    return f"{doc_id}__{slug}__{doc_date}.pdf"
