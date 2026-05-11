import os
import sys
import json
import urllib.request
import socket
import threading
import time
from pathlib import Path

# Add current dir to path to import local modules
sys.path.append(str(Path(__file__).parent))

def get_env_var(name, default=None):
    return os.environ.get(name, default)

def post_to_cloud(endpoint, payload):
    cloud_url = os.environ.get("QIARCHIVE_CLOUD_API_URL")
    if not cloud_url:
        return None
    
    url = f"{cloud_url.rstrip('/')}{endpoint}"
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode())
            return res_data
    except Exception as e:
        print(f"[CloudStatus] Cloud sync failed for {endpoint}. ({e})")
        return None

# Optional callback to get real-time stats (usually from pipeline.py)
stats_callback = None

def set_stats_source(callback):
    global stats_callback
    stats_callback = callback

def send_heartbeat():
    machine_name = os.environ.get("QIARCHIVE_AGENT_NAME", socket.gethostname())
    inbox = os.environ.get("QIARCHIVE_INBOX_FOLDER", "Unknown")
    
    # Fetch real-time stats if available
    current_stats = stats_callback() if stats_callback else {}
    
    payload = {
        "machine_name": machine_name,
        "agent_status": "online",
        "watch_folder": str(inbox),
        "queue_depth": current_stats.get("queue_depth", 0),
        "processed_today": current_stats.get("processed_today", 0),
        "duplicates_today": current_stats.get("duplicates_today", 0),
        "review_today": current_stats.get("review_today", 0)
    }
    return post_to_cloud("/api/agent/heartbeat", payload)

def send_document_event(qdoc_id, event_type, details=None):
    machine_name = os.environ.get("QIARCHIVE_AGENT_NAME", socket.gethostname())
    payload = {
        "document_id": qdoc_id,
        "event_type": event_type,
        "machine_name": machine_name,
        "payload_json": details or {}
    }
    return post_to_cloud("/api/events/document", payload)

def heartbeat_thread_worker():
    interval = int(os.environ.get("QIARCHIVE_HEARTBEAT_INTERVAL", "30"))
    while True:
        try:
            send_heartbeat()
        except:
            pass
        time.sleep(interval)

def start_heartbeat():
    thread = threading.Thread(target=heartbeat_thread_worker, daemon=True)
    thread.start()
    return thread
