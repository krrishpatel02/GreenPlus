import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from ..config import APP_ENV, JWT_ACCESS_TOKEN_TTL_SECONDS, JWT_SECRET
from ..repositories.user_repository import UserRepository


class AuthService:
    def __init__(self):
        self.users = UserRepository()
        self.ensure_default_admin()

    @staticmethod
    def hash_password(password, salt=None):
        salt = salt or secrets.token_bytes(16)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
        return f"{salt.hex()}:{digest.hex()}"

    @classmethod
    def verify_password(cls, password, stored):
        salt_hex, digest_hex = stored.split(":", 1)
        actual = cls.hash_password(password, bytes.fromhex(salt_hex)).split(":", 1)[1]
        return hmac.compare_digest(actual, digest_hex)

    @staticmethod
    def create_access_token(user):
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=JWT_ACCESS_TOKEN_TTL_SECONDS)
        payload = {
            "sub": str(user["_id"]),
            "role": user.get("role", "USER"),
            "email": user["email"],
            "exp": int(expires_at.timestamp()),
        }
        return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    def ensure_default_admin(self):
        if APP_ENV.lower() not in {"development", "dev", "test", "testing"}:
            return
        admin_email = "admin@greenplus.local"
        admin_password = os.getenv("ADMIN_BOOTSTRAP_PASSWORD", "GreenPlusAdmin123!")
        if self.users.find_by_email(admin_email):
            return
        user = self.users.new_user("GreenPlus Admin", admin_email, self.hash_password(admin_password), role="ADMIN")
        self.users.create(user)

    def register(self, name, email, password, role="USER"):
        existing = self.users.find_by_email(email)
        if existing:
            raise ValueError("An account with this email already exists.")
        user = self.users.new_user(name, email, self.hash_password(password), role=role)
        created_user = self.users.create(user)
        user_record = self.users.find_by_email(email)
        access_token = self.create_access_token(user_record)
        return {
            "user": created_user,
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": JWT_ACCESS_TOKEN_TTL_SECONDS,
        }

    def login(self, email, password):
        user = self.users.find_by_email(email)
        if not user or not self.verify_password(password, user["passwordHash"]):
            raise ValueError("Invalid email or password.")
        access_token = self.create_access_token(user)
        return {
            "user": self.users.public_user(user),
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": JWT_ACCESS_TOKEN_TTL_SECONDS,
        }

    def update_profile(self, user_id, updates):
        safe_updates = {}
        if "name" in updates:
            safe_updates["name"] = str(updates["name"]).strip()
            if not safe_updates["name"]:
                raise ValueError("Name cannot be empty.")
        if not safe_updates:
            raise ValueError("No profile changes provided.")
        return self.users.update_profile(user_id, safe_updates)
