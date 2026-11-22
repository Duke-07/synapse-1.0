"""
FastAPI Authentication & Email Verification REST Endpoints (/api/v1/auth).
"""

from typing import Any
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    from backend.app.models.schemas import (
        AuthMessageResponse,
        EmailVerificationRequest,
        PasswordResetConfirm,
        PasswordResetRequest,
        ResendVerificationRequest,
        TokenResponse,
        UserLoginRequest,
        UserProfile,
        UserRegisterRequest,
    )
    from backend.app.services.auth_service import auth_service
    from backend.app.services.email_service import email_service
except ModuleNotFoundError:
    from app.models.schemas import (
        AuthMessageResponse,
        EmailVerificationRequest,
        PasswordResetConfirm,
        PasswordResetRequest,
        ResendVerificationRequest,
        TokenResponse,
        UserLoginRequest,
        UserProfile,
        UserRegisterRequest,
    )
    from app.services.auth_service import auth_service
    from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Authentication & Verification"])
security = HTTPBearer(auto_error=False)


def get_current_user_profile(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, Any]:
    """Dependency verifying active Bearer JWT token and resolving user profile."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = auth_service.decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = auth_service.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User account no longer exists."
        )
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, Any] | None:
    """Optional dependency that yields user profile if valid token is provided, or None."""
    if not credentials or not credentials.credentials:
        return None
    payload = auth_service.decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        return None
    return auth_service.get_user_by_id(payload["sub"])


@router.post(
    "/register", response_model=AuthMessageResponse, status_code=status.HTTP_201_CREATED
)
async def register(req: UserRegisterRequest, background_tasks: BackgroundTasks):
    """
    Registers a new account and dispatches a 6-digit email verification code.
    Delivery is executed asynchronously in the background so API responds instantly.
    """
    try:
        profile, code, token = auth_service.register(
            email=req.email,
            password=req.password,
            full_name=req.full_name,
            dispatch_sync=False,
        )
        background_tasks.add_task(
            email_service.send_verification_email,
            profile["email"],
            profile["full_name"],
            code,
            token,
        )
        return AuthMessageResponse(
            success=True,
            message="Account created successfully! A 6-digit verification code has been dispatched to your email.",
            detail=f"Verification code sent to {profile['email']}. Please check your inbox or spam folder.",
            verification_code_preview=code,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Registration failed: {e}"
        )


@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(req: EmailVerificationRequest):
    """
    Validates the 6-digit OTP code or URL token sent to the user's email.
    Upon successful confirmation, activates the account and returns an active JWT session.
    """
    try:
        access_token, user_profile = auth_service.verify_email(
            email=req.email, code_or_token=req.code
        )
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserProfile(**user_profile),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/resend-verification", response_model=AuthMessageResponse)
async def resend_verification(
    req: ResendVerificationRequest, background_tasks: BackgroundTasks
):
    """
    Issues a fresh 6-digit verification code and emails it to the user.
    Enforces rate-limiting cooldown between requests.
    """
    try:
        code, token, full_name = auth_service.resend_verification(
            email=req.email, dispatch_sync=False
        )
        background_tasks.add_task(
            email_service.send_verification_email,
            req.email,
            full_name,
            code,
            token,
        )
        return AuthMessageResponse(
            success=True,
            message="A fresh 6-digit verification code has been dispatched to your email address.",
            detail="Please check your inbox and spam folder.",
            verification_code_preview=code,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    """
    Authenticates user credentials and issues a cryptographically signed JWT access token.
    """
    try:
        access_token, user_profile = auth_service.login(
            email=req.email, password=req.password
        )
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserProfile(**user_profile),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict[str, Any] = Depends(get_current_user_profile)):
    """
    Returns authenticated user's profile. Requires valid Bearer JWT.
    """
    return UserProfile(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        is_verified=current_user.get("is_verified", False),
        created_at=current_user["created_at"],
    )
