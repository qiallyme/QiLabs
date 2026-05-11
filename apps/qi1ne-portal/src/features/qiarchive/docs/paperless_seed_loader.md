# Paperless Seed Loader Implementation

I have implemented an idempotent baseline configuration loader for your Paperless instance on Railway. This allows you to programmatically define tags, correspondents, and storage paths without using the Paperless UI.

## 📄 Proposed Seed Schema

The seed is stored in `JSON` format. It supports all standard Paperless matching algorithms and metadata.

**Location**: `contracts/paperless_seed.json`

```json
{
  "tags": [
    { "name": "Urgent", "color": "#ff0000", "matching_algorithm": 1, "match": "urgent" }
  ],
  "correspondents": [
    { "name": "Amazon", "matching_algorithm": 1, "match": "amazon" }
  ],
  "document_types": [...]
}
```

## 🛠️ Script Details

- **Path**: `scripts/seed_paperless.py`
- **Logic**:
  - Fetches existing items from the API.
  - Compares names (case-insensitive) to ensure idempotency.
  - POSTs only missing items.
  - Skip items that already exist to prevent duplicates.

## ⚙️ Required Env Vars

Ensure these are set in your terminal or `.env` file:

- `PAPERLESS_URL`: e.g., `https://paperless-ngx-production-feda.up.railway.app`
- `PAPERLESS_API_TOKEN`: Your secret Paperless API token.

## 🚀 Execution

Run the following command from the root directory:

```powershell
# Set variables (if not in .env)
$env:PAPERLESS_URL="your_url"
$env:PAPERLESS_API_TOKEN="your_token"

# Run the loader
python scripts/seed_paperless.py
```

## ✅ Example Output

```text
--- Paperless Seed Loader ---
Target: https://...
Seed:   paperless_seed.json

Syncing tags...
  + Created tags: QiArchive
  + Created tags: Review Needed
Syncing correspondents...
Syncing document_types...
Syncing storage_paths...

--- Summary ---
tags: 2 created, 3 skipped
correspondents: 0 created, 4 skipped
...
Done.
```
