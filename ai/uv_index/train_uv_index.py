from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
import json

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent
MODEL_FILE = ROOT / "uv_index_model.joblib"
METRICS_FILE = ROOT / "uv_index_model_metrics.json"
DATA_FILE = ROOT / "uv_index_dataset.csv"
RANDOM_STATE = 42
FEATURES = [
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
    "wind_speed_10m_max",
    "day_of_year",
]
TARGET = "uv_index"


def download_dataset():
    params = urlencode({
        "latitude": 28.6139,
        "longitude": 77.2090,
        "past_days": 92,
        "forecast_days": 1,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max",
        "timezone": "UTC",
    })
    with urlopen(f"https://api.open-meteo.com/v1/forecast?{params}", timeout=60) as response:
        payload = json.load(response)
    frame = pd.DataFrame(payload["daily"])
    frame["time"] = pd.to_datetime(frame["time"], utc=True)
    frame["day_of_year"] = frame["time"].dt.dayofyear
    frame = frame.rename(columns={"uv_index_max": TARGET})
    frame = frame.dropna(subset=FEATURES + [TARGET]).sort_values("time").reset_index(drop=True)
    if len(frame) < 30:
        raise RuntimeError("Open-Meteo returned too few complete UV-index rows for training.")
    frame.to_csv(DATA_FILE, index=False)
    return frame


def train():
    frame = download_dataset()
    split = int(len(frame) * 0.8)
    train_frame, test_frame = frame.iloc[:split], frame.iloc[split:]
    model = Pipeline([
        ("scale", StandardScaler()),
        ("regressor", HistGradientBoostingRegressor(
            max_iter=250,
            learning_rate=0.05,
            max_leaf_nodes=15,
            l2_regularization=1.0,
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
        scoring="r2",
        n_jobs=-1,
    )
    train_r2 = r2_score(train_frame[TARGET], train_prediction)
    test_r2 = r2_score(test_frame[TARGET], test_prediction)
    metrics = {
        "model": "HistGradientBoostingRegressor",
        "dataset": "Open-Meteo recent forecast history",
        "rows": len(frame),
        "location": "28.6139, 77.2090",
        "features": FEATURES,
        "target": TARGET,
        "train_r2": round(float(train_r2), 4),
        "test_r2": round(float(test_r2), 4),
        "test_mae": round(float(mean_absolute_error(test_frame[TARGET], test_prediction)), 4),
        "test_rmse": round(float(np.sqrt(mean_squared_error(test_frame[TARGET], test_prediction))), 4),
        "cv_r2_mean": round(float(cv_scores.mean()), 4),
        "cv_r2_std": round(float(cv_scores.std()), 4),
        "overfit_gap": round(float(train_r2 - test_r2), 4),
        "fit_diagnosis": "underfitting" if test_r2 < 0.2 else "overfitting" if train_r2 - test_r2 > 0.2 else "balanced",
        "validation": "passed" if train_r2 - test_r2 <= 0.2 and test_r2 >= 0.2 else "rejected",
    }
    if metrics["validation"] != "passed":
        raise RuntimeError(f"Model validation rejected: {metrics}")
    joblib.dump({"model": model, "features": FEATURES, "target": TARGET}, MODEL_FILE)
    METRICS_FILE.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))
    print(f"Saved model: {MODEL_FILE}")


if __name__ == "__main__":
    train()
