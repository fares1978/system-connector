from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth.dependencies import get_current_user
from auth.models import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserPublic,
    user_to_public,
)
from auth.security import create_access_token, hash_password, verify_password
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Register ───────────────────────────────────────────────────────────────────
@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    payload: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),  # noqa: B008
):
    existing = await db["users"].find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    now = datetime.now(timezone.utc)
    doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "hashed_password": hash_password(payload.password),
        "active": False,
        "reset_token": None,
        "reset_token_expiry": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id

    user_public = user_to_public(doc)
    token = create_access_token({"sub": user_public.id})

    return TokenResponse(access_token=token, user=user_public)


# ── Login ──────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):  # noqa: B008
    doc = await db["users"].find_one({"email": payload.email.lower()})

    if not doc or not verify_password(payload.password, doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not doc.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    user_public = user_to_public(doc)
    token = create_access_token({"sub": user_public.id})

    return TokenResponse(access_token=token, user=user_public)


# ── Me (protected) ─────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserPublic)
async def me(current_user: UserPublic = Depends(get_current_user)):  # noqa: B008
    return current_user


# ── Logout  ────────────────────────────────────────────────────────────────────
# JWT is stateless — logout is handled client-side by discarding the token.
# This endpoint exists so the frontend has a clean call to make on logout.
@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(_: UserPublic = Depends(get_current_user)):  # noqa: B008
    return {"message": "Logged out successfully"}
