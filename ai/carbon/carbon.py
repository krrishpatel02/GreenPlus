import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# =========================================================
# 1. CONFIGURATION
# =========================================================

RANDOM_STATE = 42
TEST_SIZE = 0.20


# =========================================================
# 2. LOAD DATASET
# =========================================================

df = pd.read_csv("carbon.csv")

print("\n======================================")
print("      GREENPLUS CARBON ML")
print("======================================")

print("\nDataset shape:", df.shape)


# =========================================================
# 3. BASIC DATA CLEANING
# =========================================================

# Remove duplicate rows
before = len(df)

df = df.drop_duplicates()

after = len(df)

print(f"Duplicates removed: {before - after}")


# Make sure target is numeric
df["carbon_emission_kg"] = pd.to_numeric(
    df["carbon_emission_kg"],
    errors="coerce"
)

# Remove rows where target is missing
df = df.dropna(
    subset=["carbon_emission_kg"]
)


# =========================================================
# 4. FEATURE ENGINEERING
# =========================================================

print("\nCreating engineered features...")


# Total transportation distance
df["total_transport_km"] = (
    df["car_km"].fillna(0)
    + df["bike_km"].fillna(0)
    + df["public_transport_km"].fillna(0)
)


# Total fuel
df["total_fuel_liters"] = (
    df["petrol_liters"].fillna(0)
    + df["diesel_liters"].fillna(0)
)


# Renewable energy ratio
df["renewable_energy_ratio"] = (
    df["solar_kwh"]
    / (df["electricity_kwh"] + 1)
)


# Electricity per household member
df["electricity_per_person"] = (
    df["electricity_kwh"]
    / (df["household_size"] + 1)
)


# Waste per person
df["waste_per_person"] = (
    df["waste_kg"]
    / (df["household_size"] + 1)
)


# Recycling score
df["recycling_score"] = (
    df["recycling_percent"] / 100
)


# Solar offset
df["solar_offset"] = (
    df["solar_kwh"] * 0.70
)


# =========================================================
# 5. FEATURES AND TARGET
# =========================================================

X = df.drop(
    "carbon_emission_kg",
    axis=1
)

y = df["carbon_emission_kg"]


# =========================================================
# 6. COLUMN TYPES
# =========================================================

categorical_features = [
    "diet_type"
]

numeric_features = [
    "electricity_kwh",
    "petrol_liters",
    "diesel_liters",
    "car_km",
    "bike_km",
    "public_transport_km",
    "flight_hours",
    "waste_kg",
    "recycling_percent",
    "solar_kwh",
    "household_size",
    "monthly_income",

    # Engineered features
    "total_transport_km",
    "total_fuel_liters",
    "renewable_energy_ratio",
    "electricity_per_person",
    "waste_per_person",
    "recycling_score",
    "solar_offset"
]


# =========================================================
# 7. PREPROCESSING
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
# 8. 80/20 TRAIN TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE
)


print("\n======================================")
print("        80/20 TRAIN TEST SPLIT")
print("======================================")

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


# =========================================================
# 9. RANDOM FOREST
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
# 10. GRADIENT BOOSTING
# =========================================================

gradient_boosting = GradientBoostingRegressor(
    n_estimators=300,
    learning_rate=0.05,
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
# 13. PREDICTIONS
# =========================================================

rf_pred = rf_pipeline.predict(
    X_test
)

gb_pred = gb_pipeline.predict(
    X_test
)


# =========================================================
# 14. EVALUATION FUNCTION
# =========================================================

def evaluate_model(
    name,
    actual,
    predicted
):

    mae = mean_absolute_error(
        actual,
        predicted
    )

    rmse = np.sqrt(
        mean_squared_error(
            actual,
            predicted
        )
    )

    r2 = r2_score(
        actual,
        predicted
    )

    print("\n--------------------------------------")
    print(name)
    print("--------------------------------------")

    print(f"MAE  : {mae:.2f} kg CO2e")
    print(f"RMSE : {rmse:.2f} kg CO2e")
    print(f"R²   : {r2:.4f}")

    return mae, rmse, r2


# =========================================================
# 15. EVALUATE MODELS
# =========================================================

rf_results = evaluate_model(
    "Random Forest",
    y_test,
    rf_pred
)


gb_results = evaluate_model(
    "Gradient Boosting",
    y_test,
    gb_pred
)


# =========================================================
# 16. SELECT BEST MODEL
# =========================================================

if rf_results[0] <= gb_results[0]:

    best_model = rf_pipeline
    best_name = "Random Forest"
    best_results = rf_results

else:

    best_model = gb_pipeline
    best_name = "Gradient Boosting"
    best_results = gb_results


print("\n======================================")
print("          BEST MODEL")
print("======================================")

print("Model:", best_name)

print(f"MAE  : {best_results[0]:.2f}")

print(f"RMSE : {best_results[1]:.2f}")

print(f"R²   : {best_results[2]:.4f}")


# =========================================================
# 17. CROSS VALIDATION
# =========================================================

print("\n======================================")
print("       5-FOLD CROSS VALIDATION")
print("======================================")

cv_scores = cross_val_score(
    best_model,
    X_train,
    y_train,
    cv=5,
    scoring="r2",
    n_jobs=-1
)

print("Fold R² scores:")

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
    f"CV Std: {cv_scores.std():.4f}"
)


# =========================================================
# 18. SAVE MODEL
# =========================================================

joblib.dump(
    best_model,
    "carbon_model.joblib"
)


# =========================================================
# 19. SAVE TEST RESULTS
# =========================================================

results = pd.DataFrame({
    "actual_carbon": y_test.values,
    "predicted_carbon": best_model.predict(X_test)
})

results.to_csv(
    "carbon_predictions.csv",
    index=False
)


# =========================================================
# 20. FINAL OUTPUT
# =========================================================

print("\n======================================")
print("       GREENPLUS MODEL READY")
print("======================================")

print(
    "Saved model: carbon_model.joblib"
)

print(
    "Saved predictions: carbon_predictions.csv"
)

print("\nTraining completed successfully!")