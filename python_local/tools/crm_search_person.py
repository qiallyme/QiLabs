"""
CRM search tool - searches for a person in Zoho CRM.
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
    Search for a person in CRM.
    
    Args:
        args: {
            "query": str - Name or email to search for
        }
        env: Environment context
    
    Returns:
        {
            "query": str,
            "contacts": [
                {
                    "id": str,
                    "name": str,
                    "email": str,
                    "phone": str,
                    "account": str,
                    "last_activity": str
                }
            ]
        }
    """
    query = args.get("query", "")
    
    if not query:
        return {
            "query": query,
            "contacts": [],
            "error": "Query is required"
        }
    
    try:
        crm = ZohoCRM()
        contacts = await crm.search_contact(query, limit=5)
        
        return {
            "query": query,
            "contacts": contacts
        }
    
    except IntegrationError as e:
        return {
            "query": query,
            "contacts": [],
            "error": str(e)
        }
    except Exception as e:
        return {
            "query": query,
            "contacts": [],
            "error": f"Unexpected error: {str(e)}"
        }

