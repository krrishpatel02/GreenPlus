import hashlib
import json
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from ..config import NOTIFICATION_COOLDOWN_MINUTES, NOTIFICATION_DAILY_LIMIT
from ..repositories.notification_repository import NotificationRepository


class NotificationService:
    COOLDOWN_MINUTES = NOTIFICATION_COOLDOWN_MINUTES
    DAILY_LIMIT = NOTIFICATION_DAILY_LIMIT

    def __init__(self):
        self.notifications = NotificationRepository()

    @staticmethod
    def _event_hash(event_type, metadata):
        payload = json.dumps({"type": event_type, "metadata": metadata}, sort_keys=True, default=str)
        return hashlib.sha256(payload.encode()).hexdigest()[:24]

    @staticmethod
    def _quiet_hours(preferences, now):
        start = int(preferences.get("quietStart", 22))
        end = int(preferences.get("quietEnd", 7))
        hour = now.hour
        return (hour >= start or hour < end) if start > end else start <= hour < end

    def list(self, user_id, limit=30, category=None, channel=None):
        return {"notifications": self.notifications.list_for_user(user_id, limit, category, channel), "unread": self.notifications.unread_count(user_id)}

    def mark_read(self, user_id, notification_id):
        result = self.notifications.mark_read(user_id, notification_id)
        if not result:
            raise ValueError("Notification not found.")
        return result

    def mark_all_read(self, user_id):
        return {"updated": self.notifications.mark_all_read(user_id)}

    def dismiss(self, user_id, notification_id):
        result = self.notifications.dismiss(user_id, notification_id)
        if not result:
            raise ValueError("Notification not found.")
        return result

    def get_preferences(self, user_id):
        return self.notifications.get_preferences(user_id)

    def update_preferences(self, user_id, values):
        return self.notifications.update_preferences(user_id, values)

    def generate(self, user_id, context, _now=None):
        now = _now or datetime.now(timezone.utc)
        preferences = {**self.notifications.get_preferences(user_id), **(context.get("preferences") or {})}
        if preferences.get("enabled", True) is False:
            return {"created": False, "reason": "notifications_disabled"}
        if self._quiet_hours(preferences, now):
            return {"created": False, "reason": "quiet_hours"}

        weather = context.get("weather") or {}
        user_context = context.get("userContext") or {}
        event = self._choose_event(weather, user_context)
        if not event:
            return {"created": False, "reason": "no_useful_event"}
        categories = preferences.get("categories") or []
        if categories and event["type"] not in categories:
            return {"created": False, "reason": "category_disabled"}
        if event["type"] == "SOLAR_WINDOW_AVAILABLE" and not user_context.get("solarAvailable"):
            return {"created": False, "reason": "missing_solar_context"}
        event_hash = self._event_hash(event["type"], event["metadata"])
        if self.notifications.recent_event(user_id, event_hash, now - timedelta(minutes=self.COOLDOWN_MINUTES)):
            return {"created": False, "reason": "cooldown"}
        today = now - timedelta(hours=24)
        if len([item for item in self.notifications.list_for_user(user_id, 100) if item.get("createdAt", "") >= today.isoformat()]) >= self.DAILY_LIMIT:
            return {"created": False, "reason": "daily_limit"}

        notification = {
            "id": str(uuid4()), "userId": user_id, "type": event["type"], "priority": event["priority"],
            "title": event["title"], "message": event["message"], "language": preferences.get("language", "English"),
            "action": event.get("action"), "metadata": event["metadata"], "channels": preferences.get("channels", ["in_app"]),
            "read": False, "dismissed": False, "createdAt": now, "expiresAt": now + timedelta(hours=12), "eventHash": event_hash,
        }
        return {"created": True, "notification": self.notifications.create(notification)}

    @staticmethod
    def _choose_event(weather, user_context):
        rain = float(weather.get("rainProbability", 0) or 0)
        solar = float(weather.get("solarGeneration", 0) or 0)
        clouds = float(weather.get("cloudCover", 0) or 0)
        if rain >= 70 and user_context.get("solarAvailable") and user_context.get("solarActivities"):
            return {"type": "RAIN_EXPECTED", "priority": "NORMAL", "title": "Rain may arrive later", "message": "If you have solar-powered chores waiting, now could be a good time.", "action": {"label": "See forecast", "tab": "ai"}, "metadata": {"rainProbability": rain}}
        if solar >= 60 and user_context.get("solarAvailable"):
            return {"type": "SOLAR_WINDOW_AVAILABLE", "priority": "LOW", "title": "Your solar window is looking good", "message": "The sun is showing up nicely. Got laundry or another solar-powered task waiting?", "action": {"label": "Plan now", "tab": "energy"}, "metadata": {"solarGeneration": solar}}
        if clouds >= 80:
            return {"type": "HIGH_CLOUD_COVER", "priority": "LOW", "title": "Clouds are moving in", "message": "Your solar window may not stay this good for long.", "action": {"label": "See forecast", "tab": "ai"}, "metadata": {"cloudCover": clouds}}
        if float(weather.get("temperature", 0) or 0) >= 38:
            return {"type": "EXTREME_HEAT", "priority": "HIGH", "title": "A very hot day is building", "message": "Take breaks, drink water, and consider moving outdoor tasks earlier.", "action": {"label": "View advice", "tab": "ai"}, "metadata": {"temperature": weather.get("temperature")}}
        return None
