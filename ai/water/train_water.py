from pathlib import Path
from urllib.request import urlopen
import io
import json
import zipfile

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent
MODEL_FILE = ROOT / "water_consumption_model.joblib"
METRICS_FILE = ROOT / "water_model_metrics.json"
DATA_FILE = ROOT / "water_consumption_dataset.csv"
KAGGLE_URL = "https://www.kaggle.com/api/v1/datasets/download/prince7489/household-water-consumption-dataset"
RANDOM_STATE = 42
FEATURES = ["Bathroom_Liters", "Kitchen_Liters", "Laundry_Liters", "Gardening_Liters"]
TARGET = "Total_Liters"


def download_dataset():
    with urlopen(KAGGLE_URL, timeout=60) as response:
        archive_bytes = response.read()
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        source_name = next(name for name in archive.namelist() if name.lower().endswith(".csv"))
        with archive.open(source_name) as source:
            frame = pd.read_csv(source)
    frame = frame.dropna(subset=FEATURES + [TARGET]).copy()
    frame[FEATURES + [TARGET]] = frame[FEATURES + [TARGET]].apply(pd.to_numeric, errors="coerce")
    frame = frame.dropna(subset=FEATURES + [TARGET]).reset_index(drop=True)
    frame.to_csv(DATA_FILE, index=False)
    return frame


def train():
    frame = download_dataset()
    train_frame, test_frame = train_test_split(frame, test_size=0.2, random_state=RANDOM_STATE)
    model = Pipeline([
        ("scale", StandardScaler()),
        ("regressor", HistGradientBoostingRegressor(
            max_iter=120,
            learning_rate=0.04,
            max_leaf_nodes=7,
            min_samples_leaf=8,
            l2_regularization=2.0,
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
        cv=KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE),
        scoring="r2",
        n_jobs=-1,
    )
    train_r2 = r2_score(train_frame[TARGET], train_prediction)
    test_r2 = r2_score(test_frame[TARGET], test_prediction)
    overfit_gap = train_r2 - test_r2
    fit_diagnosis = "underfitting" if test_r2 < 0.5 else "overfitting" if overfit_gap > 0.2 else "balanced"
    metrics = {
        "model": "regularized HistGradientBoostingRegressor",
        "dataset": "Kaggle: prince7489/household-water-consumption-dataset",
        "rows": len(frame),
        "features": FEATURES,
        "target": TARGET,
        "train_r2": round(float(train_r2), 4),
        "test_r2": round(float(test_r2), 4),
        "test_mae_liters": round(float(mean_absolute_error(test_frame[TARGET], test_prediction)), 4),
        "test_rmse_liters": round(float(np.sqrt(mean_squared_error(test_frame[TARGET], test_prediction))), 4),
        "cv_r2_mean": round(float(cv_scores.mean()), 4),
        "cv_r2_std": round(float(cv_scores.std()), 4),
        "overfit_gap": round(float(overfit_gap), 4),
        "fit_diagnosis": fit_diagnosis,
        "validation": "passed" if fit_diagnosis == "balanced" else "rejected",
    }
    if metrics["validation"] != "passed":
        raise RuntimeError(f"Model validation rejected: {metrics}")
    joblib.dump({"model": model, "features": FEATURES, "target": TARGET}, MODEL_FILE)
    METRICS_FILE.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))
    print(f"Saved model: {MODEL_FILE}")


if __name__ == "__main__":
    train()