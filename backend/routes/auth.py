from flask import Blueprint, jsonify

from ..http import handle_request, json_body
from ..services.container import get_auth_service

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


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
@handle_request(failure_status=503, failure_message="Database is unavailable.")
def register():
    name, email, password = validate_credentials(json_body(), True)
    user = get_auth_service().register(name, email, password)
    return jsonify({"status": "success", "user": user}), 201


@auth_bp.post("/login")
@handle_request(validation_status=401, failure_status=503, failure_message="Database is unavailable.")
def login():
    _, email, password = validate_credentials(json_body())
    return jsonify({"status": "success", "user": get_auth_service().login(email, password)})
