import pandas as pd
import joblib


# ==========================================
# 1. LOAD TRAINED MODEL
# ==========================================

model = joblib.load("carbon_model.joblib")

print("GreenPlus Carbon Model loaded successfully!")


# ==========================================
# 2. NEW GREENPLUS USER DATA
# ==========================================

user_data = {
    "electricity_kwh": 250,
    "petrol_liters": 20,
    "diesel_liters": 0,
    "car_km": 400,
    "bike_km": 200,
    "public_transport_km": 100,
    "flight_hours": 2,
    "waste_kg": 20,
    "recycling_percent": 60,
    "solar_kwh": 100,
    "household_size": 4,
    "diet_type": "mixed",
    "monthly_income": 50000
}


# ==========================================
# 3. CREATE DATAFRAME
# ==========================================

user_df = pd.DataFrame([user_data])


# ==========================================
# 4. CREATE SAME ENGINEERED FEATURES
#    USED DURING TRAINING
# ==========================================

user_df["total_transport_km"] = (
    user_df["car_km"].fillna(0)
    + user_df["bike_km"].fillna(0)
    + user_df["public_transport_km"].fillna(0)
)


user_df["total_fuel_liters"] = (
    user_df["petrol_liters"].fillna(0)
    + user_df["diesel_liters"].fillna(0)
)


user_df["renewable_energy_ratio"] = (
    user_df["solar_kwh"]
    / (user_df["electricity_kwh"] + 1)
)


user_df["electricity_per_person"] = (
    user_df["electricity_kwh"]
    / (user_df["household_size"] + 1)
)


user_df["waste_per_person"] = (
    user_df["waste_kg"]
    / (user_df["household_size"] + 1)
)


user_df["recycling_score"] = (
    user_df["recycling_percent"] / 100
)


user_df["solar_offset"] = (
    user_df["solar_kwh"] * 0.70
)


# ==========================================
# 5. PREDICT
# ==========================================

prediction = model.predict(user_df)

carbon = prediction[0]


# ==========================================
# 6. FOOTPRINT CATEGORY
# ==========================================

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


# ==========================================
# 7. DISPLAY RESULT
# ==========================================

print("\n========================================")
print("       🌱 GREENPLUS CARBON AI")
print("========================================")

print(
    f"\nEstimated Monthly Carbon:"
)

print(
    f"{carbon:.2f} kg CO₂e"
)

print(
    f"\nFootprint Category:"
)

print(
    f"{emoji} {category}"
)

print("\n========================================")


# ==========================================
# 8. INPUT SUMMARY
# ==========================================

print("\n📊 USER INPUT SUMMARY")

print("----------------------------------------")

print(
    f"Electricity      : "
    f"{user_data['electricity_kwh']} kWh"
)

print(
    f"Petrol           : "
    f"{user_data['petrol_liters']} L"
)

print(
    f"Diesel           : "
    f"{user_data['diesel_liters']} L"
)

print(
    f"Car              : "
    f"{user_data['car_km']} km"
)

print(
    f"Bike             : "
    f"{user_data['bike_km']} km"
)

print(
    f"Public Transport : "
    f"{user_data['public_transport_km']} km"
)

print(
    f"Flights          : "
    f"{user_data['flight_hours']} hours"
)

print(
    f"Waste            : "
    f"{user_data['waste_kg']} kg"
)

print(
    f"Recycling        : "
    f"{user_data['recycling_percent']}%"
)

print(
    f"Solar            : "
    f"{user_data['solar_kwh']} kWh"
)

print(
    f"Household        : "
    f"{user_data['household_size']} people"
)

print(
    f"Diet             : "
    f"{user_data['diet_type']}"
)


# ==========================================
# 9. BASIC RECOMMENDATIONS
# ==========================================

print("\n🌱 GREENPLUS RECOMMENDATIONS")

print("----------------------------------------")

recommendation_found = False


if user_data["electricity_kwh"] > 300:

    print(
        "⚡ Reduce electricity consumption."
    )

    recommendation_found = True


if user_data["car_km"] > 300:

    print(
        "🚗 Consider public transport, "
        "carpooling, or reducing car travel."
    )

    recommendation_found = True


if user_data["recycling_percent"] < 50:

    print(
        "♻️ Increase your recycling percentage."
    )

    recommendation_found = True


if user_data["solar_kwh"] < 100:

    print(
        "☀️ Consider increasing renewable "
        "or solar energy usage."
    )

    recommendation_found = True


if user_data["flight_hours"] > 5:

    print(
        "✈️ Reduce unnecessary air travel "
        "where possible."
    )

    recommendation_found = True


if user_data["waste_kg"] > 40:

    print(
        "🗑️ Try to reduce household waste."
    )

    recommendation_found = True


if not recommendation_found:

    print(
        "🌿 Great job! Your current inputs "
        "show several positive environmental habits."
    )


print("\n========================================")
print("GreenPlus Carbon AI test completed!")
print("========================================")