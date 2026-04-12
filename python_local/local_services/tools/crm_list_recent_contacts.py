"""
CRM list recent contacts tool - lists the most recently updated contacts.
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
    List the most recently updated contacts.
    
    Args:
        args: {
            "limit": int - Maximum number of contacts to return (default: 10)
        }
        env: Environment context
    
    Returns:
        {
            "contacts": [
                {
                    "id": str,
                    "full_name": str,
                    "email": str,
                    "phone": str,
                    "account": str,
                    "last_activity": str
                }
            ],
            "error": str (if failed)
        }
    """
    limit = args.get("limit", 10)
    
    try:
        crm = ZohoCRM()
        contacts = await crm.list_recent_contacts(limit=limit)
        
        return {
            "contacts": contacts
        }
    
    except IntegrationError as e:
        return {
            "contacts": [],
            "error": str(e)
        }
    except Exception as e:
        return {
            "contacts": [],
            "error": f"Unexpected error: {str(e)}"
        }

