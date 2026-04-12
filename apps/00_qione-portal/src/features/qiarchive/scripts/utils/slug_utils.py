import re
import os

def slugify_filename(filename: str) -> str:
    """Normalizes a filename stem into a slug (lowercase, underscores, only alpha-numeric)."""
    # Get stem (filename without extension)
    stem = os.path.splitext(filename)[0]
    # Remove QDOC prefix if it's there
    stem = re.sub(r'^QDOC-\d{4}-\d{6}__', '', stem)
    # Lowercase
    s = stem.lower()
    # Replace non-alphanumeric with underscores
    s = re.sub(r'[^a-z0-9]+', '_', s)
    # Remove leading/trailing underscores
    s = s.strip('_')
    return s if s else "misc_document"
