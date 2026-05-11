import os
import requests
import csv
from datetime import datetime
import sys

# Load environment logic
from dotenv import load_dotenv

# sys.path.append needed for local imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from scripts.utils.file_utils import ensure_dir

# Load variables
load_dotenv()

STAGED_DIR = "data/01_STAGED"
HANDOFF_LOG = "data/90_MANIFESTS/handoff_log_railway.csv"

# Paperless Railway Config
API_URL = os.getenv("PAPERLESS_URL_RAILWAY")
API_TOKEN = os.getenv("PAPERLESS_API_TOKEN")

def main():
    print(f"--- QiArchive Paperless Railway Pushing Start [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ---")
    
    if not API_URL or not API_TOKEN:
        print("ERROR: PAPERLESS_URL_RAILWAY or PAPERLESS_API_TOKEN not found in .env")
        return

    # Ensure log directory exists
    ensure_dir(os.path.dirname(HANDOFF_LOG))
    
    # 1. Load handoff history
    handed_off_files = set()
    if os.path.exists(HANDOFF_LOG):
        with open(HANDOFF_LOG, "r", newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None) # skip header
            for row in reader:
                if row:
                    handed_off_files.add(row[0]) # filename

    # 2. Scan staged
    staged_files = [f for f in os.listdir(STAGED_DIR) if os.path.isfile(os.path.join(STAGED_DIR, f)) and not f.startswith(".")]
    
    if not staged_files:
        print("No staged files found in 01_STAGED.")
        return

    push_count = 0
    headers = {
        "Authorization": f"Token {API_TOKEN}"
    }

    for filename in staged_files:
        if filename in handed_off_files:
            continue
            
        file_path = os.path.join(STAGED_DIR, filename)
        
        # Determine title from filename (Model R)
        # Use stem as title for Paperless to index.
        title = os.path.splitext(filename)[0]

        print(f"Pushing: {filename} to {API_URL}...")
        
        try:
            with open(file_path, 'rb') as f:
                payload = {
                    "title": title,
                }
                files = {
                    "document": (filename, f, 'application/pdf')
                }
                
                response = requests.post(
                    f"{API_URL.rstrip('/')}/api/documents/post_document/",
                    headers=headers,
                    data=payload,
                    files=files
                )
                
                if response.status_code in [200, 201]:
                    print(f"SUCCESS: {filename} pushed. Response: {response.text}")
                    
                    # Log handoff
                    header_needed = not os.path.exists(HANDOFF_LOG)
                    with open(HANDOFF_LOG, "a", newline="", encoding="utf-8") as f:
                        writer = csv.writer(f)
                        if header_needed:
                            writer.writerow(["filename", "timestamp", "api_url", "response"])
                        writer.writerow([filename, datetime.now().isoformat(), API_URL, response.status_code])
                    
                    push_count += 1
                else:
                    print(f"FAILED: {filename}. Status Code: {response.status_code}")
                    print(f"Response: {response.text}")
                    
        except Exception as e:
            print(f"Error pushing {filename}: {e}")

    print(f"Summary: {push_count} files successfully pushed to Railway.")
    print("--------------------------------\n")

if __name__ == "__main__":
    main()
