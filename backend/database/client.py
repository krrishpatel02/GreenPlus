from pymongo import MongoClient
from pymongo.errors import PyMongoError

from ..config import MONGO_DB_NAME, MONGO_URI

_client = None


def get_client():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
    return _client


def get_database():
    return get_client()[MONGO_DB_NAME]


def check_database():
    try:
        get_client().admin.command("ping")
        return {"available": True, "database": MONGO_DB_NAME, "error": None}
    except PyMongoError as exc:
        return {"available": False, "database": MONGO_DB_NAME, "error": type(exc).__name__}
