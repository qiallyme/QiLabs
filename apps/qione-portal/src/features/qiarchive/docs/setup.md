# Setup Guide

## Prerequisites

* **Google Drive Access**: Dedicated folders for `00_INBOX`, `10_ARCHIVE_UPLOADED`, `20_DUPLICATES`, and `30_REVIEW`.
* **Railway Project**: Hosting Paperless-ngx, PostgreSQL, and Redis (See [Railway Deployment Guide](railway_deployment.md)).
* **Python 3.10+**: For local development and maintenance scripts.

## Initial Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

* `PAPERLESS_URL_RAILWAY`: Your Railway public URL.
* `PAPERLESS_API_TOKEN`: Your generated API token from Paperless.
* `DOC_ID_PREFIX`: Defaults to `QDOC`.

### 2. Infrastructure (Railway)

Ensure the following are set in Railway service variables:

* **QiArchive Engine**: Deploy using the upcoming Cloud v1 Dockerfile.
* **QiArchive Console**: Deploy using the upcoming Console Dockerfile.
* **Databases**: Managed Postgres (The Ledger) and Redis.
* **Paperless**: Volume mounted at `/paperless`.

## Running the Pipeline

The pipeline is designed to run asynchronously as a **Cloud Orchestrator**.

### 1. Ingest & Orchestrate

The **QiArchive Engine** on Railway continuously monitors the Drive `00_INBOX` and moves files through the identity gate.

### 2. Monitor & Manage (Console)

Use the **QiArchive Console** dashboard to:
* View real-time ingestion status.
* Resolve duplicates or classification errors.
* Browse the authoritative document ledger.

### 3. Local Development

For development and maintenance, you can run pipeline components locally:

```bash
python scripts/ingest/main.py
python scripts/ops/queue_report.py
```

## Maintenance

* **Ledger Backups**: The Postgres database is the source of truth for IDs. Ensure periodic backups.
* **Paperless Exports**: Use the Paperless export function to back up OCR data periodically.
