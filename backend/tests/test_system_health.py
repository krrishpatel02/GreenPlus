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


def test_health_and_ready_endpoints(client):
    health = client.get("/api/health")
    assert health.status_code == 200
    body = health.get_json()
    assert body["success"] is True
    assert body["data"]["service"] == "GreenPlus API"

    ready = client.get("/api/ready")
    assert ready.status_code == 200
    ready_body = ready.get_json()
    assert ready_body["success"] is True
    assert ready_body["data"]["status"] == "ready"