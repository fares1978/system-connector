from datetime import datetime

from pydantic import BaseModel


# Models
class User(BaseModel):
    id: str | None = None
    name: str
    email: str
    hashed_password: str
    active: bool = True
    reset_token: str | None = None
    reset_token_expiry: datetime | None = None
    created_at: datetime
    updated_at: datetime
