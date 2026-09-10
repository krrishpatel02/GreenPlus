from flask import Blueprint, jsonify

from ..database import check_database

system_bp = Blueprint("system", __name__)


@system_bp.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "GreenPlus API",
        "database": check_database(),
        "models": {"loading": "lazy", "loaded": False},
    })
