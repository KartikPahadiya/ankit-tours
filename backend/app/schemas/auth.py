from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    phone: str | None = Field(
        default=None,
        min_length=10,
        max_length=20,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128,
    )


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    role: str
    is_verified: bool

    model_config = {
        "from_attributes": True,
    }
