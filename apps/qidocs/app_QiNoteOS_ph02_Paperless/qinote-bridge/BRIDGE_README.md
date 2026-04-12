# QiNote Export Bridge for Paperless-ngx

This script exports documents from Paperless-ngx to a QiNote-compatible vault structure when they are tagged with a specific tag (default: `Ready_for_QiNote`).

## Setup

1. **Install Dependencies**:
   ```bash
   pip install requests python-dotenv
   ```

2. **Generate API Token**:
   - Log into your Paperless-ngx instance.
   - Click your username (top right) -> **My Profile**.
   - Find the **API Token** section and click the refresh/generate button.
   - Copy the token.

3. **Configure Settings**:
   - Edit `.env.bridge` in this folder.
   - Set `PAPERLESS_TOKEN` to the token you copied.
   - (Optional) Adjust `PAPERLESS_URL` if you aren't using the default `http://localhost:8000`.

4. **Prepare Paperless**:
   - Create a tag in Paperless-ngx named `Ready_for_QiNote`.
   - Apply this tag to any documents you want to export.

## Running the Export

Run the script manually:
```bash
python export_bridge.py
```

The script is **idempotent**: it will not redownload or overwrite files that already exist in the target directory unless you delete them locally.

## Output Structure
- **PDF**: `qinote_vault/documents/{YYYY}/{YYYY-MM-DD}__{title_slug}__paperless-{doc_id}.pdf`
- **Sidecar MD**: `qinote_vault/documents/{YYYY}/{YYYY-MM-DD}__{title_slug}__paperless-{doc_id}.md`
