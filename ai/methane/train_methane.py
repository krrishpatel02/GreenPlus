from pathlib import Path
from urllib.request import urlopen
import io
import json
import zipfile

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "methane_dataset.csv"
MODEL_FILE = ROOT / "methane_model.joblib"
METRICS_FILE = ROOT / "methane_model_metrics.json"
KAGGLE_URL = "https://www.kaggle.com/api/v1/datasets/download/serg4nt/methane-emissions-and-drivers"
RANDOM_STATE = 42
FEATURES = ["country", "year", "population", "gdp", "agricultural_land_pct", "livestock_production_index", "agri_value_added_pct_gdp", "rural_population_pct", "primary_energy_consumption"]
CATEGORICAL = ["country"]
NUMERIC = [feature for feature in FEATURES if feature not in CATEGORICAL]
TARGET = "methane_per_capita"


def download_dataset():
    with urlopen(KAGGLE_URL, timeout=60) as response:
        archive_bytes = response.read()
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        source_name = next(name for name in archive.namelist() if name.endswith("methane_emissions_and_drivers.csv"))
        with archive.open(source_name) as source:
            frame = pd.read_csv(source)
    frame[NUMERIC + [TARGET]] = frame[NUMERIC + [TARGET]].apply(pd.to_numeric, errors="coerce")
    frame = frame.dropna(subset=FEATURES + [TARGET]).sort_values("year").reset_index(drop=True)
    frame.to_csv(DATA_FILE, index=False)
    return frame


def train():
    frame = download_dataset()
    train_frame, test_frame = train_test_split(frame, test_size=0.2, random_state=RANDOM_STATE, stratify=frame["country"])
    preprocess = ColumnTransformer([
        ("country", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL),
        ("numeric", StandardScaler(), NUMERIC),
    ])
    model = Pipeline([
        ("preprocess", preprocess),
        ("regressor", RandomForestRegressor(
            n_estimators=180, max_depth=8, min_samples_leaf=20, max_features=0.65,
            n_jobs=-1, random_state=RANDOM_STATE,
        )),
    ])
    model.fit(train_frame[FEATURES], train_frame[TARGET])
    train_prediction = np.clip(model.predict(train_frame[FEATURES]), 0, None)
    test_prediction = np.clip(model.predict(test_frame[FEATURES]), 0, None)
    cv_scores = cross_val_score(model, train_frame[FEATURES], train_frame[TARGET], cv=KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE), scoring="r2", n_jobs=-1)
    train_r2 = r2_score(train_frame[TARGET], train_prediction)
    test_r2 = r2_score(test_frame[TARGET], test_prediction)
    overfit_gap = train_r2 - test_r2
    metrics = {
        "dataset": "Kaggle: serg4nt/methane-emissions-and-drivers",
        "rows": len(frame), "features": FEATURES, "target": TARGET,
        "validation_split": "stratified country-aware random 20 percent holdout",
        "unit": "tonnes CH4 per person per year",
        "train_r2": round(float(train_r2), 4), "test_r2": round(float(test_r2), 4),
        "test_mae": round(float(mean_absolute_error(test_frame[TARGET], test_prediction)), 4),
        "test_rmse": round(float(np.sqrt(mean_squared_error(test_frame[TARGET], test_prediction))), 4),
        "cv_r2_mean": round(float(cv_scores.mean()), 4), "cv_r2_std": round(float(cv_scores.std()), 4),
        "overfit_gap": round(float(overfit_gap), 4),
        "fit_diagnosis": "balanced" if test_r2 >= 0.5 and overfit_gap <= 0.2 else "rejected",
    }
    metrics["validation"] = "passed" if metrics["fit_diagnosis"] == "balanced" else "rejected"
    if metrics["validation"] != "passed":
        raise RuntimeError(f"Model validation rejected: {metrics}")
    joblib.dump({"model": model, "features": FEATURES, "target": TARGET, "unit": metrics["unit"], "latest_year": int(frame["year"].max()), "feature_defaults": {**train_frame[NUMERIC].median().to_dict(), "country": "India"}}, MODEL_FILE)
    METRICS_FILE.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    train()