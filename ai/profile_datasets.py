"""Create reproducible data-quality reports for GreenPlus CSV artifacts.

This script is intentionally descriptive: it never drops rows, imputes values,
or modifies source datasets. Reports are written under ``ai/reports``.
"""

from __future__ import annotations

import hashlib
import json
import platform
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import sklearn


ROOT = Path(__file__).resolve().parent
REPORT_DIR = ROOT / "reports"
TARGET_CANDIDATES = {
    "carbon_emission_kg",
    "Appliances",
    "shortwave_radiation",
    "pm2_5",
    "rain_event",
    "temperature_2m",
    "wind_speed_10m",
    "uv_index",
}
TARGET_BY_DATASET = {
    "rainfall_dataset": "rain_event",
    "realtime_weather_dataset": "shortwave_radiation",
    "temperature_dataset": "temperature_2m",
    "wind_dataset": "wind_speed_10m",
    "uv_index_dataset": "uv_index",
}
DERIVED_FILE_MARKERS = ("prediction", "comparison", "importance")
LEAKAGE_MARKERS = ("target", "prediction", "actual", "label", "future", "next_")
IDENTIFIER_MARKERS = ("id", "uuid", "unnamed")
DERIVED_TARGET_FEATURES = {
    "rain_event": {"precipitation"},
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def file_role(path: Path) -> str:
    name = path.stem.lower()
    return "derived_output" if any(marker in name for marker in DERIVED_FILE_MARKERS) else "dataset_candidate"


def target_column(path: Path, frame: pd.DataFrame) -> str | None:
    configured_target = TARGET_BY_DATASET.get(path.stem)
    if configured_target in frame.columns:
        return configured_target
    matches = [column for column in frame.columns if column in TARGET_CANDIDATES]
    return matches[0] if len(matches) == 1 else None


def value_summary(series: pd.Series) -> dict:
    values = series.dropna()
    summary = {"unique_count": int(values.nunique(dropna=True))}
    if len(values) <= 50 or values.nunique(dropna=True) <= 20:
        summary["top_values"] = {str(key): int(value) for key, value in values.value_counts().head(10).items()}
    return summary


def outlier_summary(series: pd.Series) -> dict:
    values = pd.to_numeric(series, errors="coerce").dropna()
    if values.empty:
        return {"method": "IQR", "count": 0, "lower": None, "upper": None}
    first, third = values.quantile([0.25, 0.75])
    spread = third - first
    lower, upper = first - 1.5 * spread, third + 1.5 * spread
    return {
        "method": "IQR",
        "count": int(((values < lower) | (values > upper)).sum()),
        "lower": round(float(lower), 6),
        "upper": round(float(upper), 6),
    }


def profile(path: Path) -> dict:
    frame = pd.read_csv(path)
    target = target_column(path, frame)
    numeric_columns = frame.select_dtypes(include=np.number).columns.tolist()
    categorical_columns = [column for column in frame.columns if column not in numeric_columns]
    missing = frame.isna().sum()
    leakage_candidates = [
        column for column in frame.columns
        if any(marker in column.lower() for marker in LEAKAGE_MARKERS)
        and column != target
    ]
    leakage_candidates.extend(
        column for column in DERIVED_TARGET_FEATURES.get(target, set())
        if column in frame.columns and column not in leakage_candidates
    )
    irrelevant_candidates = [
        column for column in frame.columns
        if column.lower().startswith("unnamed")
        or column.lower() in {"id", "uuid"}
        or column.lower().endswith(("_id", "_uuid"))
    ]

    correlations = {}
    if target and target in numeric_columns:
        correlations = {
            column: round(float(value), 6)
            for column, value in frame[numeric_columns].corr(numeric_only=True)[target].drop(labels=[target], errors="ignore").dropna().items()
        }

    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source": str(path.relative_to(ROOT.parent)),
        "source_sha256": sha256(path),
        "role": file_role(path),
        "rows": int(len(frame)),
        "columns": int(len(frame.columns)),
        "feature_names": frame.columns.tolist(),
        "target_column": target,
        "dtypes": {column: str(dtype) for column, dtype in frame.dtypes.items()},
        "numeric_features": numeric_columns,
        "categorical_features": categorical_columns,
        "missing_values": {
            column: {"count": int(count), "percent": round(float(count / max(len(frame), 1) * 100), 4)}
            for column, count in missing.items() if count
        },
        "duplicate_records": int(frame.duplicated().sum()),
        "unique_values": {column: value_summary(frame[column]) for column in frame.columns},
        "outlier_analysis": {column: outlier_summary(frame[column]) for column in numeric_columns},
        "target_distribution": value_summary(frame[target]) if target else None,
        "target_numeric_summary": (
            {key: round(float(value), 6) for key, value in frame[target].describe().items()}
            if target and target in numeric_columns else None
        ),
        "numeric_target_correlations": correlations,
        "potential_leakage_features": leakage_candidates,
        "potentially_irrelevant_features": irrelevant_candidates,
        "notes": [
            "IQR outliers are signals for review, not automatic removal decisions.",
            "Correlation is descriptive and does not establish causality or safe feature use.",
            "Known weather targets use the dataset-specific training contract; other targets require exactly one known target column.",
            "Rainfall precipitation is flagged because rain_event is defined from it and must not be used for leakage-safe prediction.",
        ],
    }
    return report


def main() -> None:
    REPORT_DIR.mkdir(exist_ok=True)
    rows = []
    for path in sorted(ROOT.rglob("*.csv")):
        if REPORT_DIR in path.parents:
            continue
        report = profile(path)
        output = REPORT_DIR / f"{path.relative_to(ROOT).with_suffix('')}.json"
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        rows.append({
            "source": report["source"].replace("\\", "/"),
            "role": report["role"],
            "rows": report["rows"],
            "columns": report["columns"],
            "target_column": report["target_column"],
            "missing_cells": sum(item["count"] for item in report["missing_values"].values()),
            "duplicate_records": report["duplicate_records"],
            "sha256": report["source_sha256"],
            "report": output.relative_to(ROOT.parent).as_posix(),
        })

    summary = pd.DataFrame(rows)
    hash_counts = summary["sha256"].value_counts()
    summary["duplicate_source_hash"] = summary["sha256"].map(hash_counts).gt(1)
    summary.to_csv(REPORT_DIR / "dataset_summary.csv", index=False)
    metadata = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "python": platform.python_version(),
        "pandas": pd.__version__,
        "scikit_learn": sklearn.__version__,
        "datasets_profiled": len(rows),
        "source": "ai/profile_datasets.py",
    }
    (REPORT_DIR / "profiling_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata, indent=2))
    print(summary.to_string(index=False))


if __name__ == "__main__":
    main()