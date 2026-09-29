"""MongoDB persistence for connector resources (all queries scoped to a user)."""

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class ConnectorRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    @staticmethod
    def serialize(doc: dict) -> dict:
        return {
            "id": str(doc["_id"]),
            **{k: v for k, v in doc.items() if k not in ("_id", "owner_id")},
        }

    async def add(self, collection: str, owner_id: str, data: dict) -> dict:
        doc = {**data, "owner_id": owner_id}
        result = await self.db[collection].insert_one(doc)
        doc["_id"] = result.inserted_id
        return self.serialize(doc)

    async def list(
        self, collection: str, owner_id: str, skip: int, limit: int
    ) -> list[dict]:
        cursor = (
            self.db[collection]
            .find({"owner_id": owner_id})
            .sort("_id", -1)
            .skip(skip)
            .limit(limit)
        )
        return [self.serialize(doc) async for doc in cursor]

    async def exists(self, collection: str, owner_id: str, item_id: str) -> bool:
        if not ObjectId.is_valid(item_id):
            return False
        return (
            await self.db[collection].find_one(
                {"_id": ObjectId(item_id), "owner_id": owner_id}, {"_id": 1}
            )
            is not None
        )
