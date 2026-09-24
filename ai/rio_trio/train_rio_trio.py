from pathlib import Path
from urllib.request import urlopen
import io
import json
import zipfile

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "rio_trio_dataset.csv"
MODEL_FILE = ROOT / "rio_trio_model.joblib"
METRICS_FILE = ROOT / "rio_trio_model_metrics.json"
KAGGLE_URL = "https://www.kaggle.com/api/v1/datasets/download/sonalshinde123/personal-carbon-footprint-behavior-dataset"
RANDOM_STATE = 42
FEATURES = ["transport_mode", "distance_km", "electricity_kwh", "renewable_usage_pct", "food_type", "waste_generated_kg"]
CATEGORICAL = ["transport_mode", "food_type"]
NUMERIC = [feature for feature in FEATURES if feature not in CATEGORICAL]
TARGETS = ["unfccc_opportunity", "cbd_opportunity", "unccd_opportunity"]


def download_dataset():
    with urlopen(KAGGLE_URL, timeout=60) as response:
        archive_bytes = response.read()
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        source_name = next(name for name in archive.namelist() if name.lower().endswith(".csv"))
        with archive.open(source_name) as source:
            frame = pd.read_csv(source)
    frame = frame.dropna(subset=FEATURES).copy()
    frame[NUMERIC] = frame[NUMERIC].apply(pd.to_numeric, errors="coerce")
    frame = frame.dropna(subset=NUMERIC).reset_index(drop=True)
    frame["unfccc_opportunity"] = np.clip(0.55 * frame["electricity_kwh"] / 15 + 0.25 * frame["distance_km"] / 20 + 0.20 * (1 - frame["renewable_usage_pct"] / 100), 0, 1)
    frame["cbd_opportunity"] = np.clip(0.55 * (frame["food_type"] == "Non-Veg").astype(float) + 0.45 * frame["waste_generated_kg"] / 2.5, 0, 1)
    frame["unccd_opportunity"] = np.clip(0.70 * frame["waste_generated_kg"] / 2.5 + 0.30 * (frame["food_type"] == "Non-Veg").astype(float), 0, 1)
    frame.to_csv(DATA_FILE, index=False)
    return frame


def make_model():
    preprocess = ColumnTransformer([
        ("categorical", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL),
        ("numeric", StandardScaler(), NUMERIC),
    ])
    estimator = MultiOutputRegressor(HistGradientBoostingRegressor(
        max_iter=120, learning_rate=0.04, max_leaf_nodes=8, min_samples_leaf=20,
        l2_regularization=2.0, random_state=RANDOM_STATE,
    ))
    return Pipeline([("preprocess", preprocess), ("model", estimator)])


def train():
    frame = download_dataset()
    train_frame, test_frame = train_test_split(frame, test_size=0.2, random_state=RANDOM_STATE)
    model = make_model()
    model.fit(train_frame[FEATURES], train_frame[TARGETS])
    train_prediction = np.clip(model.predict(train_frame[FEATURES]), 0, 1)
    test_prediction = np.clip(model.predict(test_frame[FEATURES]), 0, 1)
    cv_scores = cross_val_score(model, train_frame[FEATURES], train_frame[TARGETS], cv=KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE), scoring="r2", n_jobs=-1)
    target_metrics = {}
    gaps = []
    for index, target in enumerate(TARGETS):
        train_r2 = r2_score(train_frame[target], train_prediction[:, index])
        test_r2 = r2_score(test_frame[target], test_prediction[:, index])
        gaps.append(train_r2 - test_r2)
        target_metrics[target] = {
            "train_r2": round(float(train_r2), 4), "test_r2": round(float(test_r2), 4),
            "test_mae": round(float(mean_absolute_error(test_frame[target], test_prediction[:, index])), 4),
            "overfit_gap": round(float(train_r2 - test_r2), 4),
        }
    max_gap = max(gaps)
    metrics = {
        "dataset": "Kaggle: sonalshinde123/personal-carbon-footprint-behavior-dataset",
        "rows": len(frame), "features": FEATURES, "targets": TARGETS,
        "targets_metrics": target_metrics,
        "cv_r2_mean": round(float(cv_scores.mean()), 4), "cv_r2_std": round(float(cv_scores.std()), 4),
        "overfit_gap": round(float(max_gap), 4),
        "fit_diagnosis": "balanced" if max_gap <= 0.2 and min(item["test_r2"] for item in target_metrics.values()) >= 0.5 else "rejected",
    }
    metrics["validation"] = "passed" if metrics["fit_diagnosis"] == "balanced" else "rejected"
    if metrics["validation"] != "passed":
        raise RuntimeError(f"Model validation rejected: {metrics}")
    joblib.dump({"model": model, "features": FEATURES, "targets": TARGETS}, MODEL_FILE)
    METRICS_FILE.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    train()