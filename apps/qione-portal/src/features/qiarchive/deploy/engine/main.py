from fastapi import FastAPI, BackgroundTasks
import os
from datetime import datetime

app = FastAPI(title="QiArchive Engine", version="1.0.0")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "QiArchive Engine",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/ingest/trigger")
async def trigger_ingest(background_tasks: BackgroundTasks):
    # This will eventually call the logic from scripts/ingest/main.py
    # background_tasks.add_task(run_ingestion_cycle)
    return {"message": "Ingestion cycle triggered"}

@app.get("/pipeline/stats")
async def get_stats():
    # Placeholder for status counts from Postgres
    return {
        "inbox": 0,
        "staged": 0,
        "uploaded": 0,
        "error": 0
    }
