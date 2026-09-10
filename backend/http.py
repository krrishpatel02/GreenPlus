from functools import wraps

from flask import jsonify, request


def json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object.")
    return data


def error_response(message, status):
    return jsonify({"status": "error", "error": message}), status


def handle_request(callback=None, validation_status=400, unavailable_status=503, failure_status=422, failure_message=None):
    def decorator(endpoint):
        @wraps(endpoint)
        def wrapped(*args, **kwargs):
            try:
                return endpoint(*args, **kwargs)
            except ValueError as exc:
                return error_response(str(exc), validation_status)
            except RuntimeError as exc:
                return error_response(str(exc), unavailable_status)
            except Exception as exc:
                message = failure_message or f"Request failed: {type(exc).__name__}"
                return error_response(message, failure_status)

        return wrapped

    return decorator(callback) if callback is not None else decorator
