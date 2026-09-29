from datetime import datetime, timezone
from enum import Enum

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
class ClientStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    pending = "pending"


class Client(BaseModel):
    id: str
    name: str | None = None
    provider_id: str
    target_id: str
    status: ClientStatus
    created_at: datetime
    updated_at: datetime


# ── Request / Response schemas ─────────────────────────────────────────────────
class TargetRequest(BaseModel):
    name: str = Field(min_length=3)
    key: str = Field(min_length=3)
    api_link: str
    data: str
    prompt_data: str


class TargetPublic(BaseModel):
    """Never send the target API key to the frontend."""

    id: str
    name: str
    api_link: str
    data: str
    prompt_data: str
    created_at: datetime
    updated_at: datetime


class ProviderRequest(BaseModel):
    name: str = Field(min_length=3)
    body_data: str
    base_link: str
    prompt_data: str


class ClientRequest(BaseModel):
    name: str | None = None
    provider_id: str
    target_id: str
    status: ClientStatus = ClientStatus.pending
