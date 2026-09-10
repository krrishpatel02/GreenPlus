from flask import Blueprint, jsonify

from ..http import handle_request, json_body
from ..services.container import get_prediction_service

prediction_bp = Blueprint("predictions", __name__)


@prediction_bp.post("/api/predict/carbon")
@handle_request
def carbon():
    result = get_prediction_service().carbon(json_body())
    return jsonify({"status": "success", "prediction": result, "model": "carbon_model_v3"})


@prediction_bp.post("/api/predict/energy")
@handle_request
def energy():
    result = get_prediction_service().energy(json_body())
    return jsonify({"status": "success", "prediction": result, "model": "energy_model_v2"})


@prediction_bp.post("/api/analyze/energy")
@handle_request
def analyze_energy():
    result = get_prediction_service().analyze_energy(json_body())
    return jsonify({"status": "success", "analysis": result, "source": "deterministic_energy_engine"})
