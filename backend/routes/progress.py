from flask import Blueprint, g

from ..http import api_success, handle_request, json_body, require_auth
from ..repositories.user_activity_repository import UserActivityRepository


progress_bp = Blueprint("progress", __name__, url_prefix="/api/progress")


@progress_bp.get("")
@require_auth
@handle_request(failure_message="Progress data is unavailable.")
def get_progress():
    repository = UserActivityRepository()
    user_id = g.current_user["sub"]
    logs = [item for item in repository.list_logs(user_id) if item.get("type") in {"energy", "water", "methane"}]
    return api_success({"stats": repository.stats(user_id), "state": repository.get_state(user_id), "logs": logs})


@progress_bp.patch("/state")
@require_auth
@handle_request(failure_message="Progress state could not be updated.")
def update_progress_state():
    data = json_body()
    allowed = {"xp", "level", "xpToNextLevel", "streak", "streakClaimed", "leafyOutfit", "bookmarkedSchemes", "badges"}
    values = {key: data[key] for key in allowed if key in data}
    if not values:
        raise ValueError("At least one progress field is required.")
    if "bookmarkedSchemes" in values and not isinstance(values["bookmarkedSchemes"], list):
        raise ValueError("bookmarkedSchemes must be a list.")
    if "badges" in values and not isinstance(values["badges"], list):
        raise ValueError("badges must be a list.")
    return api_success(UserActivityRepository().update_state(g.current_user["sub"], values))


@progress_bp.post("/logs")
@require_auth
@handle_request(failure_message="Progress data is unavailable.")
def add_log():
    data = json_body()
    log_type = str(data.get("type", "")).strip().lower()
    if log_type not in {"energy", "water", "methane"}:
        raise ValueError("Log type must be energy, water, or methane.")
    values = data.get("values")
    if not isinstance(values, dict) or not values:
        raise ValueError("Log values must be a non-empty object.")
    return api_success(UserActivityRepository().add_log(g.current_user["sub"], log_type, values), 201)


@progress_bp.post("/quizzes")
@require_auth
@handle_request(failure_message="Progress data is unavailable.")
def complete_quiz():
    data = json_body()
    quiz_id = str(data.get("quizId", "")).strip()
    if not quiz_id:
        raise ValueError("quizId is required.")
    xp = data.get("xp", 0)
    if isinstance(xp, bool) or not isinstance(xp, (int, float)) or xp < 0:
        raise ValueError("xp must be a non-negative number.")
    result, created = UserActivityRepository().complete_quiz(g.current_user["sub"], quiz_id, xp)
    return api_success({"quiz": result, "created": created}, 201 if created else 200)