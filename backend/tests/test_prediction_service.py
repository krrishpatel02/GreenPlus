import json
from io import BytesIO
from unittest.mock import patch

import pytest

from backend.services.prediction_service import PredictionService


class FakeModel:
    def __init__(self, features):
        self.feature_names_in_ = features
        self.received = None

    def predict(self, values):
        self.received = values
        return [1.0]


class FakeResponse(BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *_args):
        self.close()


def model_bundle(features):
    model = FakeModel(features)
    return {"features": features, "model": model}, model


def weather_response():
    return FakeResponse(json.dumps({
        "current": {
            "time": "2026-09-18T12:00",
            "temperature_2m": 25,
            "relative_humidity_2m": 55,
            "cloud_cover": 10,
            "pressure_msl": 1012,
            "wind_speed_10m": 12,
        }
    }).encode())


@pytest.mark.parametrize("method_name,features", [
    ("temperature", ["relative_humidity_2m", "cloud_cover", "pressure_msl", "wind_speed_10m", "hour", "day_of_year"]),
    ("wind", ["temperature_2m", "relative_humidity_2m", "cloud_cover", "pressure_msl", "hour", "day_of_year"]),
])
def test_weather_predictions_supply_all_model_features(method_name, features):
    service = PredictionService()
    bundle, model = model_bundle(features)
    model_holder = getattr(service, f"{method_name}_model")
    model_holder._model = bundle
    model_holder._loaded = True
    if method_name == "wind":
        service.model_metrics = lambda _path: {"validation": "passed"}

    with patch("backend.services.prediction_service.urlopen", return_value=weather_response()):
        result = getattr(service, method_name)({})

    assert result
    assert list(model.received.columns) == features
    assert model.received.isna().sum().sum() == 0


@pytest.mark.parametrize("payload", [{"latitude": 91}, {"longitude": 181}])
def test_weather_predictions_reject_invalid_coordinates_before_network(payload):
    service = PredictionService()
    with patch("backend.services.prediction_service.urlopen") as request:
        with pytest.raises(ValueError):
            service.temperature(payload)
    request.assert_not_called()