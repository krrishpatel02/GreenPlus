"""
        🌱 GREENPLUS ENERGY ML V2
Real-world energy consumption prediction.

V2 improvements:
    • Time-based feature engineering
    • Cyclic hour/day/month features
    • Temperature relationships
    • Humidity relationships
    • Indoor/outdoor differences
    • Interaction features
    • Robust missing-value handling
    • 80/20 train-test split
    • Multiple ML models
    • Memory-safe 5-fold cross validation
    • Feature importance
    • Prediction export

Target:
    Appliances
"""

import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import (
    train_test_split,
    KFold,
    cross_val_score
)

from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

from sklearn.ensemble import (
    RandomForestRegressor,
    ExtraTreesRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor
)

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
# CONFIGURATION
DATASET = "energy.csv"

TARGET = "Appliances"

RANDOM_STATE = 42
# HEADER
print("\n")
print("             🌱 GREENPLUS ENERGY ML V2")
# 1. LOAD DATASET
print("\nLoading dataset...")

df = pd.read_csv(DATASET)

print("\nOriginal dataset:")
print("Shape:", df.shape)
# 2. REMOVE DUPLICATES
duplicates = df.duplicated().sum()

print(
    "Duplicates removed:",
    duplicates
)

df = df.drop_duplicates().reset_index(
    drop=True
)
# 3. DATE / TIME FEATURES
if "date" in df.columns:

    print("\nCreating time features...")

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    # Basic time
    df["hour"] = df["date"].dt.hour

    df["day_of_week"] = (
        df["date"].dt.dayofweek
    )

    df["month"] = (
        df["date"].dt.month
    )

    df["day"] = (
        df["date"].dt.day
    )

    # Weekend
    df["is_weekend"] = (
        df["day_of_week"] >= 5
    ).astype(int)

    # Working hours
    df["is_working_hour"] = (
        (df["hour"] >= 9)
        &
        (df["hour"] <= 18)
    ).astype(int)

    # Morning
    df["is_morning"] = (
        (df["hour"] >= 6)
        &
        (df["hour"] < 12)
    ).astype(int)

    # Afternoon
    df["is_afternoon"] = (
        (df["hour"] >= 12)
        &
        (df["hour"] < 18)
    ).astype(int)

    # Evening
    df["is_evening"] = (
        (df["hour"] >= 18)
        &
        (df["hour"] < 23)
    ).astype(int)

    # Night
    df["is_night"] = (
        (df["hour"] >= 23)
        |
        (df["hour"] < 6)
    ).astype(int)
    # Cyclic encoding
    df["hour_sin"] = np.sin(
        2 * np.pi * df["hour"] / 24
    )

    df["hour_cos"] = np.cos(
        2 * np.pi * df["hour"] / 24
    )

    df["day_sin"] = np.sin(
        2 * np.pi * df["day_of_week"] / 7
    )

    df["day_cos"] = np.cos(
        2 * np.pi * df["day_of_week"] / 7
    )

    df["month_sin"] = np.sin(
        2 * np.pi * df["month"] / 12
    )

    df["month_cos"] = np.cos(
        2 * np.pi * df["month"] / 12
    )

    # Remove original date
    df.drop(
        columns=["date"],
        inplace=True
    )
# 4. ENVIRONMENTAL FEATURE ENGINEERING
print(
    "\nCreating environmental features..."
)
# Temperature differences
if "T1" in df.columns and "T_out" in df.columns:

    df["T1_Tout_difference"] = (
        df["T1"] - df["T_out"]
    )


if "T2" in df.columns and "T_out" in df.columns:

    df["T2_Tout_difference"] = (
        df["T2"] - df["T_out"]
    )


if "T3" in df.columns and "T_out" in df.columns:

    df["T3_Tout_difference"] = (
        df["T3"] - df["T_out"]
    )
# Humidity differences
if "RH_1" in df.columns and "RH_out" in df.columns:

    df["RH1_RHout_difference"] = (
        df["RH_1"] - df["RH_out"]
    )


