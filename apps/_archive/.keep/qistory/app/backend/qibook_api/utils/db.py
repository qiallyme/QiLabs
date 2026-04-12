"""SQLite database initialization and utilities."""
import sqlite3
import json
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

VAULT_ROOT = Path(__file__).parent.parent.parent.parent / "vault"
DB_PATH = VAULT_ROOT / "global.sqlite"


def get_db_connection() -> sqlite3.Connection:
    """Get a connection to the SQLite database."""
    VAULT_ROOT.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_schema():
    """Initialize the database schema."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # raw_items
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS raw_items (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            source_name TEXT,
            title TEXT,
            created_at TEXT,
            imported_at TEXT NOT NULL,
            text_content TEXT,
            file_path TEXT,
            metadata_json TEXT
        )
    """)

    # chunks
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id TEXT PRIMARY KEY,
            raw_item_id TEXT NOT NULL,
            chunk_text TEXT NOT NULL,
            chunk_order INTEGER,
            embedding_id TEXT,
            extracted_entities_json TEXT,
            timestamp_range_json TEXT,
            FOREIGN KEY(raw_item_id) REFERENCES raw_items(id)
        )
    """)

    # book_projects
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS book_projects (
            id TEXT PRIMARY KEY,
            working_title TEXT NOT NULL,
            focus TEXT,
            arc_json TEXT,
            purpose TEXT,
            audience TEXT,
            tone_json TEXT,
            pov TEXT,
            length_target_words INTEGER,
            chapter_count INTEGER,
            constraints_json TEXT,
            style_anchor TEXT,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # outline_nodes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS outline_nodes (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            parent_id TEXT,
            node_type TEXT NOT NULL,
            title TEXT NOT NULL,
            goal TEXT,
            order_index INTEGER NOT NULL,
            status TEXT NOT NULL,
            word_target INTEGER,
            metadata_json TEXT,
            FOREIGN KEY(book_id) REFERENCES book_projects(id),
            FOREIGN KEY(parent_id) REFERENCES outline_nodes(id)
        )
    """)

    # evidence_links
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evidence_links (
            id TEXT PRIMARY KEY,
            outline_node_id TEXT NOT NULL,
            chunk_id TEXT NOT NULL,
            relevance_score REAL,
            note TEXT,
            FOREIGN KEY(outline_node_id) REFERENCES outline_nodes(id),
            FOREIGN KEY(chunk_id) REFERENCES chunks(id)
        )
    """)

    # draft_branches
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS draft_branches (
            id TEXT PRIMARY KEY,
            outline_node_id TEXT NOT NULL,
            label TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(outline_node_id) REFERENCES outline_nodes(id)
        )
    """)

    # draft_sections
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS draft_sections (
            id TEXT PRIMARY KEY,
            outline_node_id TEXT NOT NULL,
            draft_text TEXT NOT NULL,
            draft_version INTEGER NOT NULL,
            status TEXT NOT NULL,
            editor_notes TEXT,
            content_hash TEXT,
            word_count INTEGER,
            branch_id TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY(outline_node_id) REFERENCES outline_nodes(id),
            FOREIGN KEY(branch_id) REFERENCES draft_branches(id)
        )
    """)
    
    # Migrate existing draft_sections: add branch_id column if missing
    try:
        cursor.execute("ALTER TABLE draft_sections ADD COLUMN branch_id TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists

    # final_context
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS final_context (
            book_id TEXT PRIMARY KEY,
            stitched_text TEXT,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(book_id) REFERENCES book_projects(id)
        )
    """)

    # running_summaries - per chapter and whole book
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS running_summaries (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            outline_node_id TEXT,  -- NULL for whole book summary
            summary_text TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(book_id) REFERENCES book_projects(id),
            FOREIGN KEY(outline_node_id) REFERENCES outline_nodes(id)
        )
    """)

    # style_drift_checks - track style consistency
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS style_drift_checks (
            id TEXT PRIMARY KEY,
            draft_section_id TEXT NOT NULL,
            drift_score REAL,
            drift_issues_json TEXT,
            checked_at TEXT NOT NULL,
            FOREIGN KEY(draft_section_id) REFERENCES draft_sections(id)
        )
    """)

    # narrative_heatmap - per node metrics
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS narrative_heatmap (
            outline_node_id TEXT PRIMARY KEY,
            evidence_density REAL,
            emotional_intensity REAL,
            topic_coverage_score REAL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(outline_node_id) REFERENCES outline_nodes(id)
        )
    """)

    # engine_state
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS engine_state (
            book_id TEXT PRIMARY KEY,
            current_state TEXT NOT NULL,
            outline_cursor_node_id TEXT,
            pending_approval_json TEXT,
            run_history_json TEXT,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(book_id) REFERENCES book_projects(id)
        )
    """)

    conn.commit()
    conn.close()


def json_serialize(value: Any) -> str:
    """Serialize value to JSON string."""
    if value is None:
        return None
    return json.dumps(value) if not isinstance(value, str) else value


def json_deserialize(value: Optional[str]) -> Any:
    """Deserialize JSON string to Python object."""
    if value is None:
        return None
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return value

