from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from ..database.client import get_database


class UserRepository:
    def __init__(self):
        self.collection = get_database().users
        self.collection.create_index("email", unique=True)

    @staticmethod
    def normalize_id(user_id):
        if user_id is None:
            return None
        if isinstance(user_id, ObjectId):
            return user_id
        if isinstance(user_id, str) and user_id.strip() and user_id.strip() != "None":
            try:
                return ObjectId(user_id)
            except Exception:
                return user_id
        return user_id

    def create(self, user):
        try:
            result = self.collection.insert_one(user)
            user["_id"] = result.inserted_id
        except DuplicateKeyError as exc:
            raise ValueError("An account with this email already exists.") from exc
        return self.public_user(user)

    def find_by_email(self, email):
        return self.collection.find_one({"email": email.lower().strip()})

    def find_by_id(self, user_id):
        return self.collection.find_one({"_id": self.normalize_id(user_id)})

    def list_public(self):
        users = list(self.collection.find())
        return [self.public_user(user) for user in sorted(users, key=lambda item: item.get("createdAt", datetime.min), reverse=True)]

    def update_profile(self, user_id, updates):
        user = self.collection.find_one_and_update(
            {"_id": self.normalize_id(user_id)},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )
        if not user:
            raise ValueError("Profile not found.")
        return self.public_user(user)

    @staticmethod
    def public_user(user):
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "USER"),
            "level": user.get("level", 1),
            "xp": user.get("xp", 0),
            "xpToNextLevel": user.get("xpToNextLevel", 100),
            "streak": user.get("streak", 1),
            "streakClaimed": user.get("streakClaimed", False),
            "leafyOutfit": user.get("leafyOutfit", "default"),
            "createdAt": user.get("createdAt"),
        }

    @staticmethod
    def new_user(name, email, password_hash, role="USER"):
        return {
            "name": name.strip(),
            "email": email.lower().strip(),
            "passwordHash": password_hash,
            "role": role,
            "level": 1,
            "xp": 0,
            "xpToNextLevel": 100,
            "streak": 1,
            "streakClaimed": False,
            "leafyOutfit": "default",
            "createdAt": datetime.now(timezone.utc),
        }
