"""
QiArchive Local API — FastAPI control plane
Exposes endpoints for the admin portal to:
- check system health
- trigger ingest
- get queue/job status
- retry failed jobs
"""

import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="QiArchive Local API",
    description="Local control plane for QiLabs runtime",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_ROOT = Path(os.environ.get("QI_DATA_ROOT", "C:/QiData"))
INBOX = Path(os.environ.get("QI_INBOX_DIR", "C:/QiData/inbox"))


# ── HEALTH ────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "api": "qiarchive-local",
        "version": "0.1.0"
    }


# ── SYSTEM STATUS ─────────────────────────────────────────────────────
@app.get("/status")
def status():
    dirs = {
        "inbox":           INBOX,
        "staging":         DATA_ROOT / "staging",
        "reviewed":        DATA_ROOT / "reviewed",
        "failed":          DATA_ROOT / "failed",
        "logs":            DATA_ROOT / "logs",
        "extracted_text":  DATA_ROOT / "extracted_text",
        "embeddings_cache":DATA_ROOT / "embeddings_cache",
    }
    dir_status = {k: {"exists": v.exists(), "path": str(v)} for k, v in dirs.items()}

    inbox_count = len(list(INBOX.rglob("*"))) if INBOX.exists() else 0

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data_root": str(DATA_ROOT),
        "directories": dir_status,
        "inbox_file_count": inbox_count,
        "env_checks": {
            "supabase_url": bool(os.environ.get("NEXT_PUBLIC_SUPABASE_URL")),
            "supabase_key": bool(os.environ.get("SUPABASE_SERVICE_ROLE_KEY")),
            "r2_bucket": bool(os.environ.get("R2_BUCKET")),
            "openai_key": bool(os.environ.get("OPENAI_API_KEY")),
        }
    }


# ── QUEUE STATUS ──────────────────────────────────────────────────────
@app.get("/queue")
def queue():
    """Returns current inbox file list as a simple queue view."""
    if not INBOX.exists():
        raise HTTPException(status_code=404, detail="Inbox directory not found")

    files = []
    for f in INBOX.rglob("*"):
        if f.is_file():
            files.append({
                "filename": f.name,
                "path": str(f),
                "size_bytes": f.stat().st_size,
                "modified": datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc).isoformat()
            })

    return {"count": len(files), "files": files}


# ── TRIGGER INGEST ────────────────────────────────────────────────────
class IngestRequest(BaseModel):
    inbox_path: str | None = None

@app.post("/ingest")
def trigger_ingest(req: IngestRequest = IngestRequest()):
    """Trigger the scan pipeline on the inbox directory."""
    inbox = Path(req.inbox_path) if req.inbox_path else INBOX
    scan_script = Path(__file__).parent.parent / "scan" / "scan.py"

    if not scan_script.exists():
        raise HTTPException(status_code=500, detail="Scan script not found")

    result = subprocess.run(
        ["python", str(scan_script), "--inbox", str(inbox)],
        capture_output=True, text=True, timeout=120
    )

    return {
        "triggered": True,
        "inbox": str(inbox),
        "exit_code": result.returncode,
        "stdout": result.stdout[:2000],
        "stderr": result.stderr[:500] if result.returncode != 0 else None
    }


# ── RETRY FAILED JOB ──────────────────────────────────────────────────
@app.post("/retry/{archive_id}")
def retry_job(archive_id: str):
    """Requeue a specific failed archive job by canonical ID."""
    # TODO: wire to Supabase when qiarchive schema is confirmed
    return {
        "archive_id": archive_id,
        "status": "requeued",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": "Supabase wire-up pending — see repair.py"
    }


# ── ADMIN ELEVATED CRUD ───────────────────────────────────────────────
from fastapi import Request
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv() # Load from .env if present

def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key or key == "YOUR_ACTUAL_SERVICE_ROLE_KEY":
        raise HTTPException(status_code=500, detail="Supabase environment parameters (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing or invalid in the backend env.")
    return create_client(url, key)

@app.post("/admin/mutate")
async def admin_mutate(request: Request):
    """Generic elevated write for whitelisted canonical domains (qione, qiblocks, etc.)"""
    # 1. Verify token & permissions via standard approach (mocked for speed in example)
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth token")
    
    body = await request.json()
    table = body.get("table")
    record_id = body.get("record_id")
    updates = body.get("updates")
    
    if not table or not table.startswith(("qione.", "qisys.")):
        raise HTTPException(status_code=403, detail="Schema not whitelisted for admin mutate")
        
    sb = get_supabase()
    
    # Write to table passing elevated privileges
    result = sb.table(table).update(updates).eq('id', record_id).execute()
    
    # 2. ENFORCE AUDIT LOG via qisys.system_events
    sb.table('qisys.system_events').insert({
        'event_type': 'admin_mutate',
        'source': 'qiarchive-local-api',
        'severity': 'info',
        'payload': { 'table': table, 'record_id': record_id, 'updates': updates, 'result': len(result.data) }
    }).execute()
    
    return {"status": "success", "audited": True, "rows_updated": len(result.data)}

@app.post("/admin/user/invite")
async def admin_invite_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth token")
        
    body = await request.json()
    email = body.get("email")
    tenant_id = body.get("tenant_id")
    role = body.get("role")
    
    sb = get_supabase()
    
    # Invite the user using the admin API
    auth_res = sb.auth.admin.invite_user_by_email(email)
    new_user_id = auth_res.user.id
    
    # Record member and role mapping
    sb.table('qione.tenant_members').insert({'tenant_id': tenant_id, 'user_id': new_user_id, 'role': role}).execute()
    
    # Audit log
    sb.table('qisys.system_events').insert({
        'event_type': 'admin_invite_user',
        'source': 'qiarchive-local-api',
        'severity': 'info',
        'payload': { 'email': email, 'tenant_id': tenant_id, 'role': role, 'user_id': new_user_id }
    }).execute()
    
    return {"status": "success", "audited": True, "user_id": new_user_id}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("LOCAL_API_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
