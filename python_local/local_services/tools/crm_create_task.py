"""
CRM create task tool - creates a task for a contact in Zoho CRM.
"""
from typing import Dict, Any
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from integrations.zoho.crm import ZohoCRM
from integrations.base import IntegrationError


async def run(args: Dict[str, Any], env: Dict) -> Dict[str, Any]:
    """
    Create a task for a contact in CRM.
    
    Args:
        args: {
            "contact_id": str - Zoho contact ID (required)
            "title": str - Task title (required)
            "due_date": str - ISO 8601 date string (optional)
            "description": str - Task description (optional)
        }
        env: Environment context
    
    Returns:
        {
            "success": bool,
            "task": {
                "id": str,
                "title": str,
                "due_date": str,
                "status": str,
                "contact_id": str
            },
            "error": str (if failed)
        }
    """
    contact_id = args.get("contact_id")
    title = args.get("title")
    due_date = args.get("due_date")
    description = args.get("description")
    
    if not contact_id or not title:
        return {
            "success": False,
            "task": None,
            "error": "contact_id and title are required"
        }
    
    try:
        crm = ZohoCRM()
        task = await crm.create_task_for_contact(
            contact_id=contact_id,
            title=title,
            due_date=due_date,
            description=description
        )
        
        return {
            "success": True,
            "task": task
        }
    
    except IntegrationError as e:
        return {
            "success": False,
            "task": None,
            "error": str(e)
        }
    except Exception as e:
        return {
            "success": False,
            "task": None,
            "error": f"Unexpected error: {str(e)}"
        }

