from datetime import datetime

def get_canonical_name(qdoc_id: str, original_filename: str) -> str:
    """
    Generate a canonical name for a file.
    Example: QDOC-2026-000021__invoice_march.pdf
    """
    ext = "".join(Path(original_filename).suffixes).lower()
    stem = Path(original_filename).stem
    
    # Simple slugify: lowercase, replace spaces/special chars with underscores
    import re
    slug = stem.lower()
    slug = re.sub(r'[^a-z0-9_-]', '_', slug)
    slug = re.sub(r'_+', '_', slug).strip('_')
    
    return f"{qdoc_id}__{slug}{ext}"

from pathlib import Path

def parse_qdoc_id(id_str: str):
    """
    Extract the numeric part and year if possible from a QDOC string.
    Matches: QDOC-2026-000001
    """
    import re
    # Match QDOC-2026-000001
    m = re.match(r"QDOC-(\d{4})-(\d{6})", id_str, re.IGNORECASE)
    if m:
        year = m.group(1)
        # We assume it belongs to the DOC band (starting with 2)
        seq = int(m.group(2))
        root_int = 2000000 + seq
        return root_int, year
    return None, None
