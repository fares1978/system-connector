import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from motor.motor_asyncio import AsyncIOMotorClient

# import models

# Remove default handler and add a custom one
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
    "<level>{message}</level>",
    level="INFO",
    colorize=True,
)

# MongoDB connection
MONGODB_URL = os.getenv(
    "MONGODB_URL", "mongodb://admin:password123@localhost:27017/?authSource=admin"
)
DATABASE_NAME = os.getenv("DATABASE_NAME", "appdb")

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]
items_collection = db.items


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 FastAPI Backend starting up...")
    logger.info(f"Connecting to MongoDB at {MONGODB_URL} (db={DATABASE_NAME})")
    try:
        await client.admin.command("ping")
        logger.info("✅ MongoDB connection verified")
    except Exception as e:
        logger.warning(f"⚠️ MongoDB not reachable at startup: {e}")
        logger.warning("Server will start anyway; requests hitting Mongo will fail.")
        raise
        # don't raise — let the app boot
    yield
    logger.info("🛑 FastAPI Backend shutting down...")
    client.close()


app = FastAPI(title="FastAPI Backend", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "FastAPI Backend is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
