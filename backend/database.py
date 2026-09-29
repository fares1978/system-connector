import os

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

MONGODB_URL: str = os.getenv(
    "MONGODB_URL", "mongodb://admin:password123@localhost:27017/?authSource=admin"
)
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "connector")

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGODB_URL)
_db: AsyncIOMotorDatabase = client[DATABASE_NAME]


def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency — returns the shared database instance."""
    return _db
