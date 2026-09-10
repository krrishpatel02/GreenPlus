from flask import Blueprint, jsonify, request

from ..services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def payload():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object.")
    return data


def validate_credentials(data, require_name=False):
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    if require_name and not name:
        raise ValueError("Name is required.")
    if "@" not in email:
        raise ValueError("A valid email is required.")
    if not isinstance(password, str) or len(password) < 8:
        raise ValueError("Password must contain at least 8 characters.")
    return name, email, password


@auth_bp.post("/register")
def register():
    try:
        name, email, password = validate_credentials(payload(), True)
        return jsonify({"status": "success", "user": AuthService().register(name, email, password)}), 201
    except ValueError as exc:
        return jsonify({"status": "error", "error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"status": "error", "error": "Database is unavailable.", "detail": type(exc).__name__}), 503


@auth_bp.post("/login")
def login():
    try:
        _, email, password = validate_credentials(payload())
        return jsonify({"status": "success", "user": AuthService().login(email, password)})
    except ValueError as exc:
        return jsonify({"status": "error", "error": str(exc)}), 401
    except Exception as exc:
        return jsonify({"status": "error", "error": "Database is unavailable.", "detail": type(exc).__name__}), 503
