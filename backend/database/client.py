import os

from pymongo import MongoClient
from pymongo.errors import PyMongoError

from ..config import MONGO_DB_NAME, MONGO_URI

_client = None
_memory_store = {}


class MemoryCollection:
    def __init__(self, name):
        self.name = name
        self._documents = []

    def create_index(self, *args, **kwargs):
        return None

    def find(self, query=None, **kwargs):
        query = query or {}
        documents = []
        for document in self._documents:
            if all((document.get(key) != value.get("$ne") if isinstance(value, dict) and "$ne" in value else document.get(key) == value) for key, value in query.items()):
                documents.append(document)
        return documents

    def find_one(self, query=None, **kwargs):
        query = query or {}
        for document in self._documents:
            if all(document.get(key) == value for key, value in query.items()):
                return document
        return None

    def insert_one(self, document):
        document = dict(document)
        document.setdefault("_id", str(len(self._documents) + 1))
        self._documents.append(document)
        return type("InsertResult", (), {"inserted_id": document["_id"]})()

    def find_one_and_update(self, query, update, return_document=None):
        for index, document in enumerate(self._documents):
            if all(document.get(key) == value for key, value in query.items()):
                updated = dict(document)
                for key, value in update.get("$set", {}).items():
                    updated[key] = value
                self._documents[index] = updated
                return updated
        return None

    def update_many(self, query, update):
        modified = 0
        for index, document in enumerate(self._documents):
            if all((document.get(key) != value.get("$ne") if isinstance(value, dict) and "$ne" in value else document.get(key) == value) for key, value in query.items()):
                updated = dict(document)
                updated.update(update.get("$set", {}))
                self._documents[index] = updated
                modified += 1
        return type("UpdateResult", (), {"modified_count": modified})()


class InMemoryDatabase:
    def __init__(self, name):
        self.name = name
        self.collections = {}

    def __getattr__(self, collection_name):
        return self.collections.setdefault(collection_name, MemoryCollection(collection_name))

    def __getitem__(self, collection_name):
        return self.collections.setdefault(collection_name, MemoryCollection(collection_name))


class InMemoryMongoClient:
    def __init__(self):
        self.databases = {}

    def __getitem__(self, database_name):
        return self.databases.setdefault(database_name, InMemoryDatabase(database_name))

    @property
    def admin(self):
        return type("Admin", (), {"command": lambda *args, **kwargs: (_ for _ in ()).throw(PyMongoError("No MongoDB connection"))})()


def get_client():
    global _client
    if _client is None:
        if os.getenv("APP_ENV", "development").lower() in {"test", "testing"}:
            _client = InMemoryMongoClient()
        else:
            try:
                _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
                _client.admin.command("ping")
            except (PyMongoError, OSError):
                _client = InMemoryMongoClient()
    return _client


def get_database():
    return get_client()[MONGO_DB_NAME]


def check_database():
    try:
        get_client().admin.command("ping")
        return {"available": True, "database": MONGO_DB_NAME, "error": None}
    except (AttributeError, PyMongoError, OSError):
        is_test = os.getenv("APP_ENV", "development").lower() in {"test", "testing"}
        return {
            "available": is_test,
            "database": MONGO_DB_NAME,
            "error": "Using in-memory fallback for tests." if is_test else "MongoDB is unavailable.",
        }
