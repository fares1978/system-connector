from datetime import datetime, timezone

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field


# ── Stored in MongoDB ──────────────────────────────────────────────────────────
class User(BaseModel):
    id: str | None = None
    name: str
    email: str
    hashed_password: str
    active: bool = True
    reset_token: str | None = None
    reset_token_expiry: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Request / Response schemas ─────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class UserPublic(BaseModel):
    """Safe user representation — never expose hashed_password."""

    id: str
    name: str
    email: str
    active: bool


# ── Helper ─────────────────────────────────────────────────────────────────────
def user_to_public(doc: dict) -> UserPublic:
    return UserPublic(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        active=doc.get("active", True),
    )
