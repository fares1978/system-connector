"""Connector business rules; the router handles HTTP and the repository handles MongoDB."""

from datetime import datetime, timezone

from fastapi import HTTPException, status

from conectmanager.models import ClientRequest, ProviderRequest, TargetRequest
from conectmanager.repository import ConnectorRepository


class ConnectorService:
    def __init__(self, repository: ConnectorRepository):
        self.repository = repository

    async def add_provider(self, owner_id: str, payload: ProviderRequest) -> dict:
        now = datetime.now(timezone.utc)
        return await self.repository.add(
            "providers",
            owner_id,
            {
                **payload.model_dump(),
                "created_at": now,
                "updated_at": now,
            },
        )

    async def list_providers(self, owner_id: str, skip: int, limit: int) -> list[dict]:
        return await self.repository.list("providers", owner_id, skip, limit)

    async def add_target(self, owner_id: str, payload: TargetRequest) -> dict:
        now = datetime.now(timezone.utc)
        return await self.repository.add(
            "targets",
            owner_id,
            {
                **payload.model_dump(),
                "created_at": now,
                "updated_at": now,
            },
        )

    async def list_targets(self, owner_id: str, skip: int, limit: int) -> list[dict]:
        return await self.repository.list("targets", owner_id, skip, limit)

    async def add_client(self, owner_id: str, payload: ClientRequest) -> dict:
        for collection, item_id in (
            ("providers", payload.provider_id),
            ("targets", payload.target_id),
        ):
            if not await self.repository.exists(collection, owner_id, item_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"{collection[:-1].capitalize()} not found",
                )
        now = datetime.now(timezone.utc)
        return await self.repository.add(
            "clients",
            owner_id,
            {
                **payload.model_dump(mode="json"),
                "created_at": now,
                "updated_at": now,
            },
        )

    async def list_clients(self, owner_id: str, skip: int, limit: int) -> list[dict]:
        return await self.repository.list("clients", owner_id, skip, limit)
