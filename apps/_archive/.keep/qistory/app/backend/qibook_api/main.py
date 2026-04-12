"""FastAPI main application for local-only book writing engine."""
import sys
from pathlib import Path

# Add backend directory to path so imports work
# This allows route files to use 'from utils.' and 'from services.' imports
backend_dir = Path(__file__).parent.parent
qibook_api_dir = Path(__file__).parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(qibook_api_dir) not in sys.path:
    sys.path.insert(0, str(qibook_api_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from qibook_api.utils.db import init_schema
from qibook_api.utils.config import API_HOST, API_PORT, VAULT_ROOT

# Initialize database schema on startup
init_schema()

app = FastAPI(
    title="QiBook Local API",
    description="Local-only book writing engine",
    version="0.1.0"
)

# CORS for local desktop app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],  # Vite default + alternate port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check."""
    return {"status": "ok", "mode": "local-only"}


@app.get("/api/health")
async def health():
    """Detailed health check."""
    return {
        "status": "ok",
        "mode": "local-only",
        "vault_path": str(VAULT_ROOT)
    }


# Import routes
from qibook_api.routes import raw_items, books, outline, evidence, drafting, manuscript, engine, system, project

app.include_router(raw_items.router)
app.include_router(books.router)
app.include_router(outline.router)
app.include_router(evidence.router)
app.include_router(drafting.router)
app.include_router(manuscript.router)
app.include_router(engine.router)
app.include_router(system.router)
app.include_router(project.router)


if __name__ == "__main__":
    uvicorn.run(app, host=API_HOST, port=API_PORT)

