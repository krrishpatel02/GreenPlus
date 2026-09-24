import time
from functools import wraps

import jwt
from flask import g, jsonify, request

from .config import JWT_SECRET


class APIError(Exception):
    def __init__(self, message, code="INTERNAL_ERROR", status=500):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = status


def json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise APIError("Request body must be a JSON object.", code="VALIDATION_ERROR", status=400)
    return data


def api_success(data=None, status=200):
    return jsonify({"success": True, "data": data if data is not None else {}}), status


def api_error(message, code="INTERNAL_ERROR", status=500):
    return jsonify({"success": False, "error": {"code": code, "message": message}}), status


def decode_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except (jwt.PyJWTError, TypeError, ValueError):
        return None
    return payload


def bearer_token():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header.split(" ", 1)[1].strip()


def require_auth(endpoint):
    @wraps(endpoint)
    def wrapped(*args, **kwargs):
        token = bearer_token()
        if not token:
            return api_error("Authentication required.", "UNAUTHENTICATED", 401)
        payload = decode_token(token)
        if not payload:
            return api_error("Authentication token is invalid or expired.", "UNAUTHENTICATED", 401)
        g.current_user = payload
        return endpoint(*args, **kwargs)

    return wrapped


def require_admin(endpoint):
    @wraps(endpoint)
    def wrapped(*args, **kwargs):
        token = bearer_token()
        if not token:
            return api_error("Authentication required.", "UNAUTHENTICATED", 401)
        payload = decode_token(token)
        if not payload:
            return api_error("Authentication token is invalid or expired.", "UNAUTHENTICATED", 401)
        if payload.get("role") != "ADMIN":
            return api_error("Admin authorization required.", "FORBIDDEN", 403)
        g.current_user = payload
        return endpoint(*args, **kwargs)

    return wrapped


def rate_limit(window_seconds=60, max_requests=10):
    requests = {}

    def decorator(endpoint):
        @wraps(endpoint)
        def wrapped(*args, **kwargs):
            key = request.remote_addr or "unknown"
            now = time.time()
            window = requests.setdefault(key, [])
            window[:] = [timestamp for timestamp in window if now - timestamp < window_seconds]
            if len(window) >= max_requests:
                return api_error("Too many requests. Please retry later.", "RATE_LIMITED", 429)
            window.append(now)
            return endpoint(*args, **kwargs)

        return wrapped

    return decorator


def handle_request(callback=None, validation_status=400, failure_status=422, failure_message=None):
    def decorator(endpoint):
        @wraps(endpoint)
        def wrapped(*args, **kwargs):
            try:
                result = endpoint(*args, **kwargs)
                return result
            except APIError as exc:
                return api_error(exc.message, exc.code, exc.status)
            except ValueError as exc:
                return api_error(str(exc), "VALIDATION_ERROR", validation_status)
            except RuntimeError as exc:
                return api_error(str(exc), "UNAVAILABLE", 503)
            except Exception as exc:
                message = failure_message or "An unexpected error occurred."
                return api_error(message, "INTERNAL_ERROR", failure_status)

        return wrapped

    return decorator(callback) if callback is not None else decorator
