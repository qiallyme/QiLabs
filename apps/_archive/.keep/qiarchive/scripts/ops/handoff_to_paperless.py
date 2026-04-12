import os
import shutil
import csv
from datetime import datetime
import sys

# sys.path.append needed for local imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from scripts.utils.file_utils import ensure_dir

# Configuration (These should eventually move to .env)
STAGED_DIR = "data/01_STAGED"
# In a real setup, this would be a path accessible to Paperless
CONSUMER_DIR = "data/paperless/consume" 
HANDOFF_LOG = "data/90_MANIFESTS/handoff_log.csv"

def main():
    print(f"--- QiArchive Paperless Handoff Start [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ---")
    
    ensure_dir(CONSUMER_DIR)
    ensure_dir("data/90_MANIFESTS")
    
    # 1. Load handoff history
    handed_off_files = set()
    if os.path.exists(HANDOFF_LOG):
        with open(HANDOFF_LOG, "r", newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None) # header
            for row in reader:
                if row:
                    handed_off_files.add(row[0]) # filename

    # 2. Scan staged
    staged_files = [f for f in os.listdir(STAGED_DIR) if os.path.isfile(os.path.join(STAGED_DIR, f)) and not f.startswith(".")]
    
    handoff_count = 0
    for filename in staged_files:
        if filename in handed_off_files:
            continue
            
        src = os.path.join(STAGED_DIR, filename)
        dest = os.path.join(CONSUMER_DIR, filename)
        
        try:
            print(f"Handoff: {filename} -> {CONSUMER_DIR}")
            shutil.copy2(src, dest)
            
            # Log handoff
            header_needed = not os.path.exists(HANDOFF_LOG)
            with open(HANDOFF_LOG, "a", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                if header_needed:
                    writer.writerow(["filename", "timestamp", "destination"])
                writer.writerow([filename, datetime.now().isoformat(), CONSUMER_DIR])
            
            handoff_count += 1
            
        except Exception as e:
            print(f"Error handing off {filename}: {e}")

    print(f"Summary: {handoff_count} files handed off to Paperless.")
    print("--------------------------------\n")

if __name__ == "__main__":
    main()
