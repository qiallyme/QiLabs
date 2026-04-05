"""Configuration for local-only runtime."""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load .env.local if it exists
env_path = Path(__file__).parent.parent.parent.parent / ".env.local"
if env_path.exists():
    load_dotenv(env_path)
else:
    # Also try .env in project root
    env_path = Path(__file__).parent.parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)

# Vault root (portable data directory)
VAULT_ROOT = Path(__file__).parent.parent.parent.parent / "vault"
VAULT_ROOT.mkdir(parents=True, exist_ok=True)

# Project root
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent

# Models directory
MODELS_DIR = PROJECT_ROOT / "models"

# LanceDB path
LANCEDB_PATH = VAULT_ROOT / "lancedb"
LANCEDB_PATH.mkdir(parents=True, exist_ok=True)

# Local LLM configuration
LLM_BACKEND = os.getenv("QIBOOK_LLM_BACKEND", "ollama")  # ollama | llama.cpp | lmstudio
LLM_MODEL = os.getenv("QIBOOK_LLM_MODEL", "llama3.2")
LLM_BASE_URL = os.getenv("QIBOOK_LLM_BASE_URL", "http://localhost:11434")  # Ollama default

# Embedding model
EMBEDDING_MODEL = os.getenv("QIBOOK_EMBEDDING_MODEL", "nomic-embed-text")
EMBEDDING_DIM = 768  # nomic-embed-text dimension

# Chunking defaults
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100

# Retrieval defaults
RETRIEVAL_TOP_K = 20

# API settings
API_HOST = "127.0.0.1"
API_PORT = 8000

