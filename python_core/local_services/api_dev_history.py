"""
Dev Error History API for local_core
Provides endpoints to query past errors for GINA context
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
QIOS_ROOT = Path(__file__).parent.parent.parent
env_path = QIOS_ROOT / ".env"
if env_path.exists():
    load_dotenv(env_path)

try:
    from supabase import create_client, Client
except ImportError:
    print("[WARN] supabase-py not installed. Dev history features disabled.")
    supabase = None
else:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    supabase = create_client(supabase_url, supabase_key) if (supabase_url and supabase_key) else None

router = APIRouter(prefix="/dev-history", tags=["dev-history"])


@router.get("/file/{file_path:path}")
async def get_file_error_history(
    file_path: str,
    limit: int = Query(10, ge=1, le=50),
    include_resolved: bool = Query(False)
):
    """
    Get error history for a specific file.
    Used by GINA to provide context about past errors.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        # Normalize path separators
        normalized_path = file_path.replace('\\', '/')
        query = supabase.table("dev_error_log").select("*").eq("file_path", normalized_path)
        
        if not include_resolved:
            query = query.is_("resolved_at", "null")
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return {
            "file_path": file_path,
            "errors": result.data or [],
            "count": len(result.data) if result.data else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying dev history: {str(e)}")


@router.get("/similar")
async def get_similar_errors(
    error_message: str = Query(..., description="Error message to find similar errors for"),
    limit: int = Query(5, ge=1, le=20)
):
    """
    Find similar past errors by error message pattern.
    Useful for "have we seen this before?" queries.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        # Simple pattern matching (can be enhanced with embeddings later)
        result = supabase.table("dev_error_log").select("*").ilike(
            "error_message", f"%{error_message[:50]}%"
        ).order("created_at", desc=True).limit(limit).execute()
        
        return {
            "query": error_message,
            "similar_errors": result.data or [],
            "count": len(result.data) if result.data else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying similar errors: {str(e)}")


@router.get("/recent")
async def get_recent_errors(
    realm: Optional[str] = None,
    error_type: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get recent errors across the project.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        query = supabase.table("dev_error_log").select("*")
        
        if realm:
            query = query.eq("realm", realm)
        if error_type:
            query = query.eq("error_type", error_type)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return {
            "recent_errors": result.data or [],
            "count": len(result.data) if result.data else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying recent errors: {str(e)}")

