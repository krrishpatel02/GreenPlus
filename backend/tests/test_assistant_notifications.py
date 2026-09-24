import os

os.environ["APP_ENV"] = "test"
os.environ["MONGO_DB_NAME"] = "greenplus_assistant_test"

from backend.app import create_app
from backend.database import client as db_client
from backend.services.intent_classifier import classify_intent


def setup_function():
    db_client._memory_store.clear()
    db_client._client = None


def test_multilingual_intents():
    assert classify_intent("કાલે વરસાદ પડશે?")["intent"] == "RAIN_QUESTION"
    assert classify_intent("kal rain hai?")["intent"] == "RAIN_QUESTION"
    assert classify_intent("પાણી કેટલું બચાવું?")["intent"] == "WATER_CALCULATION"
    assert classify_intent("Can I charge my EV today?")["intent"] == "EV_CHARGING"


def test_assistant_uses_previous_intent_for_follow_up():
    app = create_app()
    with app.test_client() as client:
        register = client.post("/api/auth/register", json={"name": "Asha", "email": "asha@example.com", "password": "StrongPass123!"})
        token = register.get_json()["data"]["access_token"]
        response = client.post(
            "/api/assistant/messages",
            json={"message": "તો washing machine ક્યારે ચલાવું?", "history": [{"intent": "RAIN_QUESTION"}]},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.get_json()["data"]["intent"] in {"SOLAR_USAGE_WINDOW", "RAIN_QUESTION"}


def test_notifications_are_personalized_and_deduplicated():
    app = create_app()
    with app.test_client() as client:
        register = client.post("/api/auth/register", json={"name": "Asha", "email": "asha2@example.com", "password": "StrongPass123!"})
        token = register.get_json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"weather": {"rainProbability": 78}, "userContext": {"solarAvailable": True, "solarActivities": True}}
        first = client.post("/api/notifications/generate", json=payload, headers=headers).get_json()["data"]
        second = client.post("/api/notifications/generate", json=payload, headers=headers).get_json()["data"]
        assert first["created"] is True
        assert first["notification"]["type"] == "RAIN_EXPECTED"
        assert second == {"created": False, "reason": "cooldown"}
        listing = client.get("/api/notifications", headers=headers).get_json()["data"]
        assert listing["unread"] == 1
