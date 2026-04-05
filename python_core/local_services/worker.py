"""
QiOS Local Core Worker
Processes ingestion_queue items: extracts, embeds, writes to semantic_profile.
"""
import os
import json
import time
import hashlib
import sqlite3
import uuid
import traceback
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Optional

# Load .env file from project root
try:
    from dotenv import load_dotenv
    QIOS_ROOT = Path(__file__).parent.parent.parent
    env_path = QIOS_ROOT / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv not installed, use system env vars

from db import get_connection
from jobs import fetch_next_pending_job
from job_processor import process_job
from text_extractor import extract_text_from_file, should_process_file, get_file_priority

# Ollama for embeddings (local-first)
try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False
    raise ImportError("Need httpx for Ollama embeddings")

# Supabase client for writing embeddings
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    print("Warning: supabase-py not installed. Install with: pip install supabase")

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_EMBEDDING_MODEL = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
EMBEDDING_DIM = 768  # nomic-embed-text dimension

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

WORKER_NAME = os.getenv("WORKER_NAME", "local-worker-01")
# Deterministic worker ID based on worker name (not random UUID)
WORKER_ID = f"local_{WORKER_NAME.replace('-', '_')}"
BATCH_SIZE = int(os.getenv("WORKER_BATCH_SIZE", "5"))
SLEEP_MS = int(os.getenv("WORKER_SLEEP_MS", "300"))

# Initialize Supabase client if available
supabase_client: Optional[Client] = None
if HAS_SUPABASE and SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print(f"[WORKER] Supabase client initialized: {SUPABASE_URL}")
    except Exception as e:
        print(f"[WORKER] Warning: Failed to initialize Supabase client: {e}")
        supabase_client = None
elif not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("[WORKER] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Embeddings will not be written to Supabase.")


class EmbeddingError(Exception):
    """Error generating embedding."""
    pass


