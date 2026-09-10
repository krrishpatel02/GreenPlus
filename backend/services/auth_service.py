import hashlib
import hmac
import secrets

from ..repositories.user_repository import UserRepository


class AuthService:
    def __init__(self):
        self.users = UserRepository()

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

    def register(self, name, email, password):
        user = self.users.new_user(name, email, self.hash_password(password))
        return self.users.create(user)

    def login(self, email, password):
        user = self.users.find_by_email(email)
        if not user or not self.verify_password(password, user["passwordHash"]):
            raise ValueError("Invalid email or password.")
        return self.users.public_user(user)
