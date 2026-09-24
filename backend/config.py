import logging
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

# Attempt to load .env file if python-dotenv is installed
try:
    from dotenv import load_dotenv
    env_path = ROOT_DIR / "backend" / ".env"
    if not env_path.exists():
        env_path = ROOT_DIR / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

APP_ENV = os.getenv("APP_ENV", "development")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "greenplus")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
OPEN_METEO_BASE_URL = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1").rstrip("/")


def _int_env(name, default, minimum=0):
    raw = os.getenv(name, str(default))
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer.") from exc
    if value < minimum:
        raise ValueError(f"{name} must be at least {minimum}.")
    return value


API_PORT = _int_env("API_PORT", 5000, 1)
JWT_SECRET = os.getenv("JWT_SECRET", "greenplus-development-secret-key-change-me-before-production-2026")
JWT_ACCESS_TOKEN_TTL_SECONDS = _int_env("JWT_ACCESS_TOKEN_TTL_SECONDS", 3600, 1)
JWT_REFRESH_TOKEN_TTL_SECONDS = _int_env("JWT_REFRESH_TOKEN_TTL_SECONDS", 604800, 1)
ADMIN_SETUP_KEY = os.getenv("ADMIN_SETUP_KEY", "")
NOTIFICATION_DAILY_LIMIT = _int_env("NOTIFICATION_DAILY_LIMIT", 8, 1)
NOTIFICATION_COOLDOWN_MINUTES = _int_env("NOTIFICATION_COOLDOWN_MINUTES", 180, 0)
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()]

if APP_ENV.lower() in {"production", "prod"}:
    if JWT_SECRET.startswith("greenplus-development-") or len(JWT_SECRET) < 32:
        raise RuntimeError("JWT_SECRET must be a unique secret of at least 32 characters in production.")
    if not ADMIN_SETUP_KEY or ADMIN_SETUP_KEY.startswith("replace-"):
        raise RuntimeError("ADMIN_SETUP_KEY must be configured in production.")
elif JWT_SECRET.startswith("greenplus-development-"):
    logging.getLogger(__name__).warning("Using the development JWT_SECRET; configure JWT_SECRET before deployment.")
