import pandas as pd
import joblib


# ============================================================
# LOAD MODEL
# ============================================================

MODEL_FILE = "carbon_model_v3.joblib"

model = joblib.load(
    MODEL_FILE
)

print("\nGreenPlus Carbon V3 Model loaded successfully!")


# ============================================================
# USER PROFILE
# ============================================================

user_data = {

    # Location / lifestyle
    "location_type": "urban",
    "climate_zone": "hot",

    "household_size": 4,

    "monthly_income": 50000,

    # Energy
    "electricity_kwh": 250,
    "natural_gas_kwh": 100,
    "lpg_kg": 8,
    "solar_kwh": 100,
    "renewable_energy_percent": 40,

    # Transport
    "car_km": 400,
    "car_fuel_efficiency": 15,

    "petrol_liters": 20,
    "diesel_liters": 0,

    "motorcycle_km": 200,

    "ev_km": 50,
    "ev_charging_kwh": 10,

    "public_transport_percent": 25,

    "bus_km": 100,
    "train_km": 50,

    "flight_hours": 3,
    "flight_distance_km": 2500,

    # Food
    "diet_type": "mixed",

    "beef_meals_month": 3,
    "dairy_servings_month": 20,

    "food_waste_kg": 8,

    "local_food_percent": 60,

    # Waste
    "total_waste_kg": 25,

    "recycled_waste_percent": 60,

    "composted_waste_percent": 20,

    "plastic_waste_kg": 5,

    "paper_waste_kg": 5,

    # Home
    "home_size_sqft": 1100,

    "ac_hours_month": 80,

    "heating_hours_month": 5,

    # Lifestyle
    "shopping_trips_month": 5,

    "clothing_items_month": 3,

    "electronics_items_year": 2,

    "tree_planting_year": 1
}


# ============================================================
# CREATE DATAFRAME
# ============================================================

user_df = pd.DataFrame(
    [user_data]
)


print("\n==============================================")
print("          USER INPUT")
print("==============================================")


print(
    "Location:",
    user_data["location_type"]
)

print(
    "Climate:",
    user_data["climate_zone"]
)

print(
    "Household:",
    user_data["household_size"]
)

print(
    "Diet:",
    user_data["diet_type"]
)


# ============================================================
# PREDICTION
# ============================================================

prediction = model.predict(
    user_df
)


carbon = float(
    prediction[0]
)


# ============================================================
# CARBON CATEGORY
# ============================================================

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


# ============================================================
# RESULT
# ============================================================

print("\n==============================================")
print("        🌱 GREENPLUS CARBON AI V3")
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


# ============================================================
# USER SUMMARY
# ============================================================

print("\n==============================================")
print("             DAILY LIFE SUMMARY")
print("==============================================")


print(
    f"⚡ Electricity : "
    f"{user_data['electricity_kwh']} kWh"
)

print(
    f"☀️ Solar       : "
    f"{user_data['solar_kwh']} kWh"
)

print(
    f"🚗 Car         : "
    f"{user_data['car_km']} km"
)

print(
    f"🏍️ Motorcycle  : "
    f"{user_data['motorcycle_km']} km"
)

print(
    f"🚌 Public      : "
    f"{user_data['public_transport_percent']}%"
)

print(
    f"✈️ Flights     : "
    f"{user_data['flight_distance_km']} km"
)

print(
    f"🍽️ Diet        : "
    f"{user_data['diet_type']}"
)

print(
    f"♻️ Recycling   : "
    f"{user_data['recycled_waste_percent']}%"
)

print(
    f"🏠 Home        : "
    f"{user_data['home_size_sqft']} sqft"
)


# ============================================================
# RECOMMENDATIONS
# ============================================================

print("\n==============================================")
print("       🌱 GREENPLUS RECOMMENDATIONS")
print("==============================================")


recommendations = []


if user_data["electricity_kwh"] > 300:

    recommendations.append(
        "⚡ Try reducing unnecessary electricity usage."
    )


if user_data["solar_kwh"] < 100:

    recommendations.append(
        "☀️ Consider increasing renewable energy usage."
    )


if user_data["car_km"] > 300:

    recommendations.append(
        "🚗 Reduce car travel, use carpooling, "
        "or combine multiple trips."
    )


if user_data["public_transport_percent"] < 30:

    recommendations.append(
        "🚌 Increase public transport usage where practical."
    )


if user_data["flight_distance_km"] > 3000:

    recommendations.append(
        "✈️ Consider reducing unnecessary flights."
    )


if user_data["food_waste_kg"] > 10:

    recommendations.append(
        "🍎 Reduce food waste through better meal planning."
    )


if user_data["recycled_waste_percent"] < 50:

    recommendations.append(
        "♻️ Increase recycling and waste separation."
    )


if user_data["beef_meals_month"] > 5:

    recommendations.append(
        "🥩 Reducing high-emission meat consumption "
        "can lower your footprint."
    )


if user_data["tree_planting_year"] == 0:

    recommendations.append(
        "🌳 Consider planting trees or supporting "
        "verified restoration projects."
    )


if len(recommendations) == 0:

    recommendations.append(
        "🌿 Great job! Your lifestyle already "
        "contains several lower-carbon choices."
    )


for recommendation in recommendations:

    print(
        "\n" + recommendation
    )


# ============================================================
# FINAL
# ============================================================

print("\n==============================================")
print("       GreenPlus V3 Test Complete 🌱")
print("==============================================")