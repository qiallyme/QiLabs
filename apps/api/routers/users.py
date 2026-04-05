from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Any
from services.auth import get_current_user, TokenData


router = APIRouter()


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    metadata: Optional[dict] = None


@router.get("/me")
async def get_users_me(current_user: TokenData = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": current_user.user_id,
        "email": current_user.email,
        "message": "User profile endpoint - extend with database queries",
    }


@router.get("/")
async def list_users():
    """List all users (admin only in production)"""
    return {"users": [], "message": "User listing endpoint"}


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    return {"id": user_id, "message": "Single user endpoint"}
