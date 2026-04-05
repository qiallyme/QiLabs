# Workflow Guide (Cloud v1)

## The High-Integrity Pipeline

The QiArchive workflow is a cloud-native sequence that ensures identity is assigned and state is tracked before documents are indexed.

```text
Discovery → Identification → Manifesting → Handoff → Archival → Search
```

---

### Step 1: Discovery (Local Agent)

The **QiArchive Agent** monitors the intake zone.

- **Source**: Locally mounted `Google Drive/00_INBOX`.
- **Action**: `watcher.py` detects new files and waits for size/mtime stability.
- **Status**: `inbox`.

### Step 2: Identification (Identity Gate)

The Agent processes the file locally using the portable `qid.py` runtime.

- **Fingerprinting**: `hasher.py` calculates the SHA-256 hash.
- **Deduplication**: Queries the local registry (and/or synced ledger) for the hash.
  - **Duplicate**: `file_router.py` moves file to `20_DUPLICATES`.
  - **Unique**: Assign next `QDOC` ID from the `DOC` band.
- **Renaming**: Renames the file to its canonical QDOC name.

### Step 3: Registry Entry (The Local Ledger)

- **Action**: `qid.py` locks the registry and commits the allocation.
- **Resiliency**: WAL (Write-Ahead-Log) and rolling backups provide local safety.
- **Status**: `staged`.

### Step 4: Handoff (The API Bridge)

- **Action**: `paperless_upload.py` pushes the document to the Paperless-ngx API.
- **Receipt**: Agent records the successful transmission status.
- **Status**: `uploaded`.

### Step 5: Archival (Local Filesystem)

- **Action**: `file_router.py` moves the binary to the local `10_ARCHIVE_UPLOADED` folder on the mounted Drive.
- **Status**: `uploaded`.

### Step 6: Search (The End Engine)

- **Action**: Paperless-ngx completes OCR and indexing.
- **Verification**: (Future) Engine verifies indexing status via Paperless API.
- **Status**: `indexed`.

---

## The Console (Dashboard) Role

The **QiArchive Console** is the user's window into this pipeline:

1. **Queue Monitor**: See how many files are pending or stuck.
2. **Duplicate Log**: Review what was rejected and why.
3. **Review Dashboard**: Resolve documents flagged as `review` (e.g., malformed files).
4. **Metadata Edit**: Rename titles or adjust tags *before* they are sent to Paperless.

## Error Handling

If any step fails (e.g., API timeout), the Engine flags the document as `error` in the Ledger. The user can retry or investigate via the Console.
