from flask import Blueprint, g, request

from ..http import api_success, handle_request, json_body, require_auth
from ..services.container import get_assistant_service, get_notification_service

assistant_bp = Blueprint("assistant", __name__)


@assistant_bp.post("/api/assistant/messages")
@require_auth
@handle_request(failure_message="Assistant is temporarily unavailable.")
def assistant_message():
    data = json_body()
    text = str(data.get("message", "")).strip()
    if not text:
        raise ValueError("Message is required.")
    result = get_assistant_service().respond(text, data.get("history"), data.get("context"))
    return api_success(result)


@assistant_bp.post("/api/notifications/generate")
@require_auth
@handle_request(failure_message="Notification service is temporarily unavailable.")
def generate_notifications():
    return api_success(get_notification_service().generate(g.current_user["sub"], json_body()))


@assistant_bp.get("/api/notifications")
@require_auth
@handle_request(failure_message="Notifications are temporarily unavailable.")
def notifications():
    return api_success(get_notification_service().list(g.current_user["sub"], category=request.args.get("category"), channel=request.args.get("channel")))


@assistant_bp.patch("/api/notifications/<notification_id>/read")
@require_auth
@handle_request(failure_message="Notification could not be updated.")
def mark_notification_read(notification_id):
    return api_success(get_notification_service().mark_read(g.current_user["sub"], notification_id))


@assistant_bp.post("/api/notifications/read-all")
@require_auth
@handle_request(failure_message="Notifications could not be updated.")
def mark_all_notifications_read():
    return api_success(get_notification_service().mark_all_read(g.current_user["sub"]))


@assistant_bp.patch("/api/notifications/<notification_id>/dismiss")
@require_auth
@handle_request(failure_message="Notification could not be dismissed.")
def dismiss_notification(notification_id):
    return api_success(get_notification_service().dismiss(g.current_user["sub"], notification_id))


@assistant_bp.get("/api/notifications/preferences")
@require_auth
@handle_request(failure_message="Notification preferences are unavailable.")
def notification_preferences():
    return api_success(get_notification_service().get_preferences(g.current_user["sub"]))


@assistant_bp.patch("/api/notifications/preferences")
@require_auth
@handle_request(failure_message="Notification preferences could not be updated.")
def update_notification_preferences():
    data = json_body()
    allowed = {"enabled", "quietStart", "quietEnd", "language", "channels", "categories"}
    values = {key: value for key, value in data.items() if key in allowed}
    return api_success(get_notification_service().update_preferences(g.current_user["sub"], values))
