from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
import json

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent
MODEL_FILE = ROOT / "rainfall_model.joblib"
METRICS_FILE = ROOT / "rainfall_model_metrics.json"
DATA_FILE = ROOT / "rainfall_dataset.csv"
RANDOM_STATE = 42
FEATURES = [
    "temperature_2m",
    "relative_humidity_2m",
    "cloud_cover",
    "wind_speed_10m",
    "pressure_msl",
    "hour",
    "day_of_year",
]
TARGET = "rain_event"


def download_dataset():
    params = urlencode({
        "latitude": 28.6139,
        "longitude": 77.2090,
        "start_date": "2023-01-01",
        "end_date": "2025-12-31",
        "hourly": "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,pressure_msl,precipitation",
        "timezone": "UTC",
    })
    with urlopen(f"https://archive-api.open-meteo.com/v1/archive?{params}", timeout=60) as response:
        payload = json.load(response)
    frame = pd.DataFrame(payload["hourly"])
    frame["time"] = pd.to_datetime(frame["time"], utc=True)
    frame["hour"] = frame["time"].dt.hour
    frame["day_of_year"] = frame["time"].dt.dayofyear
    frame[TARGET] = (frame["precipitation"] >= 0.1).astype(int)
    frame = frame.dropna(subset=FEATURES + [TARGET]).sort_values("time").reset_index(drop=True)
    frame.to_csv(DATA_FILE, index=False)
    return frame


def train():
    frame = download_dataset()
    split = int(len(frame) * 0.8)
    train_frame, test_frame = frame.iloc[:split], frame.iloc[split:]
    model = Pipeline([
        ("scale", StandardScaler()),
        ("classifier", HistGradientBoostingClassifier(
            max_iter=200,
            learning_rate=0.06,
            max_leaf_nodes=15,
            l2_regularization=1.0,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        )),
    ])
    model.fit(train_frame[FEATURES], train_frame[TARGET])
    train_prediction = model.predict(train_frame[FEATURES])
    test_prediction = model.predict(test_frame[FEATURES])
    cv_scores = cross_val_score(
        model,
        train_frame[FEATURES],
        train_frame[TARGET],
        cv=TimeSeriesSplit(n_splits=5),
        scoring="f1",
        n_jobs=-1,
    )
    train_f1 = f1_score(train_frame[TARGET], train_prediction, zero_division=0)
    test_f1 = f1_score(test_frame[TARGET], test_prediction, zero_division=0)
    metrics = {
        "model": "HistGradientBoostingClassifier",
        "dataset": "Open-Meteo historical archive",
        "rows": len(frame),
        "location": "28.6139, 77.2090",
        "features": FEATURES,
        "target": TARGET,
        "train_f1": round(float(train_f1), 4),
        "test_f1": round(float(test_f1), 4),
        "test_accuracy": round(float(accuracy_score(test_frame[TARGET], test_prediction)), 4),
        "cv_f1_mean": round(float(cv_scores.mean()), 4),
        "cv_f1_std": round(float(cv_scores.std()), 4),
        "overfit_gap": round(float(train_f1 - test_f1), 4),
        "validation": "passed" if train_f1 - test_f1 <= 0.2 and test_f1 >= 0.2 else "rejected",
    }
    if metrics["validation"] != "passed":
        raise RuntimeError(f"Model validation rejected: {metrics}")
    joblib.dump({"model": model, "features": FEATURES, "target": TARGET}, MODEL_FILE)
    METRICS_FILE.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))
    print(f"Saved model: {MODEL_FILE}")


if __name__ == "__main__":
    train()
