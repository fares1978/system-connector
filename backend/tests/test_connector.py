"""API smoke tests using an in-memory Motor-compatible database."""

from bson import ObjectId
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

from auth.dependencies import get_current_user
from auth.models import UserPublic
from database import get_db
import main
from main import app


def test_connector_create_list_and_isolation(monkeypatch):
    mock_client = AsyncMongoMockClient()
    monkeypatch.setattr(main, "client", mock_client)
    db = mock_client["connector_test"]
    current = {"id": str(ObjectId())}
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: UserPublic(
        id=current["id"], name="Tester", email="test@example.com", active=True
    )
    try:
        with TestClient(app) as client:
            prefix = "/connectmanager"
            provider = client.post(f"{prefix}/providers", json={
                "name": "Acme", "body_data": "{}", "base_link": "https://example.com",
                "prompt_data": "prompt",
            })
            assert provider.status_code == 201, provider.text
            provider_id = provider.json()["id"]
            assert client.get(f"{prefix}/providers").json()[0]["id"] == provider_id

            target = client.post(f"{prefix}/targets", json={
                "name": "Output", "key": "topsecret", "api_link": "https://example.org",
                "data": "{}", "prompt_data": "prompt",
            })
            assert target.status_code == 201, target.text
            target_id = target.json()["id"]
            assert "topsecret" not in target.text
            assert "topsecret" not in client.get(f"{prefix}/targets").text

            assert client.post(f"{prefix}/clients", json={
                "provider_id": "invalid", "target_id": target_id,
            }).status_code == 404
            created = client.post(f"{prefix}/clients", json={
                "name": "My connection", "provider_id": provider_id,
                "target_id": target_id, "status": "active",
            })
            assert created.status_code == 201, created.text
            assert created.json()["status"] == "active"
            assert client.get(f"{prefix}/clients").json()[0]["id"] == created.json()["id"]
            assert client.get(f"{prefix}/providers?limit=0").status_code == 422
            assert client.get(f"{prefix}/clients?skip=-1").status_code == 422
            assert client.post(f"{prefix}/clients", json={
                "provider_id": provider_id, "target_id": target_id, "status": "other",
            }).status_code == 422

            current["id"] = str(ObjectId())
            for resource in ("providers", "targets", "clients"):
                assert client.get(f"{prefix}/{resource}").json() == []
            assert client.post(f"{prefix}/clients", json={
                "provider_id": provider_id, "target_id": target_id,
            }).status_code == 404
    finally:
        app.dependency_overrides.clear()


def test_connector_requires_auth(monkeypatch):
    monkeypatch.setattr(main, "client", AsyncMongoMockClient())
    with TestClient(app) as client:
        for resource in ("providers", "targets", "clients"):
            assert client.get(f"/connectmanager/{resource}").status_code == 401
