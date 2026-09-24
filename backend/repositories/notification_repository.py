from datetime import datetime, timezone

from ..database.client import get_database


class NotificationRepository:
    def __init__(self):
        self.collection = get_database().notifications
        self.preferences = get_database().notification_preferences
        self.collection.create_index([("userId", 1), ("eventHash", 1)])

    def create(self, notification):
        self.collection.insert_one(notification)
        return self.public(notification)

    def list_for_user(self, user_id, limit=30, category=None, channel=None):
        documents = [doc for doc in self.collection.find({"userId": user_id})]
        if category:
            documents = [doc for doc in documents if doc.get("type") == category]
        if channel:
            documents = [doc for doc in documents if channel in doc.get("channels", [])]
        documents.sort(key=lambda item: item.get("createdAt", datetime.min.replace(tzinfo=timezone.utc)), reverse=True)
        return [self.public(doc) for doc in documents[:limit]]

    def unread_count(self, user_id):
        return len([doc for doc in self.collection.find({"userId": user_id}) if not doc.get("read", False)])

    def mark_read(self, user_id, notification_id):
        result = self.collection.find_one_and_update(
            {"userId": user_id, "id": notification_id},
            {"$set": {"read": True}},
            return_document=True
        )
        return self.public(result) if result else None
        return None

    def mark_all_read(self, user_id):
        result = self.collection.update_many(
            {"userId": user_id, "read": {"$ne": True}},
            {"$set": {"read": True}}
        )
        return result.modified_count

    def dismiss(self, user_id, notification_id):
        result = self.collection.find_one_and_update(
            {"userId": user_id, "id": notification_id}, {"$set": {"dismissed": True}}
        )
        return self.public(result) if result else None

    def get_preferences(self, user_id):
        document = self.preferences.find_one({"userId": user_id})
        return dict(document.get("values", {})) if document else {}

    def update_preferences(self, user_id, values):
        existing = self.preferences.find_one({"userId": user_id})
        merged = {**(existing.get("values", {}) if existing else {}), **values}
        if existing:
            self.preferences.find_one_and_update({"userId": user_id}, {"$set": {"values": merged}})
        else:
            self.preferences.insert_one({"userId": user_id, "values": merged})
        return merged

    def recent_event(self, user_id, event_hash, since):
        for document in self.collection.find({"userId": user_id, "eventHash": event_hash}):
            if document.get("createdAt", datetime.min.replace(tzinfo=timezone.utc)) >= since and not document.get("dismissed", False):
                return document
        return None

    @staticmethod
    def public(document):
        result = dict(document)
        result.pop("_id", None)
        if isinstance(result.get("createdAt"), datetime):
            result["createdAt"] = result["createdAt"].isoformat()
        if isinstance(result.get("expiresAt"), datetime):
            result["expiresAt"] = result["expiresAt"].isoformat()
        return result
