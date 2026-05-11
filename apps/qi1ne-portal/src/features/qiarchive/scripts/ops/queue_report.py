import os
from datetime import datetime

def main():
    print(f"--- QiArchive Pipeline Report [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ---")
    
    paths = {
        "Inbox": "data/00_INBOX",
        "Staged": "data/01_STAGED",
        "Quarantined": "data/20_QUARANTINE",
        "Review": "data/10_REVIEW"
    }
    
    for label, path in paths.items():
        if os.path.exists(path):
            files = [f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f)) and not f.startswith(".")]
            print(f"{label:12}: {len(files)} files")
        else:
            print(f"{label:12}: folder missing")

    print("--------------------------------")

if __name__ == "__main__":
    main()