if "RH_2" in df.columns and "RH_out" in df.columns:

    df["RH2_RHout_difference"] = (
        df["RH_2"] - df["RH_out"]
    )
# 5. THERMAL / HUMIDITY INTERACTION FEATURES
if "T_out" in df.columns and "RH_out" in df.columns:

    df["outdoor_heat_humidity"] = (
        df["T_out"] * df["RH_out"]
    )


if "T1" in df.columns and "RH_1" in df.columns:

    df["indoor_heat_humidity"] = (
        df["T1"] * df["RH_1"]
    )
# 6. TEMPERATURE STATISTICS
temperature_columns = [
    column
    for column in df.columns
    if column.startswith("T")
    and column[1:].replace(
        "_",
        ""
    ).replace(
        "out",
        ""
    ).isdigit()
]


if len(temperature_columns) > 1:

    df["temperature_mean"] = (
        df[temperature_columns]
        .mean(axis=1)
    )

    df["temperature_min"] = (
        df[temperature_columns]
        .min(axis=1)
    )

    df["temperature_max"] = (
        df[temperature_columns]
        .max(axis=1)
    )

    df["temperature_range"] = (
        df["temperature_max"]
        -
        df["temperature_min"]
    )
# 7. HUMIDITY STATISTICS
humidity_columns = [
    column
    for column in df.columns
    if column.startswith("RH_")
]


if len(humidity_columns) > 1:

    df["humidity_mean"] = (
        df[humidity_columns]
        .mean(axis=1)
    )

    df["humidity_min"] = (
        df[humidity_columns]
        .min(axis=1)
    )

    df["humidity_max"] = (
        df[humidity_columns]
        .max(axis=1)
    )

    df["humidity_range"] = (
        df["humidity_max"]
        -
        df["humidity_min"]
    )
# 8. TARGET CLEANING
df = df.dropna(
    subset=[TARGET]
)
# 9. FEATURES / TARGET
X = df.drop(
    columns=[TARGET]
)

y = df[TARGET]


print("\nFinal dataset:")
print(
    "Rows    :",
    len(X)
)

print(
    "Features:",
    X.shape[1]
)
# 10. KEEP NUMERIC FEATURES
numeric_features = X.select_dtypes(
    include=np.number
).columns.tolist()


X = X[numeric_features]


print(
    "Numeric features:",
    len(numeric_features)
)
# 11. 80/20 SPLIT
print("\n")
print("             80/20 TRAIN TEST SPLIT")
X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=RANDOM_STATE
)


print(
    "Training samples:",
    len(X_train)
)

print(
    "Testing samples :",
    len(X_test)
)
# 12. PREPROCESSOR
preprocessor = SimpleImputer(
    strategy="median"
)
# 13. MODELS
models = {

    "Random Forest":
        RandomForestRegressor(

            n_estimators=120,

            max_depth=18,

            min_samples_leaf=2,

            max_features="sqrt",

            random_state=RANDOM_STATE,

            n_jobs=1
        ),

    "Gradient Boosting":
        GradientBoostingRegressor(

            n_estimators=180,

            learning_rate=0.04,

            max_depth=3,

            min_samples_leaf=3,

            loss="huber",

            random_state=RANDOM_STATE
        ),

    "Extra Trees":
        ExtraTreesRegressor(

            n_estimators=120,

            max_depth=18,

            min_samples_leaf=2,

            max_features="sqrt",

            random_state=RANDOM_STATE,

            n_jobs=1
        ),

    "Hist Gradient Boosting":
        HistGradientBoostingRegressor(

            max_iter=180,

            learning_rate=0.05,

            max_leaf_nodes=31,

            l2_regularization=0.1,

            random_state=RANDOM_STATE
        )
}
# 14. TRAIN MODELS
results = {}

trained_models = {}

predictions_store = {}


