import os

os.environ["APP_ENV"] = "test"
os.environ["MONGO_DB_NAME"] = "greenplus_progress_test"

from backend.app import create_app
from backend.database import client as db_client


def setup_function():
    db_client._memory_store.clear()
    db_client._client = None


def register(client, name, email):
    response = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": "StrongPass123!"},
        environ_base={"REMOTE_ADDR": email},
    )
    return response.get_json()["data"]["access_token"]


def test_quiz_completion_is_idempotent_and_user_scoped():
    app = create_app()
    with app.test_client() as client:
        first_token = register(client, "First", "first@example.com")
        second_token = register(client, "Second", "second@example.com")
        first_headers = {"Authorization": f"Bearer {first_token}"}
        second_headers = {"Authorization": f"Bearer {second_token}"}

        created = client.post("/api/progress/quizzes", json={"quizId": "quiz-energy", "xp": 60}, headers=first_headers)
        duplicate = client.post("/api/progress/quizzes", json={"quizId": "quiz-energy", "xp": 60}, headers=first_headers)
        client.patch("/api/progress/state", json={"bookmarkedSchemes": ["scheme-1"], "streak": 4}, headers=first_headers)
        client.post("/api/progress/logs", json={"type": "energy", "values": {"gridEnergy": 10}}, headers=first_headers)

        assert created.status_code == 201
        assert created.get_json()["data"]["created"] is True
        assert duplicate.status_code == 200
        assert duplicate.get_json()["data"]["created"] is False

        first_progress = client.get("/api/progress", headers=first_headers).get_json()["data"]
        second_progress = client.get("/api/progress", headers=second_headers).get_json()["data"]
        assert first_progress["state"]["bookmarkedSchemes"] == ["scheme-1"]
        assert first_progress["stats"]["completedQuizzes"] == ["quiz-energy"]
        assert len(first_progress["logs"]) == 1
        assert second_progress["state"] == {}
        assert second_progress["stats"]["completedQuizzes"] == []
        assert second_progress["logs"] == []
