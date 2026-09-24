from pathlib import Path
from urllib.request import urlopen
import io
import json
import zipfile

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "recommendations_dataset.csv"
ACTION_MODEL_FILE = ROOT / "green_action_model.joblib"
ADVICE_MODEL_FILE = ROOT / "eco_advice_model.joblib"
METRICS_FILE = ROOT / "recommendation_model_metrics.json"
KAGGLE_URL = "https://www.kaggle.com/api/v1/datasets/download/sonalshinde123/personal-carbon-footprint-behavior-dataset"
RANDOM_STATE = 42
FEATURES = ["day_type", "transport_mode", "distance_km", "electricity_kwh", "renewable_usage_pct", "food_type", "screen_time_hours", "waste_generated_kg"]
CATEGORICAL = ["day_type", "transport_mode", "food_type"]
NUMERIC = [feature for feature in FEATURES if feature not in CATEGORICAL]


def download_dataset():
    with urlopen(KAGGLE_URL, timeout=60) as response:
        archive_bytes = response.read()
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        source_name = next(name for name in archive.namelist() if name.lower().endswith(".csv"))
        with archive.open(source_name) as source:
            frame = pd.read_csv(source)
    frame = frame.dropna(subset=FEATURES + ["eco_actions", "carbon_impact_level"]).copy()
    frame[NUMERIC + ["eco_actions"]] = frame[NUMERIC + ["eco_actions"]].apply(pd.to_numeric, errors="coerce")
    frame = frame.dropna(subset=NUMERIC + ["eco_actions"]).reset_index(drop=True)
    frame["action_opportunity"] = np.clip(
        0.30 * frame["electricity_kwh"] / 15
        + 0.25 * frame["distance_km"] / 20
        + 0.25 * (1 - frame["renewable_usage_pct"] / 100)
        + 0.20 * frame["waste_generated_kg"] / 2.5,
        0,
        1,
    )
    frame.to_csv(DATA_FILE, index=False)
    return frame


def pipeline(estimator):
    preprocess = ColumnTransformer([
        ("categorical", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL),
        ("numeric", StandardScaler(), NUMERIC),
    ])
    return Pipeline([("preprocess", preprocess), ("model", estimator)])


def train():
    frame = download_dataset()
    features = frame[FEATURES]

    action_train, action_test = train_test_split(frame, test_size=0.2, random_state=RANDOM_STATE)
    action_model = pipeline(HistGradientBoostingRegressor(
        max_iter=140, learning_rate=0.04, max_leaf_nodes=9, min_samples_leaf=20,
        l2_regularization=2.0, random_state=RANDOM_STATE,
    ))
    action_model.fit(action_train[FEATURES], action_train["action_opportunity"])
    action_train_prediction = np.clip(action_model.predict(action_train[FEATURES]), 0, 1)
    action_test_prediction = np.clip(action_model.predict(action_test[FEATURES]), 0, 1)
    action_cv = cross_val_score(
        action_model, action_train[FEATURES], action_train["action_opportunity"],
        cv=KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE), scoring="r2", n_jobs=-1,
    )
    action_train_r2 = r2_score(action_train["action_opportunity"], action_train_prediction)
    action_test_r2 = r2_score(action_test["action_opportunity"], action_test_prediction)

    advice_train, advice_test = train_test_split(
        frame, test_size=0.2, random_state=RANDOM_STATE, stratify=frame["carbon_impact_level"],
    )
    advice_model = pipeline(HistGradientBoostingClassifier(
        max_iter=120, learning_rate=0.04, max_leaf_nodes=9, min_samples_leaf=20,
        l2_regularization=2.0, random_state=RANDOM_STATE,
    ))
    advice_model.fit(advice_train[FEATURES], advice_train["carbon_impact_level"])
    advice_train_prediction = advice_model.predict(advice_train[FEATURES])
    advice_test_prediction = advice_model.predict(advice_test[FEATURES])
    advice_cv = cross_val_score(
        advice_model, advice_train[FEATURES], advice_train["carbon_impact_level"],
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE), scoring="f1_macro", n_jobs=-1,
    )
    action_gap = action_train_r2 - action_test_r2
    advice_train_f1 = f1_score(advice_train["carbon_impact_level"], advice_train_prediction, average="macro")
    advice_test_f1 = f1_score(advice_test["carbon_impact_level"], advice_test_prediction, average="macro")
    advice_gap = advice_train_f1 - advice_test_f1
    action_diagnosis = "underfitting" if action_test_r2 < 0.05 else "overfitting" if action_gap > 0.2 else "balanced"
    advice_diagnosis = "underfitting" if advice_test_f1 < 0.35 else "overfitting" if advice_gap > 0.2 else "balanced"
    metrics = {
        "dataset": "Kaggle: sonalshinde123/personal-carbon-footprint-behavior-dataset",
        "rows": len(frame), "features": FEATURES,
        "green_action": {
            "target": "action_opportunity", "model": "regularized HistGradientBoostingRegressor",
            "train_r2": round(float(action_train_r2), 4), "test_r2": round(float(action_test_r2), 4),
            "test_mae": round(float(mean_absolute_error(action_test["action_opportunity"], action_test_prediction)), 4),
            "test_rmse": round(float(np.sqrt(mean_squared_error(action_test["action_opportunity"], action_test_prediction))), 4),
            "cv_r2_mean": round(float(action_cv.mean()), 4), "cv_r2_std": round(float(action_cv.std()), 4),
            "overfit_gap": round(float(action_gap), 4), "fit_diagnosis": action_diagnosis,
        },
        "eco_advice": {
            "target": "carbon_impact_level", "model": "regularized HistGradientBoostingClassifier",
            "train_f1_macro": round(float(advice_train_f1), 4), "test_f1_macro": round(float(advice_test_f1), 4),
            "test_accuracy": round(float(accuracy_score(advice_test["carbon_impact_level"], advice_test_prediction)), 4),
            "cv_f1_macro_mean": round(float(advice_cv.mean()), 4), "cv_f1_macro_std": round(float(advice_cv.std()), 4),
            "overfit_gap": round(float(advice_gap), 4), "fit_diagnosis": advice_diagnosis,
        },
    }
    validation = action_diagnosis == "balanced" and advice_diagnosis == "balanced"
    metrics["validation"] = "passed" if validation else "rejected"
    if not validation:
        raise RuntimeError(f"Model validation rejected: {metrics}")
    joblib.dump({"model": action_model, "features": FEATURES, "target": "action_opportunity"}, ACTION_MODEL_FILE)
    joblib.dump({"model": advice_model, "features": FEATURES, "target": "carbon_impact_level"}, ADVICE_MODEL_FILE)
    METRICS_FILE.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    train()