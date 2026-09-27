from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    decode_token,
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_user,
    create_tokens,
    register_user,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    user = register_user(
        db=db,
        name=data.name,
        email=data.email,
        phone=data.phone,
        password=data.password,
    )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db=db,
        email=data.email,
        password=data.password,
    )

    return create_tokens(user)


@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        payload = decode_token(data.refresh_token)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": data.refresh_token,
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
