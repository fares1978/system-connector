"""Authenticated create/list HTTP endpoints for connector resources."""

from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth.dependencies import get_current_user
from auth.models import UserPublic
from conectmanager.models import (
    Client,
    ClientRequest,
    Provider,
    ProviderRequest,
    TargetPublic,
    TargetRequest,
)
from conectmanager.repository import ConnectorRepository
from conectmanager.service import ConnectorService
from database import get_db

router = APIRouter(prefix="/connectmanager", tags=["connectmanager"])


def get_service(db: AsyncIOMotorDatabase = Depends(get_db)) -> ConnectorService:  # noqa: B008
    return ConnectorService(ConnectorRepository(db))


@router.post("/providers", response_model=Provider, status_code=status.HTTP_201_CREATED)
async def add_provider(
    payload: ProviderRequest,
    user: UserPublic = Depends(get_current_user),  # noqa: B008
    service: ConnectorService = Depends(get_service),  # noqa: B008
):
    return await service.add_provider(user.id, payload)


@router.get("/providers", response_model=list[Provider])
async def list_providers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: UserPublic = Depends(get_current_user),  # noqa: B008
    service: ConnectorService = Depends(get_service),  # noqa: B008
):
    return await service.list_providers(user.id, skip, limit)


@router.post(
    "/targets", response_model=TargetPublic, status_code=status.HTTP_201_CREATED
)
async def add_target(
    payload: TargetRequest,
    user: UserPublic = Depends(get_current_user),  # noqa: B008
    service: ConnectorService = Depends(get_service),  # noqa: B008
):
    return await service.add_target(user.id, payload)


@router.get("/targets", response_model=list[TargetPublic])
async def list_targets(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: UserPublic = Depends(get_current_user),  # noqa: B008
    service: ConnectorService = Depends(get_service),  # noqa: B008
):
    return await service.list_targets(user.id, skip, limit)


@router.post("/clients", response_model=Client, status_code=status.HTTP_201_CREATED)
async def add_client(
    payload: ClientRequest,
    user: UserPublic = Depends(get_current_user),  # noqa: B008
    service: ConnectorService = Depends(get_service),  # noqa: B008
):
    return await service.add_client(user.id, payload)


@router.get("/clients", response_model=list[Client])
async def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: UserPublic = Depends(get_current_user),  # noqa: B008
    service: ConnectorService = Depends(get_service),  # noqa: B008
):
    return await service.list_clients(user.id, skip, limit)