async def get_embedding(text: str) -> list[float]:
    """
    Get embedding for text using Ollama API.
    
    Returns:
        list[float]: 768-dimensional embedding vector
        
    Raises:
        EmbeddingError: If embedding generation fails
    """
    if not text or not text.strip():
        raise EmbeddingError("Cannot embed empty text.")
    
    url = f"{OLLAMA_BASE_URL}/api/embeddings"
    payload = {
        "model": OLLAMA_EMBEDDING_MODEL,
        "prompt": text,
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
    except Exception as e:
        raise EmbeddingError(f"Ollama connection failed: {e}") from e
    
    if resp.status_code != 200:
        raise EmbeddingError(f"Ollama error {resp.status_code}: {resp.text}")
    
    data = resp.json()
    embedding = data.get("embedding")
    
    if not embedding or not isinstance(embedding, list):
        raise EmbeddingError("Invalid embedding format from Ollama.")
    
    # Validate dimension
    if len(embedding) != EMBEDDING_DIM:
        raise EmbeddingError(f"Unexpected embedding dimension: {len(embedding)} (expected {EMBEDDING_DIM})")
    
    return embedding


def update_worker_status(status: str, current_task: Optional[str] = None, meta_extra: Optional[dict] = None):
    """
    Update worker_status table with current state.
    
    Args:
        status: Worker status ("idle", "working", "error", "offline", etc.)
        current_task: Optional short description of current task
        meta_extra: Optional additional metadata (e.g., load_percent, queue_depth)
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        now = datetime.utcnow().isoformat()
        # Build meta object
        meta = {}
        if current_task:
            meta["current_task"] = current_task
        if meta_extra:
            meta.update(meta_extra)
        
        # Migration 005 made worker_name the PRIMARY KEY
        # Migration 006 added worker_id column with unique index
        # We need to use worker_name for ON CONFLICT since it's the PK
        
        # Check if worker_id column exists
        cursor.execute("PRAGMA table_info(worker_status)")
        columns = {row[1]: row for row in cursor.fetchall()}
        has_worker_id = 'worker_id' in columns
        
        # Get existing created_at to preserve it
        cursor.execute("SELECT created_at FROM worker_status WHERE worker_name = ?", (WORKER_NAME,))
        existing_row = cursor.fetchone()
        existing_created_at = existing_row[0] if existing_row else now
        
        # Always use worker_name for ON CONFLICT (it's the PRIMARY KEY)
        if has_worker_id:
            cursor.execute("""
                INSERT INTO worker_status (
                    worker_name, worker_id, status, last_heartbeat, meta, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(worker_name) DO UPDATE SET
                    worker_id = COALESCE(excluded.worker_id, worker_id),
                    status = excluded.status,
                    last_heartbeat = excluded.last_heartbeat,
                    meta = excluded.meta,
                    updated_at = excluded.updated_at
            """, (
                WORKER_NAME,
                WORKER_ID,
                status,
                now,
                json.dumps(meta),
                existing_created_at,
                now
            ))
        else:
            cursor.execute("""
                INSERT INTO worker_status (
                    worker_name, status, last_heartbeat, meta, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(worker_name) DO UPDATE SET
                    status = excluded.status,
                    last_heartbeat = excluded.last_heartbeat,
                    meta = excluded.meta,
                    updated_at = excluded.updated_at
            """, (
                WORKER_NAME,
                status,
                now,
                json.dumps(meta),
                existing_created_at,
                now
            ))
        conn.commit()
    except Exception as e:
        print(f"Warning: Failed to update worker status: {e}")
    finally:
        conn.close()


def process_queue_item(item_id: str, file_path: str, extracted_text: str, slug: str, realm: Optional[str]):
    """
    Process a single queue item: embed and write to semantic_profile.
    
    Uses Ollama for embeddings and writes to Supabase.
    
    Returns:
        tuple: (success: bool, chunks: int, embeddings_written: int, errors: list)
    """
    print(f"[INGEST] Starting {item_id} {file_path}")
    
    conn = get_connection()
    cursor = conn.cursor()
    chunks_processed = 0
    embeddings_written = 0
    errors = []
    
    try:
        # Simple chunking: split by paragraphs (double newline) or sentences
        # For now, treat entire file as one chunk
        chunks = [extracted_text] if extracted_text else []
        
        print(f"[INGEST] {item_id} produced {len(chunks)} chunks")
        
        if not chunks:
            error_msg = "No content to embed"
            print(f"[EMBED ERROR] {item_id}: {error_msg}")
            cursor.execute("""
                UPDATE ingestion_queue
                SET status = 'error', updated_at = ?, meta = json_set(COALESCE(meta, '{}'), '$.error', ?)
                WHERE id = ?
            """, (datetime.utcnow().isoformat(), error_msg, item_id))
            conn.commit()
            conn.close()
            return (False, 0, 0, [error_msg])
        
        # Check if Supabase client is available
        if not supabase_client:
            error_msg = "Supabase client not initialized. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            print(f"[EMBED ERROR] {item_id}: {error_msg}")
            cursor.execute("""
                UPDATE ingestion_queue
                SET status = 'error', updated_at = ?, meta = json_set(COALESCE(meta, '{}'), '$.error', ?)
                WHERE id = ?
            """, (datetime.utcnow().isoformat(), error_msg, item_id))
            conn.commit()
            conn.close()
            return (False, 0, 0, [error_msg])
        
        # Process each chunk
        for idx, chunk_text in enumerate(chunks):
            try:
                print(f"[INGEST] {item_id} chunk {idx+1}/{len(chunks)} embedding...")
                
                # Get embedding (async call via asyncio.run)
                try:
                    embedding = asyncio.run(get_embedding(chunk_text))
                except EmbeddingError as e:
                    error_msg = f"Failed to generate embedding for chunk {idx+1}: {str(e)}"
                    print(f"[EMBED ERROR] {item_id} chunk {idx+1}: {error_msg}")
                    errors.append(error_msg)
                    continue
                except Exception as e:
                    error_msg = f"Unexpected error generating embedding for chunk {idx+1}: {str(e)}"
                    print(f"[EMBED ERROR] {item_id} chunk {idx+1}: {error_msg}")
                    print(traceback.format_exc())
                    errors.append(error_msg)
                    continue
                
                # Write to Supabase semantic_profile
                profile_id = str(uuid.uuid4())
                now = datetime.utcnow().isoformat()
                
                # Prepare data for Supabase
                # Use Supabase schema: chunk_id, chunk_text, file_path, realm, embedding
                chunk_id = f"{file_path}:chunk:{idx}"
                supabase_data = {
                    "id": profile_id,
                    "chunk_id": chunk_id,
                    "chunk_text": chunk_text,
                    "embedding": embedding,  # Supabase will handle vector(768) type
                    "file_path": file_path,
                    "realm": realm,
                    "realm_slug": None,  # Can be extracted from realm if needed
                    "extracted_text": chunk_text,
                    "embedding_status": "complete",
                    "node_id": None,  # Not linking to node table for now
                    "created_at": now,
                    "updated_at": now
                }
                
                try:
                    # Insert into Supabase
                    result = supabase_client.table("semantic_profile").insert(supabase_data).execute()
                    
                    if result.data:
                        embeddings_written += 1
                        chunks_processed += 1
                        print(f"[INGEST] {item_id} chunk {idx+1}/{len(chunks)} embedded successfully (Supabase)")
                    else:
                        error_msg = f"Supabase insert returned no data for chunk {idx+1}"
                        print(f"[EMBED ERROR] {item_id} chunk {idx+1}: {error_msg}")
                        errors.append(error_msg)
                        
                except Exception as e:
                    error_msg = f"Failed to write to Supabase for chunk {idx+1}: {str(e)}"
                    print(f"[EMBED ERROR] {item_id} chunk {idx+1}: {error_msg}")
                    print(traceback.format_exc())
                    errors.append(error_msg)
                    continue
                
            except Exception as e:
                error_msg = f"Error processing chunk {idx+1}: {str(e)}"
                print(f"[EMBED ERROR] {item_id} chunk {idx+1}: {error_msg}")
                print(traceback.format_exc())
                errors.append(error_msg)
                continue
        
        # Mark ingestion_queue as complete if at least one chunk succeeded
        if embeddings_written > 0:
            now = datetime.utcnow().isoformat()
            cursor.execute("""
                UPDATE ingestion_queue
                SET status = 'complete', updated_at = ?, meta = json_set(COALESCE(meta, '{}'), '$.chunks', ?, '$.embeddings_written', ?)
                WHERE id = ?
            """, (now, chunks_processed, embeddings_written, item_id))
            conn.commit()
            print(f"[INGEST] {item_id} completed: {embeddings_written} embeddings written to Supabase")
            conn.close()
            return (True, chunks_processed, embeddings_written, errors)
        else:
            # All chunks failed
            error_msg = "All chunks failed to embed"
            cursor.execute("""
                UPDATE ingestion_queue
                SET status = 'error', updated_at = ?, meta = json_set(COALESCE(meta, '{}'), '$.error', ?)
                WHERE id = ?
            """, (datetime.utcnow().isoformat(), error_msg, item_id))
            conn.commit()
            conn.close()
            return (False, chunks_processed, embeddings_written, errors)
            
    except Exception as e:
        error_msg = f"Fatal error processing {item_id}: {str(e)}"
        print(f"[INGEST ERROR] {error_msg}")
        print(traceback.format_exc())
        conn.rollback()
        # Mark as error
        try:
            cursor.execute("""
                UPDATE ingestion_queue
                SET status = 'error', updated_at = ?, meta = json_set(COALESCE(meta, '{}'), '$.error', ?)
                WHERE id = ?
            """, (datetime.utcnow().isoformat(), error_msg, item_id))
            conn.commit()
        except Exception as e2:
            print(f"[INGEST ERROR] Failed to mark as error: {e2}")
        conn.close()
        return (False, chunks_processed, embeddings_written, [error_msg])


def process_jobs_loop():
    """Process background jobs (vault_crawl, full_reindex, etc.)."""
    print(f"[JOB PROCESSOR] Starting job processor for worker: {WORKER_NAME}")
    
    while True:
        try:
            # Fetch next pending job
            job = fetch_next_pending_job()
            
            if not job:
                # No jobs to process, sleep briefly
                time.sleep(2)
                continue
            
            print(f"[JOB PROCESSOR] Processing job #{job['id']}: {job['job_type']}")
            update_worker_status("working", f"Processing job {job['job_type']} #{job['id']}")
            
            try:
                process_job(job)
                print(f"[JOB PROCESSOR] Job #{job['id']} completed successfully")
            except Exception as e:
                print(f"[JOB PROCESSOR] Job #{job['id']} failed: {e}")
                print(traceback.format_exc())
                # Job status already updated by process_job
                continue
            
            update_worker_status("idle")
            
        except KeyboardInterrupt:
            print("\n[JOB PROCESSOR] Shutting down job processor...")
            break
        except Exception as e:
            print(f"[JOB PROCESSOR ERROR] Error in job processor loop: {e}")
            print(traceback.format_exc())
            time.sleep(5)
            continue


def worker_loop():
    """
    Main worker loop: poll queue, process items.
    
    This runs in an infinite loop and never exits unless:
    - KeyboardInterrupt (Ctrl+C) - sets status to "offline" and exits
    - Fatal database errors that prevent any recovery
    
    All other exceptions are caught, logged, and the loop continues.
    """
    print(f"Starting worker: {WORKER_NAME}")
    print(f"Batch size: {BATCH_SIZE}, Sleep: {SLEEP_MS}ms")
    print(f"Ollama: {OLLAMA_BASE_URL}, Model: {OLLAMA_EMBEDDING_MODEL}")
    
    if not supabase_client:
        print("WARNING: Supabase client not initialized. Embeddings will not be written to Supabase.")
        print("  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.")
    
    # Initial status update
    update_worker_status("idle")
    last_heartbeat_update = time.time()
    HEARTBEAT_INTERVAL = 30  # Update heartbeat every 30 seconds even when idle
    
    while True:
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Fetch pending items with file type prioritization
            # Priority: .md (1), .txt (2), .csv (3), .pdf (4), others (999)
            # Note: file_ext might be NULL, so we use COALESCE
            cursor.execute("""
                SELECT 
                    id, file_path, extracted_text, slug, realm, status, 
                    COALESCE(file_ext, '') as file_ext
                FROM ingestion_queue
                WHERE status = 'pending'
                ORDER BY 
                    CASE 
                        WHEN COALESCE(file_ext, '') = '.md' THEN 1
                        WHEN COALESCE(file_ext, '') = '.txt' THEN 2
                        WHEN COALESCE(file_ext, '') = '.csv' THEN 3
                        WHEN COALESCE(file_ext, '') = '.pdf' THEN 4
                        ELSE 999
                    END,
                    created_at ASC
                LIMIT ?
            """, (BATCH_SIZE,))
            
            items = cursor.fetchall()
            conn.close()
            
            if not items:
                # No items to process - update heartbeat periodically to show we're alive
                current_time = time.time()
                if current_time - last_heartbeat_update >= HEARTBEAT_INTERVAL:
                    update_worker_status("idle")
                    last_heartbeat_update = current_time
                time.sleep(SLEEP_MS / 1000.0)
                continue
            
            # Process batch
            print(f"[WORKER] Found {len(items)} pending items, processing...")
            update_worker_status("working", f"Processing {len(items)} items", {"queue_depth": len(items)})
            
            for row in items:
                # Row structure: id, file_path, extracted_text, slug, realm, status, file_ext
                item_id, file_path, extracted_text, slug, realm, status, file_ext = row
                
                # Handle NULL extracted_text (SQLite returns None for NULL values)
                if extracted_text is None:
                    extracted_text = ""
                
                # Get file extension if not in row
                if not file_ext:
                    file_ext = Path(file_path).suffix if file_path else ""
                
                try:
                    # Check if file type is supported
                    can_process, reason = should_process_file(file_ext)
                    if not can_process:
                        # Skip unsupported file types gracefully (don't mark as error)
                        print(f"[WORKER] Skipping {file_path}: {reason}")
                        conn = get_connection()
                        cursor = conn.cursor()
                        cursor.execute("""
                            UPDATE ingestion_queue
                            SET status = 'complete', updated_at = ?, 
                                meta = json_set(COALESCE(meta, '{}'), '$.skip_reason', ?)
                            WHERE id = ?
                        """, (datetime.utcnow().isoformat(), reason, item_id))
                        conn.commit()
                        conn.close()
                        continue
                    
                    # Mark as processing (atomic update - only if still pending)
                    conn = get_connection()
                    cursor = conn.cursor()
                    now = datetime.utcnow().isoformat()
                    cursor.execute("""
                        UPDATE ingestion_queue
                        SET status = 'processing', updated_at = ?, meta = json_set(COALESCE(meta, '{}'), '$.started_at', ?)
                        WHERE id = ? AND status = 'pending'
                    """, (now, now, item_id))
                    rows_updated = cursor.rowcount
                    conn.commit()
                    conn.close()
                    
                    # If no rows updated, another worker grabbed it - skip
                    if rows_updated == 0:
                        print(f"[WORKER] Item {item_id} already claimed by another worker, skipping")
                        continue
                    
                    # Extract text if missing
                    if not extracted_text:
                        print(f"[WORKER] Extracting text from {file_path}...")
                        # Build full path (assume file_path is relative to QiOS root)
                        qios_root = Path(__file__).parent.parent.parent
                        full_path = qios_root / file_path
                        
                        extracted_text = extract_text_from_file(str(full_path), file_ext)
                        
                        if not extracted_text:
                            # Extraction failed - mark as error
                            print(f"[WORKER] Failed to extract text from {file_path}, marking as error")
                            conn = get_connection()
                            cursor = conn.cursor()
                            cursor.execute("""
                                UPDATE ingestion_queue
                                SET status = 'error', updated_at = ?, 
                                    meta = json_set(COALESCE(meta, '{}'), '$.error', 'Text extraction failed')
                                WHERE id = ?
                            """, (datetime.utcnow().isoformat(), item_id))
                            conn.commit()
                            conn.close()
                            continue
                        
                        # Update queue item with extracted text
                        conn = get_connection()
                        cursor = conn.cursor()
                        cursor.execute("""
                            UPDATE ingestion_queue
                            SET extracted_text = ?, updated_at = ?
                            WHERE id = ?
                        """, (extracted_text, datetime.utcnow().isoformat(), item_id))
                        conn.commit()
                        conn.close()
                        print(f"[WORKER] Successfully extracted text from {file_path}")
                    
                    # Process item
                    update_worker_status("working", f"Embedding {file_path}", {"current_file": file_path})
                    success, chunks, embeddings_written, errors = process_queue_item(item_id, file_path, extracted_text, slug, realm)
                    
                    if success:
                        print(f"[OK] Processed: {file_path} ({embeddings_written} embeddings)")
                    else:
                        print(f"[FAIL] Failed: {file_path} - {errors}")
                
                except Exception as e:
                    # Error processing this item - mark as error but continue loop
                    print(f"[WORKER ERROR] Failed to process {item_id}: {e}")
                    print(traceback.format_exc())
                    try:
                        conn = get_connection()
                        cursor = conn.cursor()
                        cursor.execute("""
                            UPDATE ingestion_queue
                            SET status = 'error', updated_at = ?, meta = json_set(COALESCE(meta, '{}'), '$.error', ?)
                            WHERE id = ?
                        """, (datetime.utcnow().isoformat(), str(e), item_id))
                        conn.commit()
                        conn.close()
                    except:
                        pass
                    # Continue to next item - don't break the loop
                    continue
            
            # Small delay between batches
            time.sleep(SLEEP_MS / 1000.0)
            
        except KeyboardInterrupt:
            print("\n[WORKER] Shutting down worker...")
            update_worker_status("offline")
            break
        except Exception as e:
            # Log error but continue loop - don't let exceptions kill the worker
            print(f"[WORKER ERROR] Error in worker loop: {e}")
            print(traceback.format_exc())
            # Set status to "error" but also update heartbeat so worker is still visible
            # This allows the worker to recover and be detected as "active" even when errored
            update_worker_status("error", str(e))
            time.sleep(5)  # Wait before retrying
            # Continue loop - don't break
            continue


if __name__ == "__main__":
    import sys
    # Allow running as job processor only: python worker.py --jobs-only
    if len(sys.argv) > 1 and sys.argv[1] == "--jobs-only":
        process_jobs_loop()
    else:
        # Default: run both ingestion queue and job processing in parallel
        import threading
        
        # Start job processor in background thread
        job_thread = threading.Thread(target=process_jobs_loop, daemon=True)
        job_thread.start()
        
        # Run ingestion queue processing in main thread
        worker_loop()

