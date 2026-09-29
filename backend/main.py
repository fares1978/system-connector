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


# Helper function to convert MongoDB document to response
# def item_helper(item) -> dict:
#     return {
#         "id": str(item["_id"]),
#         "name": item["name"],
#         "description": item.get("description"),
#         "price": item["price"],
#         "quantity": item["quantity"],
#     }


@app.get("/")
async def root():
    return {"message": "FastAPI Backend is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# @app.post("/items", response_model=models.ItemResponse)
# async def create_item(item: models.Item):
#     item_dict = item.model_dump()
#     result = await items_collection.insert_one(item_dict)
#     new_item = await items_collection.find_one({"_id": result.inserted_id})
#     return item_helper(new_item)


# @app.get("/items", response_model=list[models.ItemResponse])
# async def get_items():
#     items = []
#     async for item in items_collection.find():
#         items.append(item_helper(item))
#     return items


# @app.get("/items/{item_id}", response_model=models.ItemResponse)
# async def get_item(item_id: str):
#     try:
#         item = await items_collection.find_one({"_id": ObjectId(item_id)})
#         if item:
#             return item_helper(item)
#         raise HTTPException(status_code=404, detail="Item not found")
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid item ID")


# @app.put("/items/{item_id}", response_model=models.ItemResponse)
# async def update_item(item_id: str, item: models.Item):
#     try:
#         item_dict = item.model_dump()
#         result = await items_collection.update_one(
#             {"_id": ObjectId(item_id)}, {"$set": item_dict}
#         )
#         if result.modified_count == 1:
#             updated_item = await items_collection.find_one({"_id": ObjectId(item_id)})
#             return item_helper(updated_item)
#         raise HTTPException(status_code=404, detail="Item not found")
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid item ID")


# @app.delete("/items/{item_id}")
# async def delete_item(item_id: str):
#     try:
#         result = await items_collection.delete_one({"_id": ObjectId(item_id)})
#         if result.deleted_count == 1:
#             return {"message": "Item deleted successfully"}
#         raise HTTPException(status_code=404, detail="Item not found")
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid item ID")
