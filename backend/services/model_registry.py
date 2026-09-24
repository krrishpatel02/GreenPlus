from dataclasses import dataclass


VALIDATED = "VALIDATED"
REJECTED = "REJECTED"
LEAKAGE_WARNING = "LEAKAGE_WARNING"


@dataclass(frozen=True)
class ModelDefinition:
    name: str
    artifact: str
    status: str = VALIDATED
    geographic_scope: str | None = None
    fallback: str | None = None
    reason: str | None = None


MODEL_REGISTRY = {
    "energy": ModelDefinition(
        name="energy",
        artifact="energy_model_v1.joblib",
        reason="Energy V1 is the preferred artifact based on verified test R2.",
    ),
    "uv_index": ModelDefinition(
        name="uv_index",
        artifact="uv_index_model.joblib",
        status=REJECTED,
        geographic_scope="28.6139, 77.2090",
        fallback="open_meteo",
        reason="Test R2 0.0083 and CV R2 -1.6225 do not support production use.",
    ),
    "wind": ModelDefinition(
        name="wind",
        artifact="wind_model.joblib",
        status=REJECTED,
        geographic_scope="28.6139, 77.2090",
        fallback="open_meteo",
        reason="Test R2 -0.6455 and CV R2 -0.2365 do not support production use.",
    ),
    "rio_trio": ModelDefinition(
        name="rio_trio",
        artifact="rio_trio_model.joblib",
        status=LEAKAGE_WARNING,
        reason="Synthetic targets are derived from input features; scores are not production-grade.",
    ),
}


def get_model_definition(name):
    return MODEL_REGISTRY.get(name, ModelDefinition(name=name, artifact="unknown"))


def decision(name, metrics=None):
    definition = get_model_definition(name)
    status = definition.status
    if status == REJECTED and metrics and metrics.get("validation") == "passed":
        status = VALIDATED
    return {
        "name": definition.name,
        "status": status,
        "artifact": definition.artifact,
        "geographic_scope": definition.geographic_scope,
        "fallback": definition.fallback,
        "reason": definition.reason,
    }