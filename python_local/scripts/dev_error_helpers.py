"""
Helper functions for querying and formatting dev_error_log entries.
Used by /dev/code_assist endpoint to inject error context into GINA prompts.
"""

import os
from typing import Optional, List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# Load .env
QIOS_ROOT = Path(__file__).parent.parent.parent
env_path = QIOS_ROOT / ".env"
if env_path.exists():
    load_dotenv(env_path)

try:
    from supabase import create_client, Client
except ImportError:
    supabase = None
else:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    supabase = create_client(supabase_url, supabase_key) if (supabase_url and supabase_key) else None


async def get_recent_errors_for_file(
    file_path: str,
    symbol: Optional[str] = None,
    limit: int = 10,
    include_resolved: bool = False
) -> List[Dict[str, Any]]:
    """
    Query dev_error_log for errors related to a specific file (and optionally symbol).
    
    Args:
        file_path: Path to the file
        symbol: Optional symbol/function name to filter by
        limit: Maximum number of errors to return
        include_resolved: Whether to include resolved errors
    
    Returns:
        List of error dictionaries from dev_error_log table
    """
    if not supabase:
        return []
    
    try:
        query = supabase.table("dev_error_log").select("*").eq("file_path", file_path)
        
        if symbol:
            # If symbol is provided, try to match it in error_message
            # (search for symbol name in the error message)
            query = query.ilike("error_message", f"%{symbol}%")
        
        if not include_resolved:
            query = query.is_("resolved_at", "null")
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return result.data or []
    except Exception as e:
        print(f"[DEV_ERROR] Error querying dev_error_log: {e}")
        return []


def format_errors_for_prompt(errors: List[Dict[str, Any]]) -> str:
    """
    Format error entries from dev_error_log into a readable prompt block.
    
    Args:
        errors: List of error dictionaries from dev_error_log
    
    Returns:
        Formatted string for inclusion in system prompt
    """
    if not errors:
        return "No prior errors recorded for this file.\n"
    
    lines = []
    for idx, e in enumerate(errors, start=1):
        created_at = e.get('created_at', 'unknown date')
        error_type = e.get('error_type', 'unknown')
        error_message = e.get('error_message', 'no message')
        fix_summary = e.get('fix_summary') or e.get('fix') or 'n/a'
        symbol = e.get('symbol', '')
        
        lines.append(
            f"[Error #{idx}] {created_at}\n"
            f"  Type: {error_type}\n"
            f"  Message: {error_message}\n"
            f"  Fix: {fix_summary}"
        )
        if symbol:
            lines[-1] += f"\n  Symbol: {symbol}"
    
    return "\n\n".join(lines)

