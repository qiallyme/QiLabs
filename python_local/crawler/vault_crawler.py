"""
Vault crawler for QiOS Local Core.
Walks directory trees, tracks file changes, and enqueues files for ingestion.
"""
import os
import hashlib
import sqlite3
import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Tuple

from db import get_connection

# Default crawl roots (prioritize QiVault first)
DEFAULT_CRAWL_ROOTS = [
    "realms/qivault/kb",  # Highest priority - Genesis, rules, architecture
    "docs",
    "rules",
    "templates",
    # Future: projects, data, sites, etc.
]

# File extensions to process
ALLOWED_EXTENSIONS = {".md", ".txt", ".html", ".json"}

# Directories to skip
SKIP_DIRS = {
    "node_modules",
    ".git",
    ".DS_Store",
    "__pycache__",
    ".venv",
    "venv",
    ".archive",
    ".trash",
    ".private",
    "dist",
    "build",
}


def compute_content_hash(file_path: Path) -> Optional[str]:
    """Compute SHA256 hash of file contents."""
    try:
        with open(file_path, "rb") as f:
            content = f.read()
            return hashlib.sha256(content).hexdigest()
    except Exception as e:
        print(f"[CRAWLER] Failed to hash {file_path}: {e}")
        return None


def should_process_file(file_path: Path) -> bool:
    """Check if file should be processed."""
    # Check extension
    if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
        return False
    
    # Check if in skip directory
    parts = file_path.parts
    for skip_dir in SKIP_DIRS:
        if skip_dir in parts:
            return False
    
    return True


