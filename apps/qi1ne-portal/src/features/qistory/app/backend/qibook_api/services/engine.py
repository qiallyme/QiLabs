"""Book writing engine orchestrator."""
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

from utils.db import get_db_connection, json_serialize, json_deserialize
from utils.llm import llm

ENGINE_STATES = [
    "INGESTING",
    "ANALYZING",
    "INTERVIEWING",
    "PROPOSING",
    "OUTLINING",
    "OUTLINE_APPROVAL",
    "EVIDENCE_MAPPING",
    "MICRO_SAMPLING",
    "SAMPLE_APPROVAL",
    "DRAFTING_SECTION",
    "SECTION_REVIEW",
    "LOCK_SECTION",
    "MANUSCRIPT_REVIEW",
    "EXPORTING",
    "DONE"
]


def get_engine_state(book_id: str) -> Optional[Dict[str, Any]]:
    """Get current engine state for a book."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM engine_state WHERE book_id = ?", (book_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    state = dict(row)
    if state.get("pending_approval_json"):
        state["pending_approval"] = json_deserialize(state["pending_approval_json"])
    if state.get("run_history_json"):
        state["run_history"] = json_deserialize(state["run_history_json"])
    
    return state


def set_engine_state(
    book_id: str,
    state: str,
    cursor_node_id: Optional[str] = None,
    pending_approval: Optional[Dict[str, Any]] = None,
    run_history: Optional[List[Dict[str, Any]]] = None
):
    """Set engine state for a book."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if state exists
    cursor.execute("SELECT book_id FROM engine_state WHERE book_id = ?", (book_id,))
    exists = cursor.fetchone()
    
    if exists:
        cursor.execute("""
            UPDATE engine_state
            SET current_state = ?, outline_cursor_node_id = ?,
                pending_approval_json = ?, run_history_json = ?,
                updated_at = ?
            WHERE book_id = ?
        """, (
            state,
            cursor_node_id,
            json_serialize(pending_approval),
            json_serialize(run_history),
            datetime.utcnow().isoformat(),
            book_id
        ))
    else:
        cursor.execute("""
            INSERT INTO engine_state (
                book_id, current_state, outline_cursor_node_id,
                pending_approval_json, run_history_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            book_id,
            state,
            cursor_node_id,
            json_serialize(pending_approval),
            json_serialize(run_history),
            datetime.utcnow().isoformat()
        ))
    
    conn.commit()
    conn.close()


def has_unlocked_nodes(book_id: str) -> bool:
    """Check if there are any unlocked outline nodes."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM outline_nodes
        WHERE book_id = ? AND status != 'locked'
    """, (book_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    return result["count"] > 0 if result else False


def next_unlocked_node(book_id: str) -> Optional[Dict[str, Any]]:
    """Get the next unlocked outline node in order."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM outline_nodes
        WHERE book_id = ? AND status != 'locked'
        ORDER BY order_index ASC
        LIMIT 1
    """, (book_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

