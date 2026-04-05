"""
Jobs framework for background task orchestration.
GINA creates jobs, workers execute them asynchronously.
"""
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from db import get_connection


def create_job(job_type: str, params: Optional[Dict[str, Any]] = None) -> int:
    """
    Insert a job with status 'pending', return job id.
    
    Args:
        job_type: Type of job (e.g., 'vault_crawl', 'full_reindex')
        params: Optional parameters dict (will be JSON-encoded)
    
    Returns:
        Job ID (integer)
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    params_json = json.dumps(params) if params else None
    
    cursor.execute("""
        INSERT INTO jobs (job_type, status, params, created_at)
        VALUES (?, ?, ?, ?)
    """, (job_type, 'pending', params_json, now))
    
    job_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return job_id


def update_job_status(
    job_id: int,
    status: str,
    result: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None
):
    """
    Update status + timestamps + result/error as appropriate.
    Also logs status changes to system_event for notifications.
    
    Args:
        job_id: Job ID to update
        status: New status ('pending', 'running', 'complete', 'failed', 'cancelled')
        result: Optional result dict (will be JSON-encoded)
        error_message: Optional error message string
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get current status and job_type for logging
    cursor.execute("SELECT status, job_type FROM jobs WHERE id = ?", (job_id,))
    row = cursor.fetchone()
    old_status = row[0] if row else None
    job_type = row[1] if row else 'unknown'
    
    now = datetime.utcnow().isoformat()
    
    # Build update query based on status
    if status == 'running':
        # Set started_at if not already set
        cursor.execute("""
            UPDATE jobs
            SET status = ?,
                started_at = COALESCE(started_at, ?)
            WHERE id = ?
        """, (status, now, job_id))
    elif status in ('complete', 'failed', 'cancelled'):
        # Set completed_at
        result_json = json.dumps(result) if result else None
        cursor.execute("""
            UPDATE jobs
            SET status = ?,
                completed_at = ?,
                result = ?,
                error_message = ?
            WHERE id = ?
        """, (status, now, result_json, error_message, job_id))
    else:
        # Just update status
        cursor.execute("""
            UPDATE jobs
            SET status = ?
            WHERE id = ?
        """, (status, job_id))
    
    conn.commit()
    conn.close()
    
    # Log status change to system_event (if status actually changed)
    if old_status and old_status != status:
        log_job_status_change(
            job_id=job_id,
            old_status=old_status,
            new_status=status,
            job_type=job_type,
            result=result,
            error_message=error_message
        )


