"""Service for generating chapter and book recaps."""
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

from utils.db import get_db_connection
from utils.llm import llm


async def generate_chapter_recap(node_id: str) -> str:
    """Generate a recap for a chapter after locking."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
    node = cursor.fetchone()
    if not node:
        conn.close()
        return ""
    node = dict(node)
    book_id = node["book_id"]
    
    # Get locked draft for this node
    cursor.execute("""
        SELECT draft_text FROM draft_sections
        WHERE outline_node_id = ? AND status = 'locked'
        ORDER BY draft_version DESC LIMIT 1
    """, (node_id,))
    draft_row = cursor.fetchone()
    if not draft_row:
        conn.close()
        return ""
    
    draft_text = draft_row["draft_text"]
    
    # Get previous chapter recaps for context
    cursor.execute("""
        SELECT summary_text FROM running_summaries
        WHERE book_id = ? AND outline_node_id IS NOT NULL
        ORDER BY updated_at DESC LIMIT 3
    """, (book_id,))
    previous_recaps = [row["summary_text"] for row in cursor.fetchall()]
    
    conn.close()
    
    # Generate recap
    previous_context = "\n\n".join(previous_recaps) if previous_recaps else "None"
    
    prompt = f"""Generate a brief recap (2-3 sentences) of this chapter section:

Title: {node['title']}
Goal: {node.get('goal', 'Not specified')}

Chapter content:
{draft_text[:2000]}  # Truncate for context

Previous chapters context:
{previous_context[:500]}

Write a concise recap that captures the key events, themes, and narrative progression. This will be used to maintain continuity in future chapters."""

    system = "You are a book writing assistant. Generate concise, narrative recaps that maintain story coherence."
    
    recap_text = await llm.generate(prompt, system=system, temperature=0.5, max_tokens=200)
    
    # Save recap
    recap_id = str(uuid.uuid4())
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT OR REPLACE INTO running_summaries (
            id, book_id, outline_node_id, summary_text, updated_at
        ) VALUES (?, ?, ?, ?, ?)
    """, (
        recap_id,
        book_id,
        node_id,
        recap_text.strip(),
        datetime.utcnow().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    return recap_text.strip()


async def generate_book_recap(book_id: str) -> str:
    """Generate or update the whole book recap."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all chapter recaps
    cursor.execute("""
        SELECT summary_text FROM running_summaries
        WHERE book_id = ? AND outline_node_id IS NOT NULL
        ORDER BY updated_at ASC
    """, (book_id,))
    chapter_recaps = [row["summary_text"] for row in cursor.fetchall()]
    
    if not chapter_recaps:
        conn.close()
        return ""
    
    # Get book details
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (book_id,))
    book = dict(cursor.fetchone())
    conn.close()
    
    # Generate book-level recap
    all_recaps = "\n\n".join(chapter_recaps)
    
    prompt = f"""Generate a concise book-level recap (3-4 sentences) summarizing the narrative so far:

Book: {book['working_title']}
Focus: {book.get('focus', 'Not specified')}

Chapter recaps:
{all_recaps}

Write a high-level summary that captures the overall narrative arc, key themes, and progression. This will be used to maintain coherence as new chapters are written."""

    system = "You are a book writing assistant. Generate high-level narrative summaries."
    
    book_recap = await llm.generate(prompt, system=system, temperature=0.5, max_tokens=300)
    
    # Save or update book recap
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if book recap exists
    cursor.execute("""
        SELECT id FROM running_summaries
        WHERE book_id = ? AND outline_node_id IS NULL
    """, (book_id,))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("""
            UPDATE running_summaries
            SET summary_text = ?, updated_at = ?
            WHERE book_id = ? AND outline_node_id IS NULL
        """, (book_recap.strip(), datetime.utcnow().isoformat(), book_id))
    else:
        recap_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO running_summaries (
                id, book_id, outline_node_id, summary_text, updated_at
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            recap_id,
            book_id,
            None,
            book_recap.strip(),
            datetime.utcnow().isoformat()
        ))
    
    conn.commit()
    conn.close()
    
    return book_recap.strip()


async def get_running_context(book_id: str, include_chapters: bool = True) -> Dict[str, Any]:
    """Get running context (book recap + recent chapter recaps) for draft prompts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get book recap
    cursor.execute("""
        SELECT summary_text FROM running_summaries
        WHERE book_id = ? AND outline_node_id IS NULL
    """, (book_id,))
    book_recap_row = cursor.fetchone()
    book_recap = book_recap_row["summary_text"] if book_recap_row else ""
    
    # Get recent chapter recaps
    chapter_recaps = []
    if include_chapters:
        cursor.execute("""
            SELECT summary_text FROM running_summaries
            WHERE book_id = ? AND outline_node_id IS NOT NULL
            ORDER BY updated_at DESC LIMIT 5
        """, (book_id,))
        chapter_recaps = [row["summary_text"] for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "book_recap": book_recap,
        "chapter_recaps": chapter_recaps,
        "full_context": f"Book recap: {book_recap}\n\nRecent chapters: {' | '.join(chapter_recaps)}" if book_recap or chapter_recaps else ""
    }

