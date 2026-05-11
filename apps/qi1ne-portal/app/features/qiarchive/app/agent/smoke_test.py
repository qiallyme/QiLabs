import os
import sys
from pathlib import Path
from datetime import datetime

# Add current dir to path so we can import helper modules
sys.path.append(str(Path(__file__).parent))

import qid
import hasher
import paperless_upload
import file_router
import watcher
import doc_ids

def load_env():
    env_path = Path(__file__).parent.parent.parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v

def smoke_test():
    load_env()
    
    inbox = os.environ.get("QIARCHIVE_INBOX_FOLDER", "./data/00_INBOX")
    archive = os.environ.get("QIARCHIVE_ARCHIVE_FOLDER", "./data/10_ARCHIVE_UPLOADED")
    duplicates = os.environ.get("QIARCHIVE_DUPLICATES_FOLDER", "./data/20_DUPLICATES")
    review = os.environ.get("QIARCHIVE_REVIEW_FOLDER", "./data/30_REVIEW")
    
    print(f"--- Starting Smoke Test ---")
    print(f"Inbox: {inbox}")
    
    # 1. Scan/Discovery
    files = watcher.scan_inbox(inbox)
    if not files:
        print("No files found in inbox. Please drop a PDF into the inbox folder.")
        return
    
    target_file = files[0]
    original_filename = os.path.basename(target_file)
    print(f"Found file: {original_filename}")
    
    # 2. Stability
    print("Checking file stability...")
    if not watcher.wait_for_stability(target_file, wait_seconds=2):
        print("File is not stable. Aborting.")
        return
    
    # 3. Hash
    print("Computing hash...")
    file_hash = hasher.compute_sha256(target_file)
    print(f"SHA256: {file_hash}")
    
    # 4. ID Allocation (DOC Band) with Deduplication
    print("Checking for duplicates...")
    registry = qid.load_json(qid.REGISTRY_FILE, {})
    qdoc_id = None
    
    for base, entry in registry.items():
        if entry.get("external_key") == file_hash:
            qdoc_id = qid.format_qdoc_id(entry["root_int"])
            print(f"Duplicate found: {qdoc_id}")
            dest_path = file_router.move_to_duplicates(target_file, duplicates)
            print(f"Moved to: {dest_path}")
            print("\n--- Smoke Test Summary ---")
            print(f"1. Original Name: {original_filename}")
            print(f"2. Final Name: N/A")
            print(f"3. Paperless: N/A")
            print(f"4. Folder: {Path(dest_path).parent.name}")
            return

    print("Allocating new QDOC ID...")
    try:
        entry = qid.create_root(title=original_filename, band="DOC")
        root_int = entry["root_int"]
        
        # Store hash in registry for future deduplication
        with qid.file_lock():
            reg = qid.load_json(qid.REGISTRY_FILE, {})
            base = qid.parse_base(entry["root_id"])
            reg[base]["external_key"] = file_hash
            qid.save_json_atomic(qid.REGISTRY_FILE, reg)
            
        qdoc_id = qid.format_qdoc_id(root_int)
        print(f"Allocated: {qdoc_id}")
    except Exception as e:
        print(f"Allocation failed: {e}")
        dest_path = file_router.move_to_review(target_file, review)
        print(f"Moved to: {dest_path}")
        return

    # 5. Canonical Name
    canonical_name = doc_ids.get_canonical_name(qdoc_id, original_filename)
    print(f"Canonical name: {canonical_name}")
    
    # 6. Upload to Paperless
    print(f"Uploading to Paperless...")
    try:
        if "bad_upload" in original_filename:
            raise Exception("SIMULATED UPLOAD FAILURE")
        result = paperless_upload.upload_to_paperless(target_file, title=canonical_name)
        print(f"Paperless result: {result}")
    except Exception as e:
        print(f"Upload failed: {e}")
        dest_path = file_router.move_to_review(target_file, review)
        print(f"Moved to: {dest_path}")
        print("\n--- Smoke Test Summary ---")
        print(f"1. Original Name: {original_filename}")
        print(f"2. Final Name: {canonical_name}")
        print(f"3. Paperless: FAILED")
        print(f"4. Folder: {Path(dest_path).parent.name}")
        return

    # 7. Local Archival
    print(f"Moving to archive...")
    dest_path = file_router.move_to_archive(target_file, archive)
    print(f"Final location: {dest_path}")
    
    print("\n--- Smoke Test Summary ---")
    print(f"1. Original Name: {original_filename}")
    print(f"2. Final Name: {canonical_name}")
    status = result.get('status', 'success') if isinstance(result, dict) else 'success'
    print(f"3. Paperless: {status}")
    print(f"4. Folder: {Path(dest_path).parent.name}")

if __name__ == "__main__":
    smoke_test()
