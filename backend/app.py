from flask import Flask

from .config import API_HOST, API_PORT
from .routes.auth import auth_bp
from .routes.predictions import prediction_bp
from .routes.system import system_bp


def create_app():
    app = Flask(__name__)
    app.register_blueprint(system_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return response

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host=API_HOST, port=API_PORT, debug=True)
