from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth.models import UserPublic
from auth.security import decode_access_token
from database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_db),  # noqa: B008
) -> UserPublic:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exc

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise credentials_exc

    from bson import ObjectId

    doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    if doc is None or not doc.get("active", True):
        raise credentials_exc

    return UserPublic(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        active=doc["active"],
    )
