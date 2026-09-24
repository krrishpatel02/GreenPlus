from flask import Blueprint, jsonify

from ..http import handle_request, json_body, require_auth
from ..services.container import get_prediction_service

prediction_bp = Blueprint("predictions", __name__)


@prediction_bp.get("/api/predict/status")
@handle_request
def prediction_status():
    return jsonify({"status": "success", "models": get_prediction_service().status()})


@prediction_bp.post("/api/predict/carbon")
@handle_request
@require_auth
def carbon():
    result = get_prediction_service().carbon(json_body())
    return jsonify({"status": "success", "prediction": result, "model": "carbon_model_v3"})


@prediction_bp.post("/api/predict/energy")
@handle_request
@require_auth
def energy():
    result = get_prediction_service().energy(json_body())
    return jsonify({"status": "success", "prediction": result, "model": "energy_model_v2"})


@prediction_bp.post("/api/predict/water")
@handle_request
@require_auth
def water():
    return jsonify({"status": "success", "prediction": get_prediction_service().water(json_body())})


@prediction_bp.post("/api/predict/actions")
@handle_request
@require_auth
def actions():
    return jsonify({"status": "success", "prediction": get_prediction_service().green_actions(json_body())})


@prediction_bp.post("/api/predict/advice")
@handle_request
@require_auth
def advice():
    return jsonify({"status": "success", "prediction": get_prediction_service().eco_advice(json_body())})


@prediction_bp.post("/api/predict/methane")
@handle_request
@require_auth
def methane():
    return jsonify({"status": "success", "prediction": get_prediction_service().methane(json_body())})


@prediction_bp.post("/api/predict/rio-trio")
@handle_request
@require_auth
def rio_trio():
    result = get_prediction_service().rio_trio(json_body())
    return jsonify({"status": result.get("status", "success"), "prediction": result, "model": "rio_trio_model"})


@prediction_bp.post("/api/analyze/energy")
@handle_request
@require_auth
def analyze_energy():
    result = get_prediction_service().analyze_energy(json_body())
    return jsonify({"status": "success", "analysis": result, "source": "deterministic_energy_engine"})


@prediction_bp.post("/api/predict/realtime")
@handle_request
@require_auth
def realtime():
    result = get_prediction_service().realtime(json_body())
    return jsonify({"status": "success", "prediction": result, "model": "realtime_solar_model"})


@prediction_bp.post("/api/predict/air-quality")
@handle_request
@require_auth
def air_quality():
    result = get_prediction_service().air_quality(json_body())
    return jsonify({"status": "success", "prediction": result, "model": "air_quality_model"})


@prediction_bp.post("/api/predict/rainfall")
@handle_request
@require_auth
def rainfall():
    result = get_prediction_service().rainfall(json_body())
    return jsonify({"status": "success", "prediction": result, "model": "rainfall_model"})


@prediction_bp.post("/api/predict/temperature")
@handle_request
@require_auth
def temperature():
    result = get_prediction_service().temperature(json_body())
    return jsonify({"status": "success", "prediction": result, "model": "temperature_model"})


@prediction_bp.post("/api/predict/uv-index")
@handle_request
@require_auth
def uv_index():
    result = get_prediction_service().uv_index(json_body())
    return jsonify({"status": result.get("status", "success"), "prediction": result, "model": "uv_index_model"})


@prediction_bp.post("/api/predict/wind")
@handle_request
@require_auth
def wind():
    result = get_prediction_service().wind(json_body())
    return jsonify({"status": result.get("status", "success"), "prediction": result, "model": "wind_model"})
