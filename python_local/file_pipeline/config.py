"""Pipeline configuration — paths, extensions, Supabase, defaults."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# QiData paths (local filesystem tiers per blueprint §storage)
# ---------------------------------------------------------------------------
QILABS_HOME = Path(os.getenv("QILABS_HOME", "C:/QiLabs"))
QIDATA_ROOT = QILABS_HOME / "QiData"

INBOX_DIR = Path(os.getenv("QI_INBOX_DIR", str(QIDATA_ROOT / "inbox")))
PROCESSING_DIR = Path(os.getenv("QI_PROCESSING_DIR", str(QIDATA_ROOT / "processing")))
REVIEWED_DIR = Path(os.getenv("QI_REVIEWED_DIR", str(QIDATA_ROOT / "reviewed")))
FAILED_DIR = Path(os.getenv("QI_FAILED_DIR", str(QIDATA_ROOT / "failed")))
EXTRACTED_DIR = Path(os.getenv("QI_EXTRACTED_DIR", str(QIDATA_ROOT / "extracted_text")))
EMBEDDINGS_CACHE_DIR = Path(
    os.getenv("QI_EMBEDDINGS_CACHE_DIR", str(QIDATA_ROOT / "embeddings_cache"))
)

# ---------------------------------------------------------------------------
# Supabase connection
# ---------------------------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL", "")

# ---------------------------------------------------------------------------
# File handling
# ---------------------------------------------------------------------------
SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".docx",
    ".doc",
    ".txt",
    ".md",
    ".csv",
    ".xlsx",
    ".xls",
    ".tiff",
    ".tif",
    ".bmp",
    ".webp",
    ".eml",
    ".msg",
}

OCR_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"}

MIME_MAP = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
    ".eml": "message/rfc822",
    ".msg": "application/vnd.ms-outlook",
}

# ---------------------------------------------------------------------------
# Chunking defaults
# ---------------------------------------------------------------------------
DEFAULT_CHUNK_SIZE = 1200
DEFAULT_CHUNK_OVERLAP = 150

# ---------------------------------------------------------------------------
# Embedding
# ---------------------------------------------------------------------------
EMBEDDING_MODEL = os.getenv("QI_EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
EMBEDDING_DIM = int(os.getenv("QI_EMBEDDING_DIM", "384"))

# ---------------------------------------------------------------------------
# Local agent API
# ---------------------------------------------------------------------------
LOCAL_AGENT_HOST = os.getenv("QI_LOCAL_AGENT_HOST", "127.0.0.1")
LOCAL_AGENT_PORT = int(os.getenv("QI_LOCAL_AGENT_PORT", "8420"))

# ---------------------------------------------------------------------------
# Device identity
# ---------------------------------------------------------------------------
DEVICE_ID = os.getenv("QI_DEVICE_ID", "")
AGENT_ID = os.getenv("QI_AGENT_ID", "")

# ---------------------------------------------------------------------------
# Ingest mode
# ---------------------------------------------------------------------------
INGEST_MODE = os.getenv("QI_INGEST_MODE", "watcher")

# ---------------------------------------------------------------------------
# Ensure directories exist
# ---------------------------------------------------------------------------
for _dir in (
    INBOX_DIR,
    PROCESSING_DIR,
    REVIEWED_DIR,
    FAILED_DIR,
    EXTRACTED_DIR,
    EMBEDDINGS_CACHE_DIR,
):
    _dir.mkdir(parents=True, exist_ok=True)
