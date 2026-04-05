"""
Database connection and migration utilities for SQLite local core.
"""
import sqlite3
from pathlib import Path
import json

QIOS_ROOT = Path(__file__).parent.parent.parent
DB_PATH = QIOS_ROOT / "data" / "vector" / "qios_local.db"
MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def get_connection():
    """Get SQLite connection to qios_local.db."""
    # Ensure directory exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    return conn


def run_migrations():
    """Run all migrations in order."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create migrations tracking table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL
        )
    """)
    
    # Get applied migrations
    cursor.execute("SELECT version FROM schema_migrations")
    applied = {row[0] for row in cursor.fetchall()}
    
    # Find migration files
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    
    for migration_file in migration_files:
        version = migration_file.stem  # e.g., "001_init"
        
        if version in applied:
            continue
        
        # Read and execute migration
        sql = migration_file.read_text(encoding="utf-8")
        
        # SQLite doesn't support multi-statement execution by default
        # Split by semicolon and execute each statement
        statements = [s.strip() for s in sql.split(";") if s.strip()]
        
        for statement in statements:
            if statement:
                try:
                    cursor.execute(statement)
                except sqlite3.OperationalError as e:
                    # Ignore "duplicate column" errors (column already exists)
                    if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                        print(f"  Note: {statement[:50]}... (already applied, skipping)")
                    else:
                        # Re-raise other operational errors
                        raise
        
        # Record migration
        from datetime import datetime
        cursor.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
            (version, datetime.utcnow().isoformat())
        )
        
        conn.commit()
        print(f"Applied migration: {version}")
    
    conn.close()


def init_db():
    """Initialize database (alias for run_migrations)."""
    run_migrations()

