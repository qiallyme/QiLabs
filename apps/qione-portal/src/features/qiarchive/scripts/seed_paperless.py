import os
import json
import csv
import urllib.request
import urllib.error
import sys
from pathlib import Path

def load_seed(path):
    if path.suffix == '.json':
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    elif path.suffix == '.csv':
        data = {"tags": [], "correspondents": [], "document_types": [], "storage_paths": []}
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                rtype = row.get('type', '').lower() + "s"
                if rtype in data:
                    # Clean up empty values
                    clean_row = {k: v for k, v in row.items() if v and k != 'type'}
                    # Convert types
                    if 'matching_algorithm' in clean_row:
                        clean_row['matching_algorithm'] = int(clean_row['matching_algorithm'])
                    if 'is_inbox_tag' in clean_row:
                        clean_row['is_inbox_tag'] = clean_row['is_inbox_tag'].lower() == 'true'
                    data[rtype].append(clean_row)
        return data
    return {}

def api_call(url, token, method='GET', payload=None):
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Error: {e.code} - {body}")
        return None
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

def api_call_all(url, token):
    """Fetch all pages of results from a paginated endpoint."""
    results = []
    current_url = url
    while current_url:
        # headers and logic integrated into api_call
        data = api_call(current_url, token)
        if data is None:
            break
        
        if isinstance(data, dict) and 'results' in data:
            results.extend(data['results'])
            current_url = data.get('next')
        else:
            # Not paginated or simple list
            if isinstance(data, list):
                results.extend(data)
            else:
                results.append(data)
            current_url = None
    return results

def sync_endpoint(base_url, token, endpoint, seed_items):
    url = f"{base_url.rstrip('/')}/api/{endpoint}/"
    print(f"  Fetching existing {endpoint}...")
    existing_items = api_call_all(url, token)
    
    existing_names = {item['name'].lower(): item['id'] for item in existing_items if 'name' in item}

    created = 0
    skipped = 0

    for seed in seed_items:
        name = seed.get('name')
        if not name: continue
        
        if name.lower() in existing_names:
            skipped += 1
            continue
        
        res = api_call(url, token, method='POST', payload=seed)
        if res:
            print(f"  + Created {endpoint}: {name}")
            created += 1
        else:
            print(f"  ! Failed to create {endpoint}: {name}")
            
    return created, skipped

def load_env():
    """Manually load .env file from the project root."""
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Only set if not already in environment
                    if key not in os.environ:
                        os.environ[key] = value.strip()

def main():
    # Load .env file automatically
    load_env()
    
    # Detect all seeds in contracts folder (defaults for hardcoding)
    contracts_dir = Path(__file__).parent.parent / "contracts"
    url = os.environ.get("PAPERLESS_URL", "https://paperless-ngx-production-feda.up.railway.app")
    token = os.environ.get("PAPERLESS_API_TOKEN", "1349f3e75d9b259c719e26ab2c120cf3d29e2c45")

    if not url or not token:
        print("Error: PAPERLESS_URL and PAPERLESS_API_TOKEN must be set.")
        print("You can set them in your .env file or as environment variables.")
        sys.exit(1)

    print(f"--- Paperless Seed Loader ---")
    print(f"Target: {url}\n")

    seed_files = list(contracts_dir.glob("*.json")) + list(contracts_dir.glob("*.csv"))
    
    endpoints = {
        "tags": "tags",
        "correspondents": "correspondents",
        "document_types": "document_types",
        "storage_paths": "storage_paths"
    }

    final_summary = {}

    for seed_path in seed_files:
        print(f"Processing Seed: {seed_path.name}")
        data = load_seed(seed_path)
        
        for key, api_endpoint in endpoints.items():
            if key in data and data[key]:
                print(f"  Syncing {key}...")
                c, s = sync_endpoint(url, token, api_endpoint, data[key])
                stats = final_summary.get(key, {"created": 0, "skipped": 0})
                stats["created"] += c
                stats["skipped"] += s
                final_summary[key] = stats

    print("\n--- Grand Summary ---")
    for key, stats in final_summary.items():
        print(f"{key:15}: {stats['created']} created, {stats['skipped']} skipped")
    print("\nDone.")

if __name__ == "__main__":
    main()
