from pathlib import Path
import sys

import joblib
import numpy as np
import pandas as pd

from ..config import ROOT_DIR

ENERGY_DIR = ROOT_DIR / "ai" / "energy"
sys.path.insert(0, str(ENERGY_DIR))
from energy_calculator import greenplus_energy_analysis  # noqa: E402


class PredictionService:
    def __init__(self):
        ai_dir = ROOT_DIR / "ai"
        self.carbon_model, self.carbon_error = self._load(ai_dir / "carbon" / "carbon_model_v3.joblib")
        self.energy_model, self.energy_error = self._load(ai_dir / "energy" / "energy_model_v2.joblib")

    @staticmethod
    def _load(path):
        if not path.exists():
            return None, f"Model file not found: {path.name}"
        try:
            return joblib.load(path), None
        except Exception as exc:
            return None, f"Model could not be loaded: {type(exc).__name__}"

    @staticmethod
    def number(payload, name, default=None, integer=False, minimum=None):
        value = payload.get(name, default)
        if value is None or isinstance(value, bool):
            raise ValueError(f"'{name}' is required and must be numeric.")
        try:
            value = int(value) if integer else float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"'{name}' must be numeric.") from exc
        if minimum is not None and value < minimum:
            raise ValueError(f"'{name}' must be at least {minimum}.")
        return value

    def carbon_features(self, payload):
        commute = payload.get("commute", "Car")
        recycling = payload.get("recycling", "Sometimes")
        source = payload.get("energy_source", "Mixed Grid")
        commute_km = {"Car": 15, "SUV": 20, "Public Transit": 5, "EV/Bicycle": 2}
        recycle_pct = {"Always": 80, "Sometimes": 40, "Never": 0}
        renewable_pct = {"Solar/Renewables": 90, "Mixed Grid": 40, "Coal/Fossil Fuel Grid": 5}
        n = self.number
        return {
            "location_type": payload.get("location_type", "urban"), "climate_zone": payload.get("climate_zone", "temperate"),
            "household_size": n(payload, "household_size", 3, True, 1), "monthly_income": n(payload, "monthly_income", 50000, minimum=0),
            "electricity_kwh": n(payload, "monthly_kwh", 250, minimum=0), "natural_gas_kwh": n(payload, "natural_gas_kwh", 0, minimum=0),
            "lpg_kg": n(payload, "lpg_kg", 0, minimum=0), "solar_kwh": n(payload, "solar_kwh", 0, minimum=0),
            "renewable_energy_percent": n(payload, "renewable_energy_percent", renewable_pct.get(source, 40), minimum=0),
            "car_km": n(payload, "car_km", commute_km.get(commute, 15), minimum=0), "car_fuel_efficiency": n(payload, "car_fuel_efficiency", 15, minimum=0),
            "petrol_liters": n(payload, "petrol_liters", 0, minimum=0), "diesel_liters": n(payload, "diesel_liters", 0, minimum=0),
            "motorcycle_km": n(payload, "motorcycle_km", 0, minimum=0), "ev_km": n(payload, "ev_km", 0, minimum=0),
            "ev_charging_kwh": n(payload, "ev_charging_kwh", 0, minimum=0), "public_transport_percent": n(payload, "public_transport_percent", 0, minimum=0),
            "bus_km": n(payload, "bus_km", 0, minimum=0), "train_km": n(payload, "train_km", 0, minimum=0),
            "flight_hours": n(payload, "flight_hours", 0, minimum=0), "flight_distance_km": n(payload, "flight_distance_km", 0, minimum=0),
            "diet_type": payload.get("diet_type", "mixed"), "beef_meals_month": n(payload, "beef_meals_month", 3, minimum=0),
            "dairy_servings_month": n(payload, "dairy_servings_month", 20, minimum=0), "food_waste_kg": n(payload, "food_waste_kg", 8, minimum=0),
            "local_food_percent": n(payload, "local_food_percent", 60, minimum=0), "total_waste_kg": n(payload, "total_waste_kg", 25, minimum=0),
            "recycled_waste_percent": n(payload, "recycled_waste_percent", recycle_pct.get(recycling, 40), minimum=0), "composted_waste_percent": n(payload, "composted_waste_percent", 0, minimum=0),
            "plastic_waste_kg": n(payload, "plastic_waste_kg", 5, minimum=0), "paper_waste_kg": n(payload, "paper_waste_kg", 5, minimum=0),
            "home_size_sqft": n(payload, "home_size_sqft", 1100, minimum=1), "ac_hours_month": n(payload, "ac_hours_month", 80, minimum=0),
            "heating_hours_month": n(payload, "heating_hours_month", 5, minimum=0), "shopping_trips_month": n(payload, "shopping_trips_month", 5, minimum=0),
            "clothing_items_month": n(payload, "clothing_items_month", 3, minimum=0), "electronics_items_year": n(payload, "electronics_items_year", 2, minimum=0),
            "tree_planting_year": n(payload, "tree_planting_year", 1, minimum=0),
        }

    def energy_features(self, payload):
        n = self.number
        hour, day = n(payload, "hour", 14, True, 0), n(payload, "day_of_week", 2, True, 0)
        if hour > 23 or day > 6:
            raise ValueError("'hour' must be 0-23 and 'day_of_week' must be 0-6.")
        temp, humidity = n(payload, "temp_out", 22.0), n(payload, "humidity_out", 50.0, minimum=0)
        values = {name: 0.0 for name in self.energy_model.feature_names_in_}
        values.update({"lights": n(payload, "lights", 0, minimum=0), "T1": 21, "RH_1": 45, "T2": 20.5, "RH_2": 44, "T3": 22.1, "RH_3": 44, "T4": 21, "RH_4": 44, "T5": 21, "RH_5": 45, "T6": temp, "RH_6": humidity, "T7": 21, "RH_7": 45, "T8": 21, "RH_8": 45, "T9": 21, "RH_9": 45, "T_out": temp, "RH_out": humidity, "hour": hour, "day_of_week": day, "month": n(payload, "month", 7, True, 1), "day": n(payload, "day", 15, True, 1), "is_weekend": n(payload, "is_weekend", int(day >= 5), True, 0), "is_working_hour": int(9 <= hour <= 18), "is_morning": int(6 <= hour < 12), "is_afternoon": int(12 <= hour < 18), "is_evening": int(18 <= hour < 23), "is_night": int(hour >= 23 or hour < 6), "hour_sin": np.sin(2 * np.pi * hour / 24), "hour_cos": np.cos(2 * np.pi * hour / 24), "day_sin": np.sin(2 * np.pi * day / 7), "day_cos": np.cos(2 * np.pi * day / 7), "month_sin": np.sin(2 * np.pi * 7 / 12), "month_cos": np.cos(2 * np.pi * 7 / 12), "T1_Tout_difference": 21 - temp, "T2_Tout_difference": 20.5 - temp, "T3_Tout_difference": 22.1 - temp, "RH1_RHout_difference": 45 - humidity, "RH2_RHout_difference": 44 - humidity, "outdoor_heat_humidity": temp * humidity, "indoor_heat_humidity": 945, "temperature_mean": 21.2, "temperature_min": 20.5, "temperature_max": 22.1, "temperature_range": 1.6, "humidity_mean": 44.5, "humidity_min": 44, "humidity_max": 45, "humidity_range": 1})
        return values

    def status(self):
        return {"carbon": {"available": self.carbon_model is not None, "error": self.carbon_error}, "energy": {"available": self.energy_model is not None, "error": self.energy_error}}

    def carbon(self, payload):
        if self.carbon_model is None:
            raise RuntimeError(f"Carbon prediction is unavailable. {self.carbon_error}")
        return round(float(self.carbon_model.predict(pd.DataFrame([self.carbon_features(payload)]))[0]), 2)

    def energy(self, payload):
        if self.energy_model is None:
            raise RuntimeError(f"Energy prediction is unavailable. {self.energy_error}")
        value = float(self.energy_model.predict(pd.DataFrame([self.energy_features(payload)]))[0])
        return {"appliances_wh": round(value, 2), "appliances_kwh": round(value / 1000, 3)}

    def analyze_energy(self, payload):
        return greenplus_energy_analysis(appliances=payload["appliances"], solar_kwh=self.number(payload, "solar_kwh", 0, minimum=0), household_size=self.number(payload, "household_size", integer=True, minimum=1), home_area_sqft=self.number(payload, "home_area_sqft", minimum=1), tariff_id=payload.get("tariff_id", "demo_residential"), emission_factor=self.number(payload, "emission_factor", 0.7, minimum=0))
