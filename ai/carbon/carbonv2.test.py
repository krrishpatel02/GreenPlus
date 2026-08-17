import pandas as pd
import joblib


# =========================================================
# 1. LOAD MODEL
# =========================================================

MODEL_FILE = "carbon_model_v2.joblib"

model = joblib.load(
    MODEL_FILE
)

print("\nGreenPlus Carbon V2 Model loaded successfully!")


# =========================================================
# 2. USER INPUT
# =========================================================

user_data = {

    "electricity_kwh": 250,

    "natural_gas_kwh": 100,

    "lpg_kg": 8,

    "solar_kwh": 100,

    "renewable_energy_percent": 40,

    "car_km": 400,

    "car_fuel_efficiency": 15,

    "petrol_liters": 20,

    "diesel_liters": 0,

    "motorcycle_km": 200,

    "ev_km": 50,

    "ev_charging_kwh": 20,

    "bus_km": 100,

    "train_km": 50,

    "flight_hours": 2,

    "flight_distance_km": 2500,

    "beef_meals_month": 3,

    "dairy_servings_month": 20,

    "food_waste_kg": 10,

    "local_food_percent": 60,

    "total_waste_kg": 25,

    "recycled_waste_percent": 60,

    "composted_waste_percent": 20,

    "plastic_waste_kg": 5,

    "paper_waste_kg": 5,

    "home_size_sqft": 1100,

    "ac_hours_month": 80,

    "heating_hours_month": 10,

    "shopping_trips_month": 5,

    "clothing_items_month": 3,

    "electronics_items_year": 2,

    "tree_planting_year": 1,

    "public_transport_percent": 25,

    "household_size": 4,

    "monthly_income": 50000,

    "diet_type": "mixed"
}


# =========================================================
# 3. CREATE DATAFRAME
# =========================================================

user_df = pd.DataFrame(
    [user_data]
)


# =========================================================
# 4. CHECK COLUMNS
# =========================================================

print("\nInput features:", len(user_df.columns))


# =========================================================
# 5. PREDICTION
# =========================================================

prediction = model.predict(
    user_df
)

carbon = float(
    prediction[0]
)


# =========================================================
# 6. CATEGORY
# =========================================================

if carbon < 300:

    category = "Low"
    emoji = "🟢"

elif carbon < 600:

    category = "Moderate"
    emoji = "🟡"

elif carbon < 1000:

    category = "High"
    emoji = "🟠"

else:

    category = "Very High"
    emoji = "🔴"


# =========================================================
# 7. DISPLAY RESULT
# =========================================================

print("\n==============================================")
print("        🌱 GREENPLUS CARBON AI V2")
print("==============================================")

print(
    "\nEstimated Monthly Carbon:"
)

print(
    f"{carbon:.2f} kg CO₂e"
)

print(
    "\nFootprint Category:"
)

print(
    f"{emoji} {category}"
)


# =========================================================
# 8. USER PROFILE
# =========================================================

print("\n==============================================")
print("             USER PROFILE")
print("==============================================")

print(
    f"Household size : {user_data['household_size']}"
)

print(
    f"Diet           : {user_data['diet_type']}"
)

print(
    f"Electricity    : {user_data['electricity_kwh']} kWh"
)

print(
    f"Solar          : {user_data['solar_kwh']} kWh"
)

print(
    f"Car distance   : {user_data['car_km']} km"
)

print(
    f"Flight distance: {user_data['flight_distance_km']} km"
)

print(
    f"Recycling      : {user_data['recycled_waste_percent']}%"
)

print(
    f"Public transport: "
    f"{user_data['public_transport_percent']}%"
)


# =========================================================
# 9. RECOMMENDATIONS
# =========================================================

print("\n==============================================")
print("       🌱 GREENPLUS RECOMMENDATIONS")
print("==============================================")


recommendations = []


if user_data["electricity_kwh"] > 300:

    recommendations.append(
        "⚡ Reduce electricity consumption."
    )


if user_data["solar_kwh"] < 100:

    recommendations.append(
        "☀️ Increase solar or renewable energy usage."
    )


if user_data["car_km"] > 300:

    recommendations.append(
        "🚗 Reduce private car travel or use carpooling."
    )


if user_data["public_transport_percent"] < 30:

    recommendations.append(
        "🚌 Increase public transportation usage."
    )


if user_data["flight_distance_km"] > 3000:

    recommendations.append(
        "✈️ Reduce unnecessary long-distance flights."
    )


if user_data["recycled_waste_percent"] < 50:

    recommendations.append(
        "♻️ Improve household recycling."
    )


if user_data["food_waste_kg"] > 10:

    recommendations.append(
        "🍎 Reduce food waste."
    )


if user_data["beef_meals_month"] > 5:

    recommendations.append(
        "🥩 Consider reducing high-emission meat consumption."
    )


if user_data["tree_planting_year"] == 0:

    recommendations.append(
        "🌳 Consider planting or supporting trees."
    )


if len(recommendations) == 0:

    recommendations.append(
        "🌿 Excellent! Your lifestyle already contains several low-carbon habits."
    )


for recommendation in recommendations:

    print(
        "\n" + recommendation
    )


# =========================================================
# 10. FINAL
# =========================================================

print("\n==============================================")
print("      GreenPlus Carbon V2 Test Complete")
print("==============================================")