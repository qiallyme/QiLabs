from typing import List, Dict

def get_next_doc_id(manifest_rows: List[Dict], year: int, prefix: str = "QDOC") -> str:
    """Calculates the next sequential ID for the given year."""
    ids_for_year = []
    year_str = str(year)
    
    for row in manifest_rows:
        doc_id = row.get("doc_id", "")
        if doc_id.startswith(f"{prefix}-{year_str}-"):
            try:
                # Extract number from QDOC-YYYY-NNNNNN
                num = int(doc_id.split("-")[-1])
                ids_for_year.append(num)
            except (ValueError, IndexError):
                continue
    
    next_num = max(ids_for_year) + 1 if ids_for_year else 1
    return f"{prefix}-{year_str}-{next_num:06d}"
