import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    ExtraTreesRegressor
)
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# =========================================================
# CONFIG
# =========================================================

RANDOM_STATE = 42
TEST_SIZE = 0.20


# =========================================================
# 1. LOAD DATASET
# =========================================================

df = pd.read_csv("carbon_v2.csv")

print("\n==============================================")
print("       🌱 GREENPLUS CARBON MODEL V2")
print("==============================================")

print("\nOriginal dataset:")
print("Shape:", df.shape)


# =========================================================
# 2. REMOVE DUPLICATES
# =========================================================

duplicates = df.duplicated().sum()

df = df.drop_duplicates()

print("Duplicates removed:", duplicates)


# =========================================================
# 3. TARGET
# =========================================================

TARGET = "carbon_emission_kg"

df[TARGET] = pd.to_numeric(
    df[TARGET],
    errors="coerce"
)

df = df.dropna(
    subset=[TARGET]
)


# =========================================================
# 4. FEATURES
# =========================================================

X = df.drop(
    TARGET,
    axis=1
)

y = df[TARGET]


# =========================================================
# 5. IDENTIFY DATA TYPES
# =========================================================

categorical_features = [
    "diet_type"
]

numeric_features = [
    column
    for column in X.columns
    if column not in categorical_features
]


print("\nNumeric features:", len(numeric_features))
print("Categorical features:", len(categorical_features))
print("Total input features:", len(X.columns))


# =========================================================
# 6. PREPROCESSING
# =========================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        )
    ]
)


categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore"
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
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)


# =========================================================
# 7. 80/20 SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE
)


print("\n==============================================")
print("           80/20 TRAIN TEST SPLIT")
print("==============================================")

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


# =========================================================
# 8. RANDOM FOREST
# =========================================================

random_forest = RandomForestRegressor(
    n_estimators=500,
    max_depth=None,
    min_samples_split=4,
    min_samples_leaf=2,
    max_features=0.8,
    bootstrap=True,
    random_state=RANDOM_STATE,
    n_jobs=-1
)


rf_pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            random_forest
        )
    ]
)


# =========================================================
# 9. GRADIENT BOOSTING
# =========================================================

gradient_boosting = GradientBoostingRegressor(
    n_estimators=400,
    learning_rate=0.04,
    max_depth=4,
    min_samples_split=4,
    min_samples_leaf=2,
    loss="huber",
    random_state=RANDOM_STATE
)


gb_pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            gradient_boosting
        )
    ]
)


# =========================================================
# 10. EXTRA TREES
# =========================================================

extra_trees = ExtraTreesRegressor(
    n_estimators=500,
    max_depth=None,
    min_samples_split=3,
    min_samples_leaf=1,
    max_features=0.9,
    random_state=RANDOM_STATE,
    n_jobs=-1
)


extra_pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            extra_trees
        )
    ]
)


# =========================================================
# 11. TRAIN RANDOM FOREST
# =========================================================

print("\nTraining Random Forest...")

rf_pipeline.fit(
    X_train,
    y_train
)

print("Random Forest completed.")


# =========================================================
# 12. TRAIN GRADIENT BOOSTING
# =========================================================

print("\nTraining Gradient Boosting...")

gb_pipeline.fit(
    X_train,
    y_train
)

print("Gradient Boosting completed.")


# =========================================================
# 13. TRAIN EXTRA TREES
# =========================================================

print("\nTraining Extra Trees...")

extra_pipeline.fit(
    X_train,
    y_train
)

print("Extra Trees completed.")


# =========================================================
# 14. EVALUATION FUNCTION
# =========================================================

def evaluate_model(
    name,
    model,
    X_test,
    y_test
):

    predictions = model.predict(X_test)

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

    print("\n----------------------------------------------")
    print(name)
    print("----------------------------------------------")

    print(
        f"MAE  : {mae:.2f} kg CO2e"
    )

    print(
        f"RMSE : {rmse:.2f} kg CO2e"
    )

    print(
        f"R²   : {r2:.4f}"
    )

    return {
        "name": name,
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "predictions": predictions
    }


# =========================================================
# 15. EVALUATE ALL MODELS
# =========================================================

rf_results = evaluate_model(
    "Random Forest",
    rf_pipeline,
    X_test,
    y_test
)


gb_results = evaluate_model(
    "Gradient Boosting",
    gb_pipeline,
    X_test,
    y_test
)


extra_results = evaluate_model(
    "Extra Trees",
    extra_pipeline,
    X_test,
    y_test
)


# =========================================================
# 16. SELECT BEST MODEL
# =========================================================

all_results = [
    rf_results,
    gb_results,
    extra_results
]


best_result = min(
    all_results,
    key=lambda result: result["mae"]
)


if best_result["name"] == "Random Forest":

    best_model = rf_pipeline

elif best_result["name"] == "Gradient Boosting":

    best_model = gb_pipeline

else:

    best_model = extra_pipeline


# =========================================================
# 17. BEST MODEL
# =========================================================

print("\n==============================================")
print("             🏆 BEST MODEL V2")
print("==============================================")

print(
    "Model:",
    best_result["name"]
)

print(
    f"MAE  : {best_result['mae']:.2f} kg CO2e"
)

print(
    f"RMSE : {best_result['rmse']:.2f} kg CO2e"
)

print(
    f"R²   : {best_result['r2']:.4f}"
)


# =========================================================
# 18. 5-FOLD CROSS VALIDATION
# =========================================================

print("\n==============================================")
print("           5-FOLD CROSS VALIDATION")
print("==============================================")


cv_scores = cross_val_score(
    best_model,
    X_train,
    y_train,
    cv=5,
    scoring="r2",
    n_jobs=-1
)


for index, score in enumerate(
    cv_scores,
    start=1
):

    print(
        f"Fold {index}: {score:.4f}"
    )


print(
    f"\nMean CV R²: {cv_scores.mean():.4f}"
)

print(
    f"CV Std    : {cv_scores.std():.4f}"
)


# =========================================================
# 19. SAVE MODEL
# =========================================================

MODEL_FILE = "carbon_model_v2.joblib"

joblib.dump(
    best_model,
    MODEL_FILE
)


# =========================================================
# 20. SAVE PREDICTIONS
# =========================================================

predictions = best_model.predict(
    X_test
)


prediction_df = pd.DataFrame({

    "actual_carbon_kg": y_test.values,

    "predicted_carbon_kg": predictions,

    "error_kg": (
        y_test.values - predictions
    )

})


prediction_df.to_csv(
    "carbon_v2_predictions.csv",
    index=False
)


# =========================================================
# 21. SAVE MODEL METRICS
# =========================================================

metrics_df = pd.DataFrame({

    "model": [
        result["name"]
        for result in all_results
    ],

    "MAE": [
        result["mae"]
        for result in all_results
    ],

    "RMSE": [
        result["rmse"]
        for result in all_results
    ],

    "R2": [
        result["r2"]
        for result in all_results
    ]

})


metrics_df.to_csv(
    "carbon_v2_model_comparison.csv",
    index=False
)


# =========================================================
# 22. FINAL
# =========================================================

print("\n==============================================")
print("        🌱 GREENPLUS V2 MODEL READY")
print("==============================================")

print(
    f"Saved model    : {MODEL_FILE}"
)

print(
    "Saved test data: carbon_v2_predictions.csv"
)

print(
    "Saved metrics  : carbon_v2_model_comparison.csv"
)

print("\nTraining completed successfully! 🚀")