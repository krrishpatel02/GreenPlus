import os

import pytest

os.environ["MONGO_DB_NAME"] = "greenplus_test"

from backend.app import create_app
from backend.database import client as db_client


@pytest.fixture
def client():
    db_client._memory_store.clear()
    db_client._client = None
    app = create_app()
    app.config.update(TESTING=True)
    with app.test_client() as client:
        yield client


def test_register_and_login_flow(client):
    register = client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "StrongPass123!"},
    )
    assert register.status_code == 201, register.get_data(as_text=True)
    payload = register.get_json()
    assert payload["success"] is True
    assert "access_token" in payload["data"]

    login = client.post(
        "/api/auth/login",
        json={"email": "ada@example.com", "password": "StrongPass123!"},
    )
    assert login.status_code == 200, login.get_data(as_text=True)
    token = login.get_json()["data"]["access_token"]
    assert token

    profile = client.patch(
        "/api/auth/profile",
        json={"name": "Ada New"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert profile.status_code == 200, profile.get_data(as_text=True)
    assert profile.get_json()["data"]["user"]["name"] == "Ada New"


def test_profile_requires_auth(client):
    response = client.patch("/api/auth/profile", json={"name": "Hacker"})
    assert response.status_code == 401
    body = response.get_json()
    assert body["success"] is False
    assert body["error"]["code"] == "UNAUTHENTICATED"


def test_default_admin_is_bootstrapped(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@greenplus.local", "password": "GreenPlusAdmin123!"},
    )
    assert response.status_code == 200, response.get_data(as_text=True)
    body = response.get_json()
    assert body["success"] is True
    assert body["data"]["user"]["role"] == "ADMIN"


def test_admin_requires_admin_role(client):
    register = client.post(
        "/api/auth/register",
        json={"name": "User", "email": "user@example.com", "password": "StrongPass123!"},
    )
    token = register.get_json()["data"]["access_token"]

    overview = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert overview.status_code == 403
    body = overview.get_json()
    assert body["success"] is False
    assert body["error"]["code"] == "FORBIDDEN"
