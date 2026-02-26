from fastapi import APIRouter, HTTPException, status
from ..models.schemas import LoginRequest, TokenResponse
from ..services.auth_service import verify_password, create_access_token

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Login with password and receive JWT token.

    Args:
        request: LoginRequest with password

    Returns:
        TokenResponse with access token

    Raises:
        HTTPException: If password is invalid
    """
    if not verify_password(request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(data={"sub": "user", "type": "web_ui"})

    return TokenResponse(access_token=access_token, token_type="bearer")
