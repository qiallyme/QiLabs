import csv
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

def load_manifest_csv(path: str) -> List[Dict]:
    """Reads the CSV manifest into a list of dicts."""
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return []
        
    rows = []
    try:
        with open(path, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            # Ensure the row actually has content
            for row in reader:
                if row.get("doc_id"):
                    rows.append(row)
    except Exception as e:
        print(f"Error loading manifest CSV: {e}")
    return rows

def hash_exists(sha256: str, manifest_rows: List[Dict]) -> bool:
    """Checks if a hash is already in the manifest list."""
    return any(row.get("sha256") == sha256 for row in manifest_rows)

def get_existing_doc_id_by_hash(sha256: str, manifest_rows: List[Dict]) -> Optional[str]:
    """Returns doc_id if hash exists in the manifest list."""
    for row in manifest_rows:
        if row.get("sha256") == sha256:
            return row.get("doc_id")
    return None

def append_manifest_record(path_csv: str, path_jsonl: str, row: Dict):
    """Appends record to both CSV and JSONL."""
    # Ensure fields match CSV header order
    fieldnames = [
        "doc_id", "sha256", "original_filename", "current_filename", 
        "doc_date", "title", "slug", "source", "status", 
        "duplicate_of", "created_at", "updated_at"
    ]
    
    # 1. Update CSV
    file_exists = os.path.isfile(path_csv) and os.path.getsize(path_csv) > 0
    with open(path_csv, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)
    
    # 2. Update JSONL
    with open(path_jsonl, "a", encoding="utf-8") as f:
        f.write(json.dumps(row) + "\n")

def append_csv_row(path: str, row: Dict, fieldnames: List[str]):
    """Generic CSV append for dedupe and rename maps."""
    file_exists = os.path.isfile(path) and os.path.getsize(path) > 0
    with open(path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)
