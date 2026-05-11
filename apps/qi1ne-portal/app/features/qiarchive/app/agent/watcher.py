import os
import time
from pathlib import Path

def wait_for_stability(file_path: str, wait_seconds: int = 5, interval: int = 1):
    """
    Wait for a file's size and mtime to stop changing.
    """
    last_size = -1
    last_mtime = -1
    stable_count = 0
    
    while stable_count < wait_seconds:
        try:
            current_size = os.path.getsize(file_path)
            current_mtime = os.path.getmtime(file_path)
            
            if current_size == last_size and current_mtime == last_mtime:
                stable_count += interval
            else:
                stable_count = 0
                last_size = current_size
                last_mtime = current_mtime
                
        except FileNotFoundError:
            return False
            
        time.sleep(interval)
    return True

def scan_inbox(inbox_path: str):
    """
    Scan the inbox for new files.
    """
    files = []
    p = Path(inbox_path)
    if not p.exists():
        return files
        
    for entry in p.iterdir():
        if entry.is_file() and not entry.name.startswith("."):
            files.append(str(entry))
    return files

def watch_forever(inbox_path: str, process_callback, interval: int = 5):
    """
    Continuous loop monitoring the inbox.
    """
    print(f"Watching folder: {inbox_path}")
    print("Waiting for files...")
    
    while True:
        try:
            files = scan_inbox(inbox_path)
            for f in files:
                print(f"Detected: {os.path.basename(f)}")
                # The callback should be a function from pipeline.py
                process_callback(f)
            
            time.sleep(interval)
        except KeyboardInterrupt:
            print("\nStopping watcher...")
            break
        except Exception as e:
            print(f"Watcher error: {e}")
            time.sleep(interval)
