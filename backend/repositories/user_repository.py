from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from ..database import get_database


class UserRepository:
    def __init__(self):
        self.collection = get_database().users
        self.collection.create_index("email", unique=True)

    def create(self, user):
        try:
            self.collection.insert_one(user)
        except DuplicateKeyError as exc:
            raise ValueError("An account with this email already exists.") from exc
        return self.public_user(user)

    def find_by_email(self, email):
        return self.collection.find_one({"email": email.lower().strip()})

    @staticmethod
    def public_user(user):
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "level": user.get("level", 1),
            "xp": user.get("xp", 0),
            "xpToNextLevel": user.get("xpToNextLevel", 100),
            "streak": user.get("streak", 1),
            "streakClaimed": user.get("streakClaimed", False),
            "leafyOutfit": user.get("leafyOutfit", "default"),
            "createdAt": user.get("createdAt"),
        }

    @staticmethod
    def new_user(name, email, password_hash):
        return {
            "name": name.strip(),
            "email": email.lower().strip(),
            "passwordHash": password_hash,
            "level": 1,
            "xp": 0,
            "xpToNextLevel": 100,
            "streak": 1,
            "streakClaimed": False,
            "leafyOutfit": "default",
            "createdAt": datetime.now(timezone.utc),
        }
