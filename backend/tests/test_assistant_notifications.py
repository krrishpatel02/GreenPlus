import os
from datetime import datetime, timezone
from unittest.mock import patch

os.environ["APP_ENV"] = "test"
os.environ["MONGO_DB_NAME"] = "greenplus_assistant_test"

from backend.app import create_app
from backend.database import client as db_client
from backend.services.intent_classifier import classify_intent

# Fixed daytime UTC time used to prevent quiet-hours blocking the notification test.
_DAYTIME_UTC = datetime(2026, 9, 26, 14, 0, 0, tzinfo=timezone.utc)


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
        # Patch datetime.now in the notification service so the fixed daytime hour
        # (14:00 UTC) is used instead of the real clock, preventing quiet-hours blocks.
        with patch("backend.services.notification_service.datetime") as mock_dt:
            mock_dt.now.return_value = _DAYTIME_UTC
            mock_dt.side_effect = lambda *args, **kw: datetime(*args, **kw)
            first = client.post("/api/notifications/generate", json=payload, headers=headers).get_json()["data"]
            second = client.post("/api/notifications/generate", json=payload, headers=headers).get_json()["data"]
        assert first["created"] is True
        assert first["notification"]["type"] == "RAIN_EXPECTED"
        assert second == {"created": False, "reason": "cooldown"}
        listing = client.get("/api/notifications", headers=headers).get_json()["data"]
        assert listing["unread"] == 1
