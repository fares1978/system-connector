import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from auth.router import router as auth_router
from conectmanager.router import router as connectmanager_router
from database import client

# ── Logging ────────────────────────────────────────────────────────────────────
logger.remove()
logger.add(
    sys.stdout,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="INFO",
    colorize=True,
)


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 FastAPI Backend starting up...")
    try:
        await client.admin.command("ping")
        logger.info("✅ MongoDB connection verified")
    except Exception as e:
        logger.error(f"❌ MongoDB not reachable: {e}")
        raise
    yield
    logger.info("🛑 FastAPI Backend shutting down...")
    client.close()


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="System Connector API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOW_ORIGINS", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(connectmanager_router)


# ── Base routes ────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "System Connector API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