def read_file_content(file_path: Path) -> Optional[str]:
    """Read file content as text."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        # Try with different encoding
        try:
            with open(file_path, "r", encoding="latin-1") as f:
                return f.read()
        except Exception as e:
            print(f"[CRAWLER] Failed to read {file_path}: {e}")
            return None
    except Exception as e:
        print(f"[CRAWLER] Failed to read {file_path}: {e}")
        return None


def enqueue_embedding_job(file_path: str, full_path: Path, reason: str = "initial", cursor=None, conn=None) -> bool:
    """
    Enqueue a file for embedding.
    
    Args:
        file_path: Path to file (relative to QiOS root)
        full_path: Full Path object to the file (for reading content)
        reason: Reason for enqueueing (e.g., "initial", "changed", "rescan")
        cursor: Optional existing cursor (if provided, uses it; otherwise creates new connection)
        conn: Optional existing connection (must be provided if cursor is provided)
    
    Returns:
        True if enqueued, False if already exists
    """
    should_close = False
    if cursor is None:
        conn = get_connection()
        cursor = conn.cursor()
        should_close = True
    
    try:
        # Check if already in queue with pending/processing status
        cursor.execute("""
            SELECT id FROM ingestion_queue
            WHERE file_path = ? AND status IN ('pending', 'processing')
        """, (file_path,))
        existing = cursor.fetchone()
        
        if existing:
            if should_close:
                conn.close()
            return False  # Already queued
        
        # Read file content for extracted_text
        extracted_text = read_file_content(full_path)
        if extracted_text is None:
            print(f"[CRAWLER] Warning: Could not read content from {file_path}, skipping")
            if should_close:
                conn.close()
            return False
        
        # Insert new queue item
        item_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Extract slug from file path
        slug = Path(file_path).stem
        
        # Determine file extension and mime type
        file_ext = full_path.suffix
        mime_type = "text/markdown" if file_ext == ".md" else "text/plain"
        
        cursor.execute("""
            INSERT INTO ingestion_queue (
                id, file_path, slug, status, extracted_text, file_ext, mime_type, meta, created_at, updated_at
            ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
        """, (
            item_id,
            file_path,
            slug,
            extracted_text,
            file_ext,
            mime_type,
            json.dumps({"reason": reason}),
            now,
            now
        ))
        
        if should_close:
            conn.commit()
            conn.close()
        return True
    
    except sqlite3.IntegrityError:
        # File already in queue (unique constraint)
        if should_close:
            conn.close()
        return False
    except Exception as e:
        print(f"[CRAWLER] Failed to enqueue {file_path}: {e}")
        if should_close:
            conn.rollback()
            conn.close()
        return False


def crawl_directory(root: Path, base_path: Path) -> Tuple[int, int, int, int]:
    """
    Crawl a single directory tree.
    
    Returns:
        tuple: (scanned_files, new_files, changed_files, enqueued)
    """
    scanned_files = 0
    new_files = 0
    changed_files = 0
    enqueued = 0
    
    if not root.exists():
        print(f"[CRAWLER] Directory does not exist: {root}")
        return (0, 0, 0, 0)
    
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    # Track files seen in this crawl
    seen_paths = set()
    
    try:
        # Walk directory tree
        for dirpath, dirnames, filenames in os.walk(root):
            # Filter out skip directories
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            
            for filename in filenames:
                file_path = Path(dirpath) / filename
                
                # Check if should process
                if not should_process_file(file_path):
                    continue
                
                scanned_files += 1
                
                # Get relative path from base
                try:
                    rel_path = str(file_path.relative_to(base_path))
                except ValueError:
                    # File not under base path - skip
                    continue
                
                seen_paths.add(rel_path)
                
                # Compute content hash
                content_hash = compute_content_hash(file_path)
                if not content_hash:
                    continue
                
                # Check file_registry
                cursor.execute("""
                    SELECT content_hash, last_ingested_at, status
                    FROM file_registry
                    WHERE file_path = ?
                """, (rel_path,))
                row = cursor.fetchone()
                
                if not row:
                    # New file
                    new_files += 1
                    cursor.execute("""
                        INSERT INTO file_registry (
                            file_path, content_hash, last_seen_at, last_changed_at,
                            status, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, 'known', ?, ?)
                    """, (rel_path, content_hash, now, now, now, now))
                    
                    # Enqueue for ingestion (pass cursor to reuse connection)
                    if enqueue_embedding_job(rel_path, file_path, "initial", cursor=cursor, conn=conn):
                        enqueued += 1
                
                else:
                    # Existing file
                    old_hash, last_ingested, status = row
                    
                    if content_hash != old_hash:
                        # File changed
                        changed_files += 1
                        cursor.execute("""
                            UPDATE file_registry
                            SET content_hash = ?,
                                last_seen_at = ?,
                                last_changed_at = ?,
                                status = 'known',
                                updated_at = ?
                            WHERE file_path = ?
                        """, (content_hash, now, now, now, rel_path))
                        
                        # Enqueue for re-embedding (pass cursor to reuse connection)
                        if enqueue_embedding_job(rel_path, file_path, "changed", cursor=cursor, conn=conn):
                            enqueued += 1
                    else:
                        # File unchanged - just update last_seen_at
                        cursor.execute("""
                            UPDATE file_registry
                            SET last_seen_at = ?,
                                updated_at = ?
                            WHERE file_path = ?
                        """, (now, now, rel_path))
        
        # Mark files as deleted if they were in registry under this root but not seen
        # Only check files that start with the root path
        root_str = str(root.relative_to(base_path))
        cursor.execute("""
            SELECT file_path FROM file_registry
            WHERE status = 'known' AND file_path LIKE ?
        """, (f"{root_str}%",))
        registered_under_root = {row[0] for row in cursor.fetchall()}
        
        deleted = registered_under_root - seen_paths
        if deleted:
            for deleted_path in deleted:
                cursor.execute("""
                    UPDATE file_registry
                    SET status = 'deleted',
                        updated_at = ?
                    WHERE file_path = ?
                """, (now, deleted_path))
        
        conn.commit()
        conn.close()
        
        return (scanned_files, new_files, changed_files, enqueued)
    
    except Exception as e:
        print(f"[CRAWLER] Error crawling {root}: {e}")
        conn.rollback()
        conn.close()
        return (scanned_files, new_files, changed_files, enqueued)


def crawl(roots: Optional[List[str]] = None) -> Dict[str, int]:
    """
    Crawl specified root directories and enqueue files for ingestion.
    
    Args:
        roots: List of root directories to crawl (relative to QiOS root).
               If None, uses DEFAULT_CRAWL_ROOTS.
    
    Returns:
        Dict with scan statistics: scanned_files, new_files, changed_files, enqueued
    """
    from pathlib import Path
    
    # Get QiOS root (parent of workers/)
    qios_root = Path(__file__).parent.parent.parent
    
    if roots is None:
        roots = DEFAULT_CRAWL_ROOTS
    
    total_scanned = 0
    total_new = 0
    total_changed = 0
    total_enqueued = 0
    
    print(f"[CRAWLER] Starting crawl of {len(roots)} root(s)")
    
    for root_str in roots:
        root_path = qios_root / root_str
        
        print(f"[CRAWLER] Crawling: {root_str}")
        scanned, new, changed, enqueued = crawl_directory(root_path, qios_root)
        
        total_scanned += scanned
        total_new += new
        total_changed += changed
        total_enqueued += enqueued
        
        print(f"[CRAWLER] {root_str}: scanned={scanned}, new={new}, changed={changed}, enqueued={enqueued}")
    
    print(f"[CRAWLER] Complete: scanned={total_scanned}, new={total_new}, changed={total_changed}, enqueued={total_enqueued}")
    
    return {
        "scanned_files": total_scanned,
        "new_files": total_new,
        "changed_files": total_changed,
        "enqueued": total_enqueued
    }

