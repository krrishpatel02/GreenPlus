from datetime import datetime, timezone

from ..database.client import get_database
from pymongo.errors import DuplicateKeyError


class UserActivityRepository:
    def __init__(self):
        self.collection = get_database().user_activity
        self.collection.create_index([("userId", 1), ("createdAt", -1)])
        self.collection.create_index([("userId", 1), ("type", 1), ("quizId", 1)], unique=True, sparse=True)

    def add_log(self, user_id, log_type, values):
        document = {
            "userId": user_id,
            "type": log_type,
            "values": dict(values),
            "createdAt": datetime.now(timezone.utc),
        }
        self.collection.insert_one(document)
        return self.public(document)

    def list_logs(self, user_id, log_type=None, limit=None):
        query = {"userId": user_id}
        if log_type:
            query["type"] = log_type
        documents = list(self.collection.find(query))
        documents.sort(key=lambda item: item.get("createdAt", datetime.min.replace(tzinfo=timezone.utc)), reverse=True)
        return [self.public(document) for document in documents[:limit] if limit] if limit else [self.public(document) for document in documents]

    def complete_quiz(self, user_id, quiz_id, xp):
        existing = self.collection.find_one({"userId": user_id, "type": "quiz", "quizId": quiz_id})
        if existing:
            return self.public(existing), False
        document = {
            "userId": user_id,
            "type": "quiz",
            "quizId": quiz_id,
            "xp": int(xp),
            "createdAt": datetime.now(timezone.utc),
        }
        try:
            self.collection.insert_one(document)
            return self.public(document), True
        except DuplicateKeyError:
            existing = self.collection.find_one({"userId": user_id, "type": "quiz", "quizId": quiz_id})
            return self.public(existing), False

    def stats(self, user_id):
        logs = self.list_logs(user_id)
        quizzes = [item for item in logs if item.get("type") == "quiz"]
        xp = sum(int(item.get("xp", 0)) for item in quizzes)
        return {"xp": xp, "level": xp // 100 + 1, "completedQuizzes": [item.get("quizId") for item in quizzes]}

    def get_state(self, user_id):
        document = self.collection.find_one({"userId": user_id, "type": "progress_state"})
        return dict(document.get("values", {})) if document else {}

    def update_state(self, user_id, values):
        existing = self.collection.find_one({"userId": user_id, "type": "progress_state"})
        current = dict(existing.get("values", {})) if existing else {}
        current.update(values)
        document = {"userId": user_id, "type": "progress_state", "values": current, "createdAt": datetime.now(timezone.utc)}
        if existing:
            self.collection.find_one_and_update({"userId": user_id, "type": "progress_state"}, {"$set": {"values": current}})
        else:
            self.collection.insert_one(document)
        return current

    @staticmethod
    def public(document):
        result = dict(document)
        result.pop("_id", None)
        if isinstance(result.get("createdAt"), datetime):
            result["createdAt"] = result["createdAt"].isoformat()
        return result