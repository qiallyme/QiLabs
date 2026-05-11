# QiArchive Cloud API

A thin sync plane for the QiArchive ecosystem, tracking document state and providing visibility into the ingestion pipeline.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Deployment**: Railway

## Key Responsibilities

- Synchronizes document status from local agents.
- Maintains the authoritative cloud ledger.
- Provides summary statistics for the management dashboard.

## Running Locally

1. Install dependencies: `pip install -r requirements.txt`
2. Set up environment variables in `.env` (copy from `.env.example`).
3. Run the server: `uvicorn app.main:app --reload --port 8000`

## API Endpoints

- `POST /api/intake/register`: Initial document discovery and ID allocation sync.
- `POST /api/documents/{doc_id}/upload-complete`: Mark as uploaded to Paperless.
- `GET /api/dashboard/summary`: Get status distribution statistics.
