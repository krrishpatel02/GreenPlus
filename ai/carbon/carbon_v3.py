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

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)



# GREENPLUS CARBON AI - V3

DATASET = "carbonv3.csv"
MODEL_FILE = "carbon_model_v3.joblib"

RANDOM_STATE = 42


print("\n🌱 GREENPLUS CARBON AI - V3\n")



# 1. LOAD DATASET


df = pd.read_csv(DATASET)

print("\nDataset:")
print("Shape:", df.shape)

# 2. REMOVE DUPLICATES

duplicates = df.duplicated().sum()

df = df.drop_duplicates()

print("Duplicates removed:", duplicates)

# 3. TARGET

TARGET = "carbon_emission_kg"

df[TARGET] = pd.to_numeric(
    df[TARGET],
    errors="coerce"
)

df = df.dropna(
    subset=[TARGET]
)

# 4. FEATURES / TARGET

X = df.drop(
    columns=[TARGET]
)

y = df[TARGET]


print("\nTotal input features:", X.shape[1])

# 5. FEATURE TYPES

categorical_features = [
    "location_type",
    "climate_zone",
    "diet_type"
]

numeric_features = [
    column
    for column in X.columns
    if column not in categorical_features
]


print("Numeric features:", len(numeric_features))
print("Categorical features:", len(categorical_features))

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


categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="most_frequent"
            )
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

# 7. 80/20 SPLIT

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=RANDOM_STATE
)


print("\n80/20 TRAIN TEST\n")

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))

# 8. RANDOM FOREST

rf_model = RandomForestRegressor(
    n_estimators=500,
    max_depth=None,
    min_samples_split=4,
    min_samples_leaf=2,
    max_features=0.8,
    random_state=RANDOM_STATE,
    n_jobs=-1
)


rf_pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", rf_model)
    ]
)

# 9. GRADIENT BOOSTING

gb_model = GradientBoostingRegressor(
    n_estimators=500,
    learning_rate=0.035,
    max_depth=4,
    min_samples_split=4,
    min_samples_leaf=2,
    loss="huber",
    random_state=RANDOM_STATE
)


gb_pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", gb_model)
    ]
)

# 10. EXTRA TREES

extra_model = ExtraTreesRegressor(
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
        ("preprocessor", preprocessor),
        ("model", extra_model)
    ]
)

# 11. TRAIN MODELS

print("\nTraining Random Forest...")

rf_pipeline.fit(
    X_train,
    y_train
)

print("Random Forest completed.")


print("\nTraining Gradient Boosting...")

gb_pipeline.fit(
    X_train,
    y_train
)

print("Gradient Boosting completed.")


print("\nTraining Extra Trees...")

extra_pipeline.fit(
    X_train,
    y_train
)

print("Extra Trees completed.")

# 12. EVALUATION

def evaluate_model(
    name,
    model
):

    prediction = model.predict(
        X_test
    )

    mae = mean_absolute_error(
        y_test,
        prediction
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            prediction
        )
    )

    r2 = r2_score(
        y_test,
        prediction
    )

    print(f"\n{name}")

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
        "model": model,
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "prediction": prediction
    }


rf_result = evaluate_model(
    "Random Forest",
    rf_pipeline
)


gb_result = evaluate_model(
    "Gradient Boosting",
    gb_pipeline
)


extra_result = evaluate_model(
    "Extra Trees",
    extra_pipeline
)

# 13. SELECT BEST MODEL

results = [
    rf_result,
    gb_result,
    extra_result
]


best = max(
    results,
    key=lambda x: x["r2"]
)


print("\n🏆 BEST V3 MODEL\n")


print(
    "Model:",
    best["name"]
)

print(
    f"MAE  : {best['mae']:.2f} kg CO2e"
)

print(
    f"RMSE : {best['rmse']:.2f} kg CO2e"
)

print(
    f"R²   : {best['r2']:.4f}"
)

# 14. 5-FOLD CROSS VALIDATION

print("\n5-FOLD CV\n")


cv_scores = cross_val_score(
    best["model"],
    X_train,
    y_train,
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
    f"\nMean CV R²: {cv_scores.mean():.4f}"
)

print(
    f"CV Std    : {cv_scores.std():.4f}"
)

# 15. SAVE MODEL

joblib.dump(
    best["model"],
    MODEL_FILE
)

# 16. SAVE PREDICTIONS

prediction_df = pd.DataFrame({

    "actual_carbon_kg": y_test.values,

    "predicted_carbon_kg":
        best["prediction"],

    "error_kg":
        y_test.values -
        best["prediction"]

})


prediction_df.to_csv(
    "carbon_v3_predictions.csv",
    index=False
)

# 17. SAVE MODEL COMPARISON

comparison = pd.DataFrame({

    "Model": [
        result["name"]
        for result in results
    ],

    "MAE": [
        result["mae"]
        for result in results
    ],

    "RMSE": [
        result["rmse"]
        for result in results
    ],

    "R2": [
        result["r2"]
        for result in results
    ]

})


comparison.to_csv(
    "carbon_v3_model_comparison.csv",
    index=False
)

# 18. FINAL

print("\n🌱 GREENPLUS V3 MODEL READY\n")

print(
    "Saved model:",
    MODEL_FILE
)

print(
    "Saved predictions:",
    "carbon_v3_predictions.csv"
)

print(
    "Saved comparison:",
    "carbon_v3_model_comparison.csv"
)

print("\nTraining completed successfully! 🚀")