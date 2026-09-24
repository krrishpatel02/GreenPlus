from flask import Blueprint, jsonify

from ..database.client import check_database
from ..http import api_success, rate_limit, require_admin
from ..services.container import get_auth_service

system_bp = Blueprint("system", __name__)


@system_bp.get("/api/health")
def health():
    database = check_database()
    return jsonify({
        "success": True,
        "data": {
            "status": "ok",
            "service": "GreenPlus API",
            "database": database,
            "models": {"loading": "lazy", "loaded": False},
        },
    })


@system_bp.get("/api/ready")
def ready():
    database = check_database()
    ready_state = database.get("available", True)
    return jsonify({
        "success": ready_state,
        "data": {
            "status": "ready" if ready_state else "degraded",
            "database": database,
            "service": "GreenPlus API",
        },
        "error": None if ready_state else {"code": "DATABASE_UNAVAILABLE", "message": "Database is not available."},
    }), 200 if ready_state else 503


@system_bp.get("/api/admin/overview")
@rate_limit(window_seconds=60, max_requests=20)
@require_admin
def admin_overview():
    database = check_database()
    if not database["available"]:
        return jsonify({"success": False, "error": {"code": "DATABASE_UNAVAILABLE", "message": "Database is not available."}, "users": []}), 503

    users = get_auth_service().users.list_public()
    return api_success({
        "database": database,
        "models": {"loading": "lazy", "loaded": False},
        "stats": {"users": len(users)},
        "users": users,
    })