for name, model in models.items():

    print("\n")

    print(
        "Training",
        name + "..."
    )


    pipeline = Pipeline(

        steps=[

            (
                "imputer",
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

    predictions_store[name] = predictions


    print(
        name,
        "completed."
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
# 15. BEST MODEL
best_model_name = max(

    results,

    key=lambda model_name:
        results[model_name]["R2"]
)


best_model = trained_models[
    best_model_name
]

best_predictions = predictions_store[
    best_model_name
]


print("\n")
print("                 🏆 BEST V2 MODEL")
print(
    "Model:",
    best_model_name
)

print(
    f"MAE  : "
    f"{results[best_model_name]['MAE']:.4f}"
)

print(
    f"RMSE : "
    f"{results[best_model_name]['RMSE']:.4f}"
)

print(
    f"R²   : "
    f"{results[best_model_name]['R2']:.4f}"
)
# 16. MEMORY-SAFE 5-FOLD CV
print("\n")
print("              5-FOLD CROSS VALIDATION")
print(
    "\nRunning sequential CV to avoid memory issues..."
)


cv = KFold(

    n_splits=5,

    shuffle=True,

    random_state=RANDOM_STATE
)


cv_scores = []


for fold, (train_index, val_index) in enumerate(

    cv.split(X),

    start=1
):

    X_cv_train = X.iloc[
        train_index
    ]

    X_cv_val = X.iloc[
        val_index
    ]

    y_cv_train = y.iloc[
        train_index
    ]

    y_cv_val = y.iloc[
        val_index
    ]


    # Clone a fresh model
    from sklearn.base import clone

    cv_model = clone(
        best_model
    )


    cv_model.fit(

        X_cv_train,

        y_cv_train
    )


    cv_prediction = cv_model.predict(

        X_cv_val
    )


    fold_r2 = r2_score(

        y_cv_val,

        cv_prediction
    )


    cv_scores.append(
        fold_r2
    )


    print(
        f"Fold {fold}: "
        f"{fold_r2:.4f}"
    )


cv_scores = np.array(
    cv_scores
)


print(
    f"\nMean CV R²: "
    f"{cv_scores.mean():.4f}"
)

print(
    f"CV Std    : "
    f"{cv_scores.std():.4f}"
)
# 17. FEATURE IMPORTANCE
print("\n")
print("                 FEATURE IMPORTANCE")
model_object = best_model.named_steps[
    "model"
]


if hasattr(
    model_object,
    "feature_importances_"
):

    importances = (
        model_object
        .feature_importances_
    )

    importance_df = pd.DataFrame({

        "feature":
            numeric_features,

        "importance":
            importances

    }).sort_values(

        "importance",

        ascending=False
    )


    print(
        importance_df.head(15).to_string(
            index=False
        )
    )


else:

    importance_df = pd.DataFrame()

    print(
        "Feature importance not available "
        "for this model."
    )
# 18. SAVE MODEL
joblib.dump(

    best_model,

    "energy_model_v2.joblib"
)
# 19. SAVE COMPARISON
comparison_df = pd.DataFrame(
    results
).T

comparison_df.to_csv(

    "energy_v2_model_comparison.csv"
)
# 20. SAVE PREDICTIONS
prediction_df = pd.DataFrame({

    "actual_appliances_energy":
        y_test.values,

    "predicted_appliances_energy":
        best_predictions,

    "absolute_error":
        np.abs(
            y_test.values
            -
            best_predictions
        )

})


prediction_df.to_csv(

    "energy_v2_predictions.csv",

    index=False
)
# 21. SAVE FEATURE IMPORTANCE
if not importance_df.empty:

    importance_df.to_csv(

        "energy_v2_feature_importance.csv",

        index=False
    )
# FINAL
print("\n")
print("          🌱 GREENPLUS ENERGY V2 READY")
print(
    "\nSaved model:"
)

print(
    "energy_model_v2.joblib"
)

print(
    "\nSaved comparison:"
)

print(
    "energy_v2_model_comparison.csv"
)

print(
    "\nSaved predictions:"
)

print(
    "energy_v2_predictions.csv"
)

if not importance_df.empty:

    print(
        "\nSaved feature importance:"
    )

    print(
        "energy_v2_feature_importance.csv"
    )


print(
    "\nTraining completed successfully! 🚀"
)