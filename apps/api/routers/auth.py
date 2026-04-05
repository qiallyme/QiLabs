from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from config import settings
from schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    AuthResponse,
    MagicLinkRequest,
    MagicLinkConfirm,
    TokenData,
)
from services.auth import AuthService, get_current_user


router = APIRouter()
auth_service = AuthService()


@router.post("/signup", response_model=AuthResponse)
async def signup(user_data: UserCreate):
    """Register a new user with email/password"""
    response = await auth_service.sign_up_with_email(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
    )

    if not response.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create user"
        )

    access_token = auth_service.create_access_token(
        data={"sub": response.user.id, "email": response.user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=response.user.id,
            email=response.user.email,
            full_name=response.user.user_metadata.get("full_name")
            if response.user.user_metadata
            else None,
            created_at=response.user.created_at,
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login(user_data: UserLogin):
    """Login with email/password"""
    response = await auth_service.sign_in_with_email(
        email=user_data.email,
        password=user_data.password,
    )

    if not response.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    access_token = auth_service.create_access_token(
        data={"sub": response.user.id, "email": response.user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=response.user.id,
            email=response.user.email,
            full_name=response.user.user_metadata.get("full_name")
            if response.user.user_metadata
            else None,
            created_at=response.user.created_at,
        ),
    )


@router.post("/magic-link")
async def request_magic_link(request: MagicLinkRequest):
    """Send magic link to email"""
    response = await auth_service.sign_in_with_magic_link(email=request.email)

    return {
        "message": "Magic link sent to email",
        "email": request.email,
        "needs_confirmation": response.session is None,
    }


@router.post("/magic-link/confirm", response_model=AuthResponse)
async def confirm_magic_link(confirm: MagicLinkConfirm):
    """Confirm magic link token and get session"""
    response = await auth_service.verify_magic_link(token=confirm.token)

    if not response.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
        )

    access_token = auth_service.create_access_token(
        data={"sub": response.user.id, "email": response.user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=response.user.id,
            email=response.user.email,
            full_name=response.user.user_metadata.get("full_name")
            if response.user.user_metadata
            else None,
            created_at=response.user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user.user_id,
        email=current_user.email,
        full_name=None,
        metadata={},
    )

    return UserResponse(
        id=response.user.id,
        email=response.user.email,
        full_name=response.user.user_metadata.get("full_name")
        if response.user.user_metadata
        else None,
        created_at=response.user.created_at,
    )


@router.post("/logout")
async def logout(current_user: TokenData = Depends(get_current_user)):
    """Logout current user"""
    return {"message": "Logged out successfully"}
