from flask import Blueprint, g

from ..config import ADMIN_SETUP_KEY
from ..http import api_success, handle_request, json_body, rate_limit, require_auth
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
@rate_limit(window_seconds=60, max_requests=5)
@handle_request(failure_message="Database is unavailable.")
def register():
    name, email, password = validate_credentials(json_body(), True)
    session = get_auth_service().register(name, email, password)
    return api_success(session, 201)


@auth_bp.post("/admin/register")
@rate_limit(window_seconds=60, max_requests=5)
@handle_request(failure_message="Database is unavailable.")
def register_admin():
    import hmac
    data = json_body()
    setup_key = data.get("setupKey", "")
    if not ADMIN_SETUP_KEY or not hmac.compare_digest(setup_key, ADMIN_SETUP_KEY):
        raise ValueError("A valid admin invitation key is required.")
    name, email, password = validate_credentials(data, True)
    session = get_auth_service().register(name, email, password, role="ADMIN")
    return api_success(session, 201)


@auth_bp.post("/login")
@rate_limit(window_seconds=60, max_requests=10)
@handle_request(failure_message="Database is unavailable.")
def login():
    _, email, password = validate_credentials(json_body())
    session = get_auth_service().login(email, password)
    return api_success(session, 200)


@auth_bp.patch("/profile")
@require_auth
@handle_request(failure_message="Database is unavailable.")
def update_profile():
    data = json_body()
    current_user_id = g.current_user["sub"]
    name = str(data.get("name", "")).strip()
    if not name:
        raise ValueError("A valid name is required.")
    user = get_auth_service().update_profile(current_user_id, {"name": name})
    return api_success({"user": user})
