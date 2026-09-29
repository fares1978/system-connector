from datetime import datetime, timezone

from pydantic import BaseModel, Field


# ── Target in MongoDB ──────────────────────────────────────────────────────────
class Target(BaseModel):
    id: str | None = None
    name: str
    key: str
    api_link: str
    data: str
    prompt_data: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Provider in MongoDB ──────────────────────────────────────────────────────────
class Provider(BaseModel):
    id: str | None = None
    name: str
    body_data: str
    base_link: str
    prompt_data: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Client in MongoDB ──────────────────────────────────────────────────────────
class Client(BaseModel):
    id: str | None = None
    name: str | None = None
    provider: Provider
    target: Target
    status: str  # maybe enum: "active", "inactive", "pending"

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Request / Response schemas ─────────────────────────────────────────────────
class TargetRequest(BaseModel):
    api_link: str
    data: str
    prompt_data: str


class ProviderRequest(BaseModel):
    body_data: str
    base_link: str
    prompt_data: str


class ClientRequest(BaseModel):
    name: str | None = None
    provider: ProviderRequest
    target: TargetRequest
    status: str  # maybe enum: "active", "inactive", "pending"
