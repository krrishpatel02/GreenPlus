from flask import Blueprint, jsonify, request

prediction_bp = Blueprint("predictions", __name__)
_predictions = None


def get_predictions():
    global _predictions
    if _predictions is None:
        from ..services.prediction_service import PredictionService

        _predictions = PredictionService()
    return _predictions


def body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object.")
    return data


def handle(call, source=None):
    try:
        result = call(get_predictions(), body())
        response = {"status": "success", "prediction": result} if source == "prediction" else {"status": "success", "analysis": result, "source": "deterministic_energy_engine"}
        if source == "prediction":
            response["model"] = "carbon_model_v3" if isinstance(result, (float, int)) else "energy_model_v2"
        return jsonify(response)
    except ValueError as exc:
        return jsonify({"status": "error", "error": str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({"status": "error", "error": str(exc)}), 503
    except Exception as exc:
        return jsonify({"status": "error", "error": f"Prediction failed: {type(exc).__name__}"}), 422


@prediction_bp.post("/api/predict/carbon")
def carbon():
    return handle(lambda service, data: service.carbon(data), "prediction")


@prediction_bp.post("/api/predict/energy")
def energy():
    return handle(lambda service, data: service.energy(data), "prediction")


@prediction_bp.post("/api/analyze/energy")
def analyze_energy():
    return handle(lambda service, data: service.analyze_energy(data))
