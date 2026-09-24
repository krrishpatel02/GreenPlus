import logging

from flask import Flask, request

from .config import API_HOST, API_PORT, APP_ENV, CORS_ORIGINS, LOG_LEVEL
from .routes.auth import auth_bp
from .routes.assistant import assistant_bp
from .routes.predictions import prediction_bp
from .routes.progress import progress_bp
from .routes.system import system_bp


def create_app():
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False
    app.config["APP_ENV"] = APP_ENV

    logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper(), logging.INFO), format="%(asctime)s %(levelname)s %(name)s %(message)s")
    app.logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))
    app.logger.info("GreenPlus application starting in %s mode", APP_ENV)

    app.register_blueprint(system_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(assistant_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(progress_bp)

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin")
        if origin and origin in CORS_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        if request.method == "OPTIONS":
            response.status_code = 200
        return response

    @app.errorhandler(404)
    def handle_not_found(_error):
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Resource not found."}}, 404

    @app.errorhandler(405)
    def handle_method_not_allowed(_error):
        return {"success": False, "error": {"code": "METHOD_NOT_ALLOWED", "message": "HTTP method is not allowed for this endpoint."}}, 405

    @app.errorhandler(500)
    def handle_server_error(_error):
        return {"success": False, "error": {"code": "INTERNAL_ERROR", "message": "An unexpected server error occurred."}}, 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host=API_HOST, port=API_PORT, debug=False)
