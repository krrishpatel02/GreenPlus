import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    ExtraTreesRegressor
)

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

import joblib
# GREENPLUS ENERGY ML V1
print("\n" + "=" * 65)
print("          🌱 GREENPLUS ENERGY ML V1")
# 1. LOAD DATA
df = pd.read_csv("energy.csv")

print("\nDataset shape:")
print(df.shape)
# 2. REMOVE UNNECESSARY COLUMNS
# The dataset contains a date column.
# For V1 we will extract useful time information from it.

if "date" in df.columns:

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df["hour"] = df["date"].dt.hour

    df["day_of_week"] = df["date"].dt.dayofweek

    df["month"] = df["date"].dt.month

    df["is_weekend"] = (
        df["day_of_week"] >= 5
    ).astype(int)

    df.drop(
        columns=["date"],
        inplace=True
    )
# 3. REMOVE ROWS WITHOUT TARGET
target = "Appliances"

df = df.dropna(
    subset=[target]
)
# 4. FEATURES / TARGET
X = df.drop(
    columns=[target]
)

y = df[target]


print("\nInput features:", X.shape[1])
print("Target:", target)
# 5. NUMERIC FEATURES
numeric_features = X.select_dtypes(
    include=["int64", "float64", "int32", "float32"]
).columns.tolist()

print(
    "\nNumeric features:",
    len(numeric_features)
)
# 6. PREPROCESSING
numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="median"
            )
        )
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_pipeline,
            numeric_features
        )
    ],
    remainder="drop"
)
# 7. 80/20 TRAIN TEST SPLIT
X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42
)


print("\n" + "=" * 65)
print("             80/20 TRAIN TEST SPLIT")
print(
    "Training samples:",
    len(X_train)
)

print(
    "Testing samples :",
    len(X_test)
)
# 8. MODELS
models = {

    "Random Forest":
        RandomForestRegressor(
            n_estimators=250,
            max_depth=None,
            min_samples_split=2,
            random_state=42,
            n_jobs=-1
        ),

    "Gradient Boosting":
        GradientBoostingRegressor(
            n_estimators=250,
            learning_rate=0.05,
            max_depth=4,
            loss="huber",
            random_state=42
        ),

    "Extra Trees":
        ExtraTreesRegressor(
            n_estimators=250,
            max_depth=None,
            min_samples_split=2,
            random_state=42,
            n_jobs=-1
        )
}
# 9. TRAIN MODELS
results = {}

trained_models = {}


for name, model in models.items():

    print("\n")
    print("Training", name + "...")

    pipeline = Pipeline(
        steps=[

            (
                "preprocessor",
                preprocessor
            ),

            (
                "model",
                model
            )
        ]
    )

    pipeline.fit(
        X_train,
        y_train
    )

    predictions = pipeline.predict(
        X_test
    )

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            predictions
        )
    )

    r2 = r2_score(
        y_test,
        predictions
    )

    results[name] = {

        "MAE": mae,

        "RMSE": rmse,

        "R2": r2
    }

    trained_models[name] = pipeline

    print(
        f"{name} completed."
    )

    print(
        f"MAE  : {mae:.4f}"
    )

    print(
        f"RMSE : {rmse:.4f}"
    )

    print(
        f"R²   : {r2:.4f}"
    )
# 10. FIND BEST MODEL
best_model_name = max(
    results,
    key=lambda name:
        results[name]["R2"]
)

best_model = trained_models[
    best_model_name
]


best_mae = results[
    best_model_name
]["MAE"]

best_rmse = results[
    best_model_name
]["RMSE"]

best_r2 = results[
    best_model_name
]["R2"]


print("\n" + "=" * 65)
print("              🏆 BEST ENERGY MODEL")
print(
    "Model:",
    best_model_name
)

print(
    f"MAE  : {best_mae:.4f}"
)

print(
    f"RMSE : {best_rmse:.4f}"
)

print(
    f"R²   : {best_r2:.4f}"
)
# 11. 5-FOLD CROSS VALIDATION
print("\n" + "=" * 65)
print("              5-FOLD CROSS VALIDATION")
cv_scores = cross_val_score(

    best_model,

    X,

    y,

    cv=5,

    scoring="r2",

    n_jobs=-1
)


for i, score in enumerate(
    cv_scores,
    start=1
):

    print(
        f"Fold {i}: {score:.4f}"
    )


print(
    f"\nMean CV R²: "
    f"{cv_scores.mean():.4f}"
)

print(
    f"CV Std    : "
    f"{cv_scores.std():.4f}"
)
# 12. SAVE MODEL
joblib.dump(
    best_model,
    "energy_model_v1.joblib"
)
# 13. SAVE MODEL COMPARISON
comparison = pd.DataFrame(
    results
).T

comparison.to_csv(
    "energy_v1_model_comparison.csv"
)
# 14. SAVE TEST PREDICTIONS
test_predictions = best_model.predict(
    X_test
)

prediction_df = pd.DataFrame({

    "actual_appliances_energy":
        y_test.values,

    "predicted_appliances_energy":
        test_predictions,

    "absolute_error":
        np.abs(
            y_test.values
            - test_predictions
        )
})

prediction_df.to_csv(
    "energy_v1_predictions.csv",
    index=False
)
# 15. FINAL
print("\n" + "=" * 65)
print("        🌱 GREENPLUS ENERGY MODEL READY")
print(
    "\nSaved model:"
)

print(
    "energy_model_v1.joblib"
)

print(
    "\nSaved comparison:"
)

print(
    "energy_v1_model_comparison.csv"
)

print(
    "\nSaved predictions:"
)

print(
    "energy_v1_predictions.csv"
)

print("\nTraining completed successfully! 🚀")