"""API routes for book projects."""
from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime

from utils.db import get_db_connection, json_serialize, json_deserialize

router = APIRouter(prefix="/api/books", tags=["books"])


class BookCreate(BaseModel):
    working_title: str
    focus: Optional[str] = None
    arc_json: Optional[dict] = None
    purpose: Optional[str] = None
    audience: Optional[str] = None
    tone_json: Optional[dict] = None
    pov: Optional[str] = None
    length_target_words: Optional[int] = None
    chapter_count: Optional[int] = None
    constraints_json: Optional[dict] = None


class BookUpdate(BaseModel):
    working_title: Optional[str] = None
    focus: Optional[str] = None
    arc_json: Optional[dict] = None
    purpose: Optional[str] = None
    audience: Optional[str] = None
    tone_json: Optional[dict] = None
    pov: Optional[str] = None
    length_target_words: Optional[int] = None
    chapter_count: Optional[int] = None
    constraints_json: Optional[dict] = None
    style_anchor: Optional[str] = None
    status: Optional[str] = None


@router.post("")
async def create_book(book: BookCreate):
    """Create a new book project."""
    book_id = str(uuid.uuid4())
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    cursor.execute("""
        INSERT INTO book_projects (
            id, working_title, focus, arc_json, purpose, audience,
            tone_json, pov, length_target_words, chapter_count,
            constraints_json, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        book_id,
        book.working_title,
        book.focus,
        json_serialize(book.arc_json),
        book.purpose,
        book.audience,
        json_serialize(book.tone_json),
        book.pov,
        book.length_target_words,
        book.chapter_count,
        json_serialize(book.constraints_json),
        "proposing",
        now,
        now
    ))
    
    conn.commit()
    conn.close()
    
    return {"id": book_id, "working_title": book.working_title}


@router.get("")
async def list_books():
    """List all book projects."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM book_projects
        ORDER BY updated_at DESC
    """)
    
    rows = cursor.fetchall()
    conn.close()
    
    books = []
    for row in rows:
        book = dict(row)
        # Deserialize JSON fields
        if book.get("arc_json"):
            book["arc_json"] = json_deserialize(book["arc_json"])
        if book.get("tone_json"):
            book["tone_json"] = json_deserialize(book["tone_json"])
        if book.get("constraints_json"):
            book["constraints_json"] = json_deserialize(book["constraints_json"])
        books.append(book)
    
    return {"books": books}


@router.get("/{book_id}")
async def get_book(book_id: str):
    """Get a specific book project."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (book_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    
    book = dict(row)
    # Deserialize JSON fields
    if book.get("arc_json"):
        book["arc_json"] = json_deserialize(book["arc_json"])
    if book.get("tone_json"):
        book["tone_json"] = json_deserialize(book["tone_json"])
    if book.get("constraints_json"):
        book["constraints_json"] = json_deserialize(book["constraints_json"])
    
    return book


@router.patch("/{book_id}")
async def update_book(book_id: str, update: BookUpdate):
    """Update a book project."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check exists
    cursor.execute("SELECT id FROM book_projects WHERE id = ?", (book_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Build update query
    updates = []
    values = []
    
    if update.working_title is not None:
        updates.append("working_title = ?")
        values.append(update.working_title)
    if update.focus is not None:
        updates.append("focus = ?")
        values.append(update.focus)
    if update.arc_json is not None:
        updates.append("arc_json = ?")
        values.append(json_serialize(update.arc_json))
    if update.purpose is not None:
        updates.append("purpose = ?")
        values.append(update.purpose)
    if update.audience is not None:
        updates.append("audience = ?")
        values.append(update.audience)
    if update.tone_json is not None:
        updates.append("tone_json = ?")
        values.append(json_serialize(update.tone_json))
    if update.pov is not None:
        updates.append("pov = ?")
        values.append(update.pov)
    if update.length_target_words is not None:
        updates.append("length_target_words = ?")
        values.append(update.length_target_words)
    if update.chapter_count is not None:
        updates.append("chapter_count = ?")
        values.append(update.chapter_count)
    if update.constraints_json is not None:
        updates.append("constraints_json = ?")
        values.append(json_serialize(update.constraints_json))
    if update.style_anchor is not None:
        updates.append("style_anchor = ?")
        values.append(update.style_anchor)
    if update.status is not None:
        updates.append("status = ?")
        values.append(update.status)
    
    if not updates:
        conn.close()
        return {"message": "No updates provided"}
    
    updates.append("updated_at = ?")
    values.append(datetime.utcnow().isoformat())
    values.append(book_id)
    
    query = f"UPDATE book_projects SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, values)
    
    conn.commit()
    conn.close()
    
    return {"message": "Book updated"}

