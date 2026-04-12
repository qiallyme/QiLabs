import os
import sys
from pathlib import Path
from datetime import datetime
import json
import urllib.request
import socket

# Add current dir to path
sys.path.append(str(Path(__file__).parent))

import qid
import hasher
import paperless_upload
import file_router
import watcher
import doc_ids
import cloud_client

# Globally shared status state for heartbeat and UI
GLOBAL_STATS = {
    "processed_today": 0,
    "duplicates_today": 0,
    "review_today": 0,
    "queue_depth": 0,
    "is_busy": False,
    "last_file": None
}

def load_env():
    # Look for .env in root
    env_path = Path(__file__).parent.parent.parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    os.environ[k] = v

def sync_to_cloud(qdoc_id, status, details=None):
    load_env()
    cloud_url = os.environ.get("QIARCHIVE_CLOUD_API_URL")
    if not cloud_url:
        return
    
    # Paperless IDs from the upload result
    paperless_id = None
    if isinstance(details, dict):
        paperless_id = details.get("document_id")
    
    # Prepare payload based on status and the new Cloud API endpoints
    try:
        # Also record a generic event for the timeline
        cloud_client.send_document_event(doc_id, f"process_{status}", details)

        if status == "staged":
            endpoint = "/api/intake/register"
            payload = {
                "qdoc_id": doc_id,
                "status": "staged",
                "sha256": details.get("hash"),
                "original_filename": details.get("filename"),
                "machine_name": os.environ.get("QIARCHIVE_AGENT_NAME", socket.gethostname())
            }
        elif status == "uploaded":
            endpoint = f"/api/documents/{doc_id}/upload-complete"
            payload = {
                "paperless_id": paperless_id,
                "paperless_url": details.get("paperless_url")
            }
        elif status == "duplicate":
            endpoint = f"/api/documents/{doc_id}/mark-duplicate"
            payload = {"original_qdoc_id": details.get("original_qdoc_id")}
        elif status == "review":
            endpoint = f"/api/documents/{doc_id}/mark-review"
            payload = {"reason": details.get("reason", "Unknown reason")}
        else:
            return

        url = f"{cloud_url.rstrip('/')}{endpoint}"
        req = urllib.request.Request(
            url, 
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            pass # Sync ok
    except Exception as e:
        print(f"[CloudSync] Sync failed for {qdoc_id}: {e}")

def process_single_file(file_path):
    load_env()
    global GLOBAL_STATS
    GLOBAL_STATS["is_busy"] = True
    
    archive = os.environ.get("QIARCHIVE_ARCHIVE_FOLDER", "./data/10_ARCHIVE_UPLOADED")
    duplicates = os.environ.get("QIARCHIVE_DUPLICATES_FOLDER", "./data/20_DUPLICATES")
    review = os.environ.get("QIARCHIVE_REVIEW_FOLDER", "./data/30_REVIEW")
    
    original_filename = os.path.basename(file_path)
    GLOBAL_STATS["last_file"] = original_filename

    # Log initial detection
    cloud_client.send_document_event("PENDING", "detected", {"filename": original_filename})
    
    # 1. Stability
    if not watcher.wait_for_stability(file_path, wait_seconds=1):
        GLOBAL_STATS["is_busy"] = False
        return {"status": "error", "message": "File not stable"}
    
    # 2. Hash
    file_hash = hasher.compute_sha256(file_path)
    
    # 3. Deduplication
    registry = qid.load_json(qid.REGISTRY_FILE, {})
    for base, entry in registry.items():
        if entry.get("external_key") == file_hash:
            qdoc_id = qid.format_qdoc_id(entry["root_int"])
            canonical_name = doc_ids.get_canonical_name(qdoc_id, original_filename)
            
            print(f"[Dedupe] Duplicate found: {qdoc_id}")
            print(f"[Dedupe] Renaming: {original_filename} -> {canonical_name}")
            
            # Rename locally even for duplicates
            dupe_current_path = os.path.join(os.path.dirname(file_path), canonical_name)
            try:
                os.rename(file_path, dupe_current_path)
                current_active_path = dupe_current_path
            except:
                current_active_path = file_path

            dest_path = file_router.move_to_duplicates(current_active_path, duplicates)
            sync_to_cloud(qdoc_id, "duplicate", {"hash": file_hash, "filename": original_filename, "original_qdoc_id": qdoc_id})
            
            GLOBAL_STATS["duplicates_today"] += 1
            GLOBAL_STATS["is_busy"] = False
            return {
                "status": "duplicate",
                "doc_id": qdoc_id,
                "original": original_filename,
                "canonical": canonical_name,
                "location": dest_path
            }

    # 4. ID Allocation
    try:
        entry = qid.create_root(title=original_filename, band="DOC")
        root_int = entry["root_int"]
        
        with qid.file_lock():
            reg = qid.load_json(qid.REGISTRY_FILE, {})
            base = qid.parse_base(entry["root_id"])
            reg[base]["external_key"] = file_hash
            qid.save_json_atomic(qid.REGISTRY_FILE, reg)
            
        qdoc_id = qid.format_qdoc_id(root_int)
        # Register in cloud
        sync_to_cloud(qdoc_id, "staged", {"hash": file_hash, "filename": original_filename})
    except Exception as e:
        print(f"[Error] Allocation failed: {e}")
        dest_path = file_router.move_to_review(file_path, review)
        GLOBAL_STATS["review_today"] += 1
        GLOBAL_STATS["is_busy"] = False
        return {"status": "error", "message": f"Allocation failed: {e}"}

    # 5. Canonical Name & Physical Rename
    canonical_name = doc_ids.get_canonical_name(qdoc_id, original_filename)
    upload_path = os.path.join(os.path.dirname(file_path), canonical_name)
    
    print(f"[Pipeline] Assigned ID: {qdoc_id}")
    print(f"[Pipeline] Canonical: {canonical_name}")
    
    try:
        os.rename(file_path, upload_path)
        print(f"[Pipeline] Physical rename successful.")
    except Exception as e:
        print(f"[Warning] Physical rename failed (file may be locked): {e}")
        upload_path = file_path # Fallback to original if rename fails

    # 6. Upload
    try:
        paperless_url = os.environ.get("PAPERLESS_URL")
        token = os.environ.get("PAPERLESS_API_TOKEN")
        
        print(f"[Pipeline] Uploading to Paperless...")
        result = paperless_upload.upload_to_paperless(upload_path, paperless_url, token, title=canonical_name)
        
        # 7. Route
        print(f"[Pipeline] Routing to Archive...")
        dest_path = file_router.move_to_archive(upload_path, archive)
        print(f"[Pipeline] Final Destination: {dest_path}")
        
        # 8. Sync Final
        paperless_id = result.get("document_id")
        doc_url = f"{paperless_url.rstrip('/')}/documents/{paperless_id}" if paperless_id else None
        
        sync_to_cloud(qdoc_id, "uploaded", {
            "paperless_id": paperless_id, 
            "paperless_url": doc_url
        })
        
        GLOBAL_STATS["processed_today"] += 1
        GLOBAL_STATS["is_busy"] = False
        return {
            "status": "success",
            "doc_id": qdoc_id,
            "filename": canonical_name,
            "location": dest_path
        }
    except Exception as e:
        print(f"[Error] Pipeline failure: {e}")
        # Move whichever path actually exists to review
        final_file_to_move = upload_path if os.path.exists(upload_path) else file_path
        dest_path = file_router.move_to_review(final_file_to_move, review)
        sync_to_cloud(qdoc_id, "review", {"reason": str(e)})
        GLOBAL_STATS["review_today"] += 1
        GLOBAL_STATS["is_busy"] = False
        return {"status": "error", "message": str(e)}

def run_ingestion():
    load_env()
    inbox = os.environ.get("QIARCHIVE_INBOX_FOLDER", "./data/00_INBOX")
    files = watcher.scan_inbox(inbox)
    
    results = []
    for f in files:
        res = process_single_file(f)
        results.append(res)
    
    return results

def is_agent_instance_running():
    # Helper to check if another instance of this script is running (via port 50001)
    try:
        tmp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        tmp_socket.bind(('127.0.0.1', 50001))
        tmp_socket.close()
        return False
    except socket.error:
        return True

def start_polling():
    load_env()
    
    # Wire stats to cloud client
    cloud_client.set_stats_source(lambda: GLOBAL_STATS)
    
    # Ensure only one instance is running
    # We bind a socket to a local port; if it fails, another instance is already up.
    try:
        lock_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        lock_socket.bind(('127.0.0.1', 50001))
    except socket.error:
        print("QiArchive Agent is already running. Exiting.")
        sys.exit(0)

    # Start Heartbeat
    cloud_client.start_heartbeat()
    print("Cloud Heartbeat started.")

    inbox = os.environ.get("QIARCHIVE_INBOX_FOLDER", "./data/00_INBOX")
    watcher.watch_forever(inbox, process_single_file)

if __name__ == "__main__":
    start_polling()