def get_job(job_id: int) -> Optional[Dict[str, Any]]:
    """
    Return one job as a dict.
    
    Args:
        job_id: Job ID to fetch
    
    Returns:
        Job dict or None if not found
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, job_type, status, params, result, created_at, started_at, completed_at, error_message
        FROM jobs
        WHERE id = ?
    """, (job_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    # Parse JSON fields
    params = json.loads(row[3]) if row[3] else None
    result = json.loads(row[4]) if row[4] else None
    
    return {
        'id': row[0],
        'job_type': row[1],
        'status': row[2],
        'params': params,
        'result': result,
        'created_at': row[5],
        'started_at': row[6],
        'completed_at': row[7],
        'error_message': row[8]
    }


def list_jobs(limit: int = 20, job_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Recent jobs, newest first.
    
    Args:
        limit: Maximum number of jobs to return
        job_type: Optional filter by job type
    
    Returns:
        List of job dicts
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    if job_type:
        cursor.execute("""
            SELECT id, job_type, status, params, result, created_at, started_at, completed_at, error_message
            FROM jobs
            WHERE job_type = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (job_type, limit))
    else:
        cursor.execute("""
            SELECT id, job_type, status, params, result, created_at, started_at, completed_at, error_message
            FROM jobs
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    jobs = []
    for row in rows:
        params = json.loads(row[3]) if row[3] else None
        result = json.loads(row[4]) if row[4] else None
        
        jobs.append({
            'id': row[0],
            'job_type': row[1],
            'status': row[2],
            'params': params,
            'result': result,
            'created_at': row[5],
            'started_at': row[6],
            'completed_at': row[7],
            'error_message': row[8]
        })
    
    return jobs


def fetch_next_pending_job() -> Optional[Dict[str, Any]]:
    """
    Fetch the next pending job (oldest first).
    Used by worker loop to process jobs.
    
    Returns:
        Job dict or None if no pending jobs
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, job_type, status, params, result, created_at, started_at, completed_at, error_message
        FROM jobs
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
    """)
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    params = json.loads(row[3]) if row[3] else None
    result = json.loads(row[4]) if row[4] else None
    
    return {
        'id': row[0],
        'job_type': row[1],
        'status': row[2],
        'params': params,
        'result': result,
        'created_at': row[5],
        'started_at': row[6],
        'completed_at': row[7],
        'error_message': row[8]
    }


def format_job_state_for_prompt(job: Dict[str, Any]) -> str:
    """
    Format a job's state as a human-readable string for LLM prompts.
    
    Args:
        job: Job dict from get_job() or list_jobs()
    
    Returns:
        Formatted string describing the job state
    """
    lines = [
        f"Job #{job['id']}: {job['job_type']}",
        f"Status: {job['status']}",
        f"Created: {job['created_at']}",
    ]
    
    if job.get('started_at'):
        lines.append(f"Started: {job['started_at']}")
    else:
        lines.append("Started: Not started yet")
    
    if job.get('completed_at'):
        lines.append(f"Completed: {job['completed_at']}")
    else:
        lines.append("Completed: Not completed yet")
    
    if job.get('error_message'):
        lines.append(f"Error: {job['error_message']}")
    
    if job.get('result'):
        result = job['result']
        if isinstance(result, dict):
            result_lines = []
            for key, value in result.items():
                result_lines.append(f"  - {key}: {value}")
            if result_lines:
                lines.append("Result:")
                lines.extend(result_lines)
        else:
            lines.append(f"Result: {result}")
    
    return "\n".join(lines)


def log_job_status_change(
    job_id: int,
    old_status: str,
    new_status: str,
    job_type: str,
    result: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None
):
    """
    Log a job status change to system_event table.
    This enables notifications and chat integration.
    
    Args:
        job_id: Job ID
        old_status: Previous status
        new_status: New status
        job_type: Type of job
        result: Optional result dict (for completed jobs)
        error_message: Optional error message (for failed jobs)
    """
    from db import get_connection
    
    conn = get_connection()
    cursor = conn.cursor()
    
    event_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    # Build message based on status transition
    if new_status == 'running':
        message = f"Job #{job_id} ({job_type}) started running"
    elif new_status == 'complete':
        if result:
            # Format result summary
            result_summary = ", ".join([f"{k}: {v}" for k, v in result.items() if k != 'errors'])
            message = f"Job #{job_id} ({job_type}) completed successfully: {result_summary}"
        else:
            message = f"Job #{job_id} ({job_type}) completed successfully"
    elif new_status == 'failed':
        message = f"Job #{job_id} ({job_type}) failed: {error_message or 'Unknown error'}"
    elif new_status == 'cancelled':
        message = f"Job #{job_id} ({job_type}) was cancelled"
    else:
        message = f"Job #{job_id} ({job_type}) status changed from {old_status} to {new_status}"
    
    # Build meta object
    meta = {
        "job_id": job_id,
        "job_type": job_type,
        "old_status": old_status,
        "new_status": new_status,
    }
    if result:
        meta["result"] = result
    if error_message:
        meta["error_message"] = error_message
    
    # Determine severity
    if new_status == 'failed':
        severity = 'error'
    elif new_status == 'complete':
        severity = 'info'
    else:
        severity = 'info'
    
    try:
        cursor.execute("""
            INSERT INTO system_event (id, event_type, severity, message, meta, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            event_id,
            'job_status_change',
            severity,
            message,
            json.dumps(meta),
            now
        ))
        conn.commit()
    except Exception as e:
        print(f"[WARNING] Failed to log job status change to system_event: {e}")
    finally:
        conn.close()
