from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User


def register_user(
    db: Session,
    name: str,
    email: str,
    phone: str | None,
    password: str,
) -> User:

    existing_user = db.query(User).filter(
        User.email == email.lower()
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    if phone:
        existing_phone = db.query(User).filter(
            User.phone == phone
        ).first()

        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this phone number already exists",
            )

    user = User(
        name=name.strip(),
        email=email.lower(),
        phone=phone,
        password_hash=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User:

    user = db.query(User).filter(
        User.email == email.lower()
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(
        password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled",
        )

    return user


def create_tokens(user: User) -> dict:
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
    }
