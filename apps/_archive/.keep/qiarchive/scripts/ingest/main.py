import os
import sys
from datetime import datetime

# Add the project root to sys.path if needed
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from scripts.utils.hash_utils import compute_sha256
from scripts.utils.id_utils import get_next_doc_id
from scripts.utils.slug_utils import slugify_filename
from scripts.utils.file_utils import (
    is_supported_file, 
    safe_move, 
    build_canonical_filename,
    ensure_dir
)
from scripts.utils.manifest_utils import (
    load_manifest_csv,
    get_existing_doc_id_by_hash,
    append_manifest_record,
    append_csv_row
)

# Configuration
INBOX_DIR = "data/00_INBOX"
STAGED_DIR = "data/01_STAGED"
QUARANTINE_DIR = "data/20_QUARANTINE"
REVIEW_DIR = "data/10_REVIEW"
MANIFEST_DIR = "data/90_MANIFESTS"

MANIFEST_CSV = os.path.join(MANIFEST_DIR, "document_manifest.csv")
MANIFEST_JSONL = os.path.join(MANIFEST_DIR, "document_manifest.jsonl")
DEDUPE_CSV = os.path.join(MANIFEST_DIR, "dedupe_report.csv")
RENAME_CSV = os.path.join(MANIFEST_DIR, "rename_map.csv")

# Constants
DOC_ID_PREFIX = "QDOC"
DOC_ID_YEAR = 2026
SOURCE = "manual_drop"

def main():
    print(f"--- QiArchive v1 Ingestion Start [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ---")
    
    # Ensure folders exist
    for d in [INBOX_DIR, STAGED_DIR, QUARANTINE_DIR, REVIEW_DIR, MANIFEST_DIR]:
        ensure_dir(d)

    # 1. Load current manifest to track hashes and sequence
    manifest_rows = load_manifest_csv(MANIFEST_CSV)
    
    # 2. Results counters
    results = {
        "processed": 0,
        "duplicates": 0,
        "skipped": 0,
        "errors": 0
    }

    # 3. Process inbox
    files = [f for f in os.listdir(INBOX_DIR) if os.path.isfile(os.path.join(INBOX_DIR, f))]
    
    if not files:
        print("Inbox is empty. Nothing to process.")
        return

    for filename in files:
        src_path = os.path.join(INBOX_DIR, filename)
        
        # Rule of v1: Skip hidden files (like .gitkeep)
        if filename.startswith('.'):
            continue

        # Rule of v1: Supported extensions only (.pdf)
        if not is_supported_file(src_path):
            print(f"Skipping unsupported file: {filename}")
            results["skipped"] += 1
            continue

        try:
            # a. Compute SHA-256
            sha256 = compute_sha256(src_path)
            
            # b. Check manifest for duplicate hash
            existing_doc_id = get_existing_doc_id_by_hash(sha256, manifest_rows)
            
            if existing_doc_id:
                # Duplicate case
                print(f"DUPLICATE FOUND: {filename} matches {existing_doc_id}")
                
                # Move to quarantine
                dest_path = os.path.join(QUARANTINE_DIR, filename)
                safe_move(src_path, dest_path)
                
                # Log dedupe report
                append_csv_row(
                    DEDUPE_CSV, 
                    {
                        "timestamp": datetime.now().isoformat(),
                        "sha256": sha256,
                        "original_filename": filename,
                        "duplicate_of_id": existing_doc_id,
                        "status": "duplicate"
                    },
                    fieldnames=["timestamp", "sha256", "original_filename", "duplicate_of_id", "status"]
                )
                results["duplicates"] += 1
                
            else:
                # Unique (New) case
                # Assign next ID using current manifest as sequence base
                doc_id = get_next_doc_id(manifest_rows, DOC_ID_YEAR, DOC_ID_PREFIX)
                slug = slugify_filename(filename)
                doc_date = "undated"
                
                # Build canonical filename
                canonical_name = build_canonical_filename(doc_id, slug, doc_date)
                dest_path = os.path.join(STAGED_DIR, canonical_name)
                
                # Move to staged
                safe_move(src_path, dest_path)
                print(f"PROCESSED: {filename} -> {canonical_name}")
                
                # Prepare manifest row
                now_str = datetime.now().isoformat()
                manifest_record = {
                    "doc_id": doc_id,
                    "sha256": sha256,
                    "original_filename": filename,
                    "current_filename": canonical_name,
                    "doc_date": doc_date,
                    "title": os.path.splitext(filename)[0],
                    "slug": slug,
                    "source": SOURCE,
                    "status": "processed",
                    "duplicate_of": "",
                    "created_at": now_str,
                    "updated_at": now_str
                }
                
                # Append to manifest (CSV/JSONL) and local list (for sequential ID tracking in the same run)
                append_manifest_record(MANIFEST_CSV, MANIFEST_JSONL, manifest_record)
                manifest_rows.append(manifest_record)
                
                # Append to rename map
                append_csv_row(
                    RENAME_CSV,
                    {
                        "doc_id": doc_id,
                        "original_filename": filename,
                        "current_filename": canonical_name,
                        "timestamp": now_str
                    },
                    fieldnames=["doc_id", "original_filename", "current_filename", "timestamp"]
                )
                
                results["processed"] += 1

        except Exception as e:
            print(f"ERROR processing {filename}: {e}")
            results["errors"] += 1

    # 4. Summary
    print("\n--- Run Summary ---")
    print(f"Processed (Staged): {results['processed']}")
    print(f"Duplicates Quarantined: {results['duplicates']}")
    print(f"Skipped unsupported: {results['skipped']}")
    print(f"Errors encountered: {results['errors']}")
    print("-------------------\n")

if __name__ == "__main__":
    main()
