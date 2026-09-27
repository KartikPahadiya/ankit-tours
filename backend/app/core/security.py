from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    pwd_bytes = plain_password.encode("utf-8")
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))


def get_password_hash(
    password: str,
) -> str:
    return hash_password(password)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[ALGORITHM],
    )
