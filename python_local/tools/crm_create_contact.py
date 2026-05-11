"""
CRM create contact tool - creates a new contact in Zoho CRM.
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
    Create a new contact in Zoho CRM.
    
    Args:
        args: {
            "full_name": str - Full name (required)
            "email": str - Email address (optional)
            "phone": str - Phone number (optional)
            "note": str - Optional notes/description (optional)
        }
        env: Environment context
    
    Returns:
        {
            "success": bool,
            "contact": {
                "id": str,
                "full_name": str,
                "email": str,
                "phone": str,
                "status": str
            },
            "error": str (if failed)
        }
    """
    full_name = args.get("full_name")
    email = args.get("email")
    phone = args.get("phone")
    note = args.get("note")
    
    if not full_name:
        return {
            "success": False,
            "contact": None,
            "error": "full_name is required"
        }
    
    try:
        crm = ZohoCRM()
        contact = await crm.create_contact(
            full_name=full_name,
            email=email,
            phone=phone,
            note=note
        )
        
        return {
            "success": True,
            "contact": contact
        }
    
    except IntegrationError as e:
        return {
            "success": False,
            "contact": None,
            "error": str(e)
        }
    except Exception as e:
        return {
            "success": False,
            "contact": None,
            "error": f"Unexpected error: {str(e)}"
        }

