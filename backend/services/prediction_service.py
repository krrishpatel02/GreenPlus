import math

import numpy as np
import pandas as pd
from json import load
from urllib.parse import urlencode
from urllib.request import urlopen

from ..config import OPEN_METEO_BASE_URL, ROOT_DIR
from .energy_engine import analyze as analyze_energy_engine
from .model_loader import LazyModel
from .model_registry import decision


class PredictionService:
    def __init__(self):
        ai_dir = ROOT_DIR / "ai"
        self.carbon_model = LazyModel(ai_dir / "carbon" / "carbon_model_v3.joblib")
        self.energy_model = LazyModel(ai_dir / "energy" / "energy_model_v2.joblib")
        self.realtime_model = LazyModel(ai_dir / "realtime" / "realtime_solar_model.joblib")
        self.air_quality_model = LazyModel(ai_dir / "air_quality" / "air_quality_model.joblib")
        self.rainfall_model = LazyModel(ai_dir / "rainfall" / "rainfall_model.joblib")
        self.temperature_model = LazyModel(ai_dir / "temperature" / "temperature_model.joblib")
        self.uv_index_model = LazyModel(ai_dir / "uv_index" / "uv_index_model.joblib")
        self.wind_model = LazyModel(ai_dir / "wind" / "wind_model.joblib")
        self.water_model = LazyModel(ai_dir / "water" / "water_consumption_model.joblib")
        self.action_model = LazyModel(ai_dir / "recommendations" / "green_action_model.joblib")
        self.advice_model = LazyModel(ai_dir / "recommendations" / "eco_advice_model.joblib")
        self.rio_trio_model = LazyModel(ai_dir / "rio_trio" / "rio_trio_model.joblib")
        self.methane_model = LazyModel(ai_dir / "methane" / "methane_model.joblib")
        self.realtime_metrics_file = ai_dir / "realtime" / "realtime_model_metrics.json"
        self.uv_index_metrics_file = ai_dir / "uv_index" / "uv_index_model_metrics.json"
        self.wind_metrics_file = ai_dir / "wind" / "wind_model_metrics.json"
        self.water_metrics_file = ai_dir / "water" / "water_model_metrics.json"
        self.recommendation_metrics_file = ai_dir / "recommendations" / "recommendation_model_metrics.json"
        self.rio_trio_metrics_file = ai_dir / "rio_trio" / "rio_trio_model_metrics.json"
        self.methane_metrics_file = ai_dir / "methane" / "methane_model_metrics.json"

    @staticmethod
    def number(payload, name, default=None, integer=False, minimum=None):
        value = payload.get(name, default)
        if value is None or isinstance(value, bool):
            raise ValueError(f"'{name}' is required and must be numeric.")
        try:
            value = int(value) if integer else float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"'{name}' must be numeric.") from exc
        if not math.isfinite(value):
            raise ValueError(f"'{name}' must be finite.")
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
        model = self.energy_model.model
        if model is None:
            raise RuntimeError(f"Energy prediction is unavailable. {self.energy_model.error}")
        values = {name: 0.0 for name in model.feature_names_in_}
        values.update({"lights": n(payload, "lights", 0, minimum=0), "T1": 21, "RH_1": 45, "T2": 20.5, "RH_2": 44, "T3": 22.1, "RH_3": 44, "T4": 21, "RH_4": 44, "T5": 21, "RH_5": 45, "T6": temp, "RH_6": humidity, "T7": 21, "RH_7": 45, "T8": 21, "RH_8": 45, "T9": 21, "RH_9": 45, "T_out": temp, "RH_out": humidity, "hour": hour, "day_of_week": day, "month": n(payload, "month", 7, True, 1), "day": n(payload, "day", 15, True, 1), "is_weekend": n(payload, "is_weekend", int(day >= 5), True, 0), "is_working_hour": int(9 <= hour <= 18), "is_morning": int(6 <= hour < 12), "is_afternoon": int(12 <= hour < 18), "is_evening": int(18 <= hour < 23), "is_night": int(hour >= 23 or hour < 6), "hour_sin": np.sin(2 * np.pi * hour / 24), "hour_cos": np.cos(2 * np.pi * hour / 24), "day_sin": np.sin(2 * np.pi * day / 7), "day_cos": np.cos(2 * np.pi * day / 7), "month_sin": np.sin(2 * np.pi * 7 / 12), "month_cos": np.cos(2 * np.pi * 7 / 12), "T1_Tout_difference": 21 - temp, "T2_Tout_difference": 20.5 - temp, "T3_Tout_difference": 22.1 - temp, "RH1_RHout_difference": 45 - humidity, "RH2_RHout_difference": 44 - humidity, "outdoor_heat_humidity": temp * humidity, "indoor_heat_humidity": 945, "temperature_mean": 21.2, "temperature_min": 20.5, "temperature_max": 22.1, "temperature_range": 1.6, "humidity_mean": 44.5, "humidity_min": 44, "humidity_max": 45, "humidity_range": 1})
        return values

    def status(self):
        ai_dir = ROOT_DIR / "ai"
        uv_metrics = self.model_metrics(self.uv_index_metrics_file)
        wind_metrics = self.model_metrics(self.wind_metrics_file)
        return {
            "carbon": {"available": self.carbon_model.available, "error": self.carbon_model.error},
            "energy": {"available": self.energy_model.available, "error": self.energy_model.error},
            "realtime": {"available": self.realtime_model.available, "error": self.realtime_model.error, "metrics": self.realtime_metrics()},
            "air_quality": {"available": self.air_quality_model.available, "error": self.air_quality_model.error, "metrics": self.model_metrics(ai_dir / "air_quality" / "air_quality_model_metrics.json")},
            "rainfall": {"available": self.rainfall_model.available, "error": self.rainfall_model.error, "metrics": self.model_metrics(ai_dir / "rainfall" / "rainfall_model_metrics.json")},
            "temperature": {"available": self.temperature_model.available, "error": self.temperature_model.error, "metrics": self.model_metrics(ai_dir / "temperature" / "temperature_model_metrics.json")},
            "uv_index": {**decision("uv_index", uv_metrics), "available": self.uv_index_model.available and decision("uv_index", uv_metrics)["status"] == "VALIDATED", "error": self.uv_index_model.error, "metrics": uv_metrics},
            "wind": {**decision("wind", wind_metrics), "available": self.wind_model.available and decision("wind", wind_metrics)["status"] == "VALIDATED", "error": self.wind_model.error, "metrics": wind_metrics},
            "water": {"available": self.water_model.available, "error": self.water_model.error, "metrics": self.model_metrics(self.water_metrics_file)},
            "green_action": {"available": self.action_model.available, "error": self.action_model.error, "metrics": self.model_metrics(self.recommendation_metrics_file).get("green_action", {})},
            "eco_advice": {"available": self.advice_model.available, "error": self.advice_model.error, "metrics": self.model_metrics(self.recommendation_metrics_file).get("eco_advice", {})},
            "rio_trio": {**decision("rio_trio", self.model_metrics(self.rio_trio_metrics_file)), "available": False, "error": self.rio_trio_model.error, "metrics": self.model_metrics(self.rio_trio_metrics_file)},
            "methane": {"available": self.methane_model.available, "error": self.methane_model.error, "metrics": self.model_metrics(self.methane_metrics_file)},
        }

    def realtime_metrics(self):
        return self.model_metrics(self.realtime_metrics_file)

    @staticmethod
    def model_metrics(metrics_file):
        if not metrics_file.exists():
            return {"available": False, "error": f"Model metrics have not been generated: {metrics_file.name}"}
        try:
            with metrics_file.open(encoding="utf-8") as file:
                return load(file)
        except (OSError, ValueError) as exc:
            return {"available": False, "error": f"Could not read model metrics: {exc}"}

    def carbon(self, payload):
        model = self.carbon_model.model
        if model is None:
            raise RuntimeError(f"Carbon prediction is unavailable. {self.carbon_model.error}")
        return round(float(model.predict(pd.DataFrame([self.carbon_features(payload)]))[0]), 2)

    def energy(self, payload):
        model = self.energy_model.model
        if model is None:
            raise RuntimeError(f"Energy prediction is unavailable. {self.energy_model.error}")
        value = float(model.predict(pd.DataFrame([self.energy_features(payload)]))[0])
        return {"appliances_wh": round(value, 2), "appliances_kwh": round(value / 1000, 3)}

    def water(self, payload):
        household_size = self.number(payload, "household_size", 3, integer=True, minimum=1)
        showers = self.number(payload, "showers_per_day", 1, integer=True, minimum=0)
        shower_minutes = self.number(payload, "shower_minutes", 8, minimum=0)
        flushes = self.number(payload, "toilet_flushes", 5, integer=True, minimum=0)
        laundry_loads = self.number(payload, "laundry_loads_week", 4, minimum=0)
        outdoor_liters = self.number(payload, "outdoor_liters_day", 20, minimum=0)
        model_bundle = self.water_model.model
        if model_bundle is None:
            raise RuntimeError(f"Water prediction is unavailable. {self.water_model.error}")
        features = pd.DataFrame([{
            "Bathroom_Liters": household_size * (showers * shower_minutes * 9 + flushes * 6),
            "Kitchen_Liters": household_size * 47,
            "Laundry_Liters": laundry_loads * 55 / 7,
            "Gardening_Liters": outdoor_liters,
        }], columns=model_bundle["features"])
        daily_liters = max(0, float(model_bundle["model"].predict(features)[0]))
        baseline = household_size * 135
        saving = max(0, baseline - daily_liters)
        return {
            "daily_liters": round(daily_liters, 2),
            "weekly_liters": round(daily_liters * 7, 2),
            "estimated_daily_saving_liters": round(saving, 2),
            "method": "Kaggle-trained household water regression",
            "model": "water_consumption_model",
            "recommendation": "Shorten showers and check for leaks." if saving < 0 else "Keep logging water-saving activities.",
        }

    def recommendation_features(self, payload):
        energy = self.number(payload, "monthly_kwh", 250, minimum=0)
        water = self.number(payload, "daily_water_liters", 400, minimum=0)
        car_km = self.number(payload, "monthly_car_km", 300, minimum=0)
        solar_percent = self.number(payload, "solar_percent", 0, minimum=0)
        if solar_percent > 100:
            raise ValueError("'solar_percent' must be at most 100.")
        compost = self.number(payload, "compost_kg_week", 0, minimum=0)
        return pd.DataFrame([{
            "day_type": "Weekday",
            "transport_mode": "Car" if car_km > 0 else "Walk",
            "distance_km": car_km / 30,
            "electricity_kwh": energy / 30,
            "renewable_usage_pct": solar_percent,
            "food_type": "Mixed",
            "screen_time_hours": 3.0,
            "waste_generated_kg": max(0, 2.5 - compost * 0.1),
        }])

    def recommendation_candidates(self, payload):
        energy = self.number(payload, "monthly_kwh", 250, minimum=0)
        water = self.number(payload, "daily_water_liters", 400, minimum=0)
        car_km = self.number(payload, "monthly_car_km", 300, minimum=0)
        solar_percent = self.number(payload, "solar_percent", 0, minimum=0)
        compost = self.number(payload, "compost_kg_week", 0, minimum=0)
        return [
            {"action": "Reduce standby and cooling use", "reason": f"Monthly electricity is {energy:.0f} kWh.", "priority": energy / 250, "impact": "energy and carbon", "difficulty": "Easy"},
            {"action": "Use public transport or combine trips", "reason": f"Monthly car travel is {car_km:.0f} km.", "priority": car_km / 300, "impact": "transport carbon", "difficulty": "Medium"},
            {"action": "Shorten showers and check fixtures", "reason": f"Estimated water use is {water:.0f} L/day.", "priority": water / 400, "impact": "water demand", "difficulty": "Easy"},
            {"action": "Increase solar utilization", "reason": f"Current solar share is {solar_percent:.0f}%.", "priority": max(0, (100 - solar_percent) / 100), "impact": "grid emissions", "difficulty": "Medium"},
            {"action": "Compost more food waste", "reason": f"Current composting is {compost:.1f} kg/week.", "priority": max(0, 1 - compost / 5), "impact": "methane avoidance", "difficulty": "Easy"},
        ]

    def green_actions(self, payload):
        model_bundle = self.action_model.model
        if model_bundle is None:
            raise RuntimeError(f"Green-action prediction is unavailable. {self.action_model.error}")
        predicted_opportunity = float(np.clip(model_bundle["model"].predict(self.recommendation_features(payload))[0], 0, 1))
        opportunity_factor = 1 + predicted_opportunity / 4
        candidates = self.recommendation_candidates(payload)
        for candidate in candidates:
            candidate["priority"] *= opportunity_factor
        return {
            "actions": sorted(candidates, key=lambda item: item["priority"], reverse=True)[:3],
            "predicted_action_opportunity": round(predicted_opportunity, 2),
            "method": "Kaggle-trained action propensity plus transparent impact ranking",
            "model_available": True,
        }

    def eco_advice(self, payload):
        model_bundle = self.advice_model.model
        if model_bundle is None:
            raise RuntimeError(f"Personalized eco-advice is unavailable. {self.advice_model.error}")
        features = self.recommendation_features(payload)
        impact_level = str(model_bundle["model"].predict(features)[0])
        impact_factor = {"High": 1.3, "Medium": 1.0, "Low": 0.8}.get(impact_level, 1.0)
        candidates = self.recommendation_candidates(payload)
        for candidate in candidates:
            candidate["priority"] *= impact_factor
        selected = sorted(candidates, key=lambda item: item["priority"], reverse=True)[:3]
        strongest_priority = max((action["priority"] for action in selected), default=1)
        recommendations = [{**action, "score": round(action["priority"] / strongest_priority * 100, 1)} for action in selected]
        return {
            "recommendations": recommendations,
            "predicted_impact_level": impact_level,
            "method": "Kaggle-trained impact classification plus explainable relevance ranking",
            "model_available": True,
        }

    def rio_trio_features(self, payload):
        energy = self.number(payload, "monthly_kwh", 250, minimum=0)
        car_km = self.number(payload, "monthly_car_km", 300, minimum=0)
        solar_percent = self.number(payload, "solar_percent", 0, minimum=0)
        if solar_percent > 100:
            raise ValueError("'solar_percent' must be at most 100.")
        compost = self.number(payload, "compost_kg_week", 0, minimum=0)
        return pd.DataFrame([{
            "transport_mode": "Car" if car_km > 0 else "Walk",
            "distance_km": car_km / 30,
            "electricity_kwh": energy / 30,
            "renewable_usage_pct": solar_percent,
            "food_type": payload.get("food_type", "Mixed"),
            "waste_generated_kg": max(0, 2.5 - compost * 0.1),
        }])

    def rio_trio(self, payload):
        registry = decision("rio_trio", self.model_metrics(self.rio_trio_metrics_file))
        return {"status": "gated_rejected", "model_status": registry["status"], "reason": registry["reason"], "prediction": None}

        model_bundle = self.rio_trio_model.model
        if model_bundle is None:
            raise RuntimeError(f"Rio Trio prediction is unavailable. {self.rio_trio_model.error}")
        scores = np.clip(model_bundle["model"].predict(self.rio_trio_features(payload))[0], 0, 1)
        actions = [
            {"treaty": "UNFCCC", "domain": "Climate action", "action": "Reduce electricity and transport emissions", "score": round(float(scores[0]) * 100, 1), "reason": "Prioritizes energy efficiency, renewable power, and lower-carbon travel."},
            {"treaty": "CBD", "domain": "Biodiversity protection", "action": "Choose lower-impact food and reduce waste", "score": round(float(scores[1]) * 100, 1), "reason": "Reduces pressure on habitats from food production and discarded materials."},
            {"treaty": "UNCCD", "domain": "Land protection", "action": "Compost organic waste and protect soil", "score": round(float(scores[2]) * 100, 1), "reason": "Keeps organic matter in productive soil systems and reduces land degradation."},
        ]
        return {"actions": sorted(actions, key=lambda item: item["score"], reverse=True), "method": "Kaggle-trained treaty opportunity model", "model_available": True}

    def methane(self, payload):
        model_bundle = self.methane_model.model
        if model_bundle is None:
            raise RuntimeError(f"Methane prediction is unavailable. {self.methane_model.error}")
        household_size = self.number(payload, "household_size", 3, integer=True, minimum=1)
        diet = payload.get("diet", "Conventional")
        compost = self.number(payload, "compost_kg", 0, minimum=0)
        defaults = model_bundle["feature_defaults"].copy()
        defaults["year"] = model_bundle.get("latest_year", defaults["year"])
        baseline_tonnes = max(0, float(model_bundle["model"].predict(pd.DataFrame([defaults], columns=model_bundle["features"]))[0]))
        diet_reduction = {"Plant-Based": 0.35, "Vegetarian": 0.22, "Conventional": 0}.get(diet, 0)
        compost_reduction = min(0.3, compost * 0.03)
        reduction_fraction = min(0.8, diet_reduction + compost_reduction)
        baseline_kg = baseline_tonnes * 1000 * household_size
        avoided = baseline_kg * reduction_fraction
        return {"estimated_annual_methane_kg": round(baseline_kg, 2), "avoided_kg_ch4": round(avoided, 2), "diet_component_kg_ch4": round(baseline_kg * diet_reduction, 2), "compost_component_kg_ch4": round(baseline_kg * compost_reduction, 2), "predicted_baseline_tonnes_per_person": round(baseline_tonnes, 4), "method": "Kaggle-trained methane baseline plus household mitigation factors", "model_available": True}

    def analyze_energy(self, payload):
        return analyze_energy_engine(payload, self.number)

    def realtime(self, payload):
        model_bundle = self.realtime_model.model
        if model_bundle is None:
            raise RuntimeError(f"Realtime prediction is unavailable. {self.realtime_model.error}")
        latitude = self.number(payload, "latitude", 28.6139, minimum=-90)
        longitude = self.number(payload, "longitude", 77.2090, minimum=-180)
        if latitude > 90:
            raise ValueError("'latitude' must be between -90 and 90.")
        if longitude > 180:
            raise ValueError("'longitude' must be between -180 and 180.")
        query = urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,precipitation,surface_pressure",
            "timezone": "UTC",
        })
        with urlopen(f"{OPEN_METEO_BASE_URL}/forecast?{query}", timeout=10) as response:
            current = load(response)["current"]
        timestamp = pd.to_datetime(current["time"], utc=True)
        values = pd.DataFrame([{
            "temperature_2m": current["temperature_2m"],
            "relative_humidity_2m": current["relative_humidity_2m"],
            "cloud_cover": current["cloud_cover"],
            "wind_speed_10m": current["wind_speed_10m"],
            "precipitation": current["precipitation"],
            "surface_pressure": current["surface_pressure"],
            "hour": timestamp.hour,
            "day_of_year": timestamp.dayofyear,
        }], columns=model_bundle["features"])
        prediction = max(0, float(model_bundle["model"].predict(values)[0]))
        return {
            "shortwave_radiation_w_m2": round(prediction, 2),
            "latitude": latitude,
            "longitude": longitude,
            "observed_at": current["time"],
            "source": "Open-Meteo current weather",
        }

    def air_quality(self, payload):
        model_bundle = self.air_quality_model.model
        if model_bundle is None:
            raise RuntimeError(f"Air-quality prediction is unavailable. {self.air_quality_model.error}")
        latitude = self.number(payload, "latitude", 28.6139, minimum=-90)
        longitude = self.number(payload, "longitude", 77.2090, minimum=-180)
        if latitude > 90:
            raise ValueError("'latitude' must be between -90 and 90.")
        if longitude > 180:
            raise ValueError("'longitude' must be between -180 and 180.")
        query = urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "current": "carbon_monoxide,nitrogen_dioxide,ozone,dust,pm2_5",
            "timezone": "UTC",
        })
        with urlopen(f"https://air-quality-api.open-meteo.com/v1/air-quality?{query}", timeout=10) as response:
            current = load(response)["current"]
        timestamp = pd.to_datetime(current["time"], utc=True)
        values = pd.DataFrame([{
            "carbon_monoxide": current["carbon_monoxide"],
            "nitrogen_dioxide": current["nitrogen_dioxide"],
            "ozone": current["ozone"],
            "dust": current["dust"],
            "hour": timestamp.hour,
            "day_of_year": timestamp.dayofyear,
        }], columns=model_bundle["features"])
        prediction = max(0, float(model_bundle["model"].predict(values)[0]))
        return {
            "pm2_5_ug_m3": round(prediction, 2),
            "observed_pm2_5_ug_m3": current["pm2_5"],
            "latitude": latitude,
            "longitude": longitude,
            "observed_at": current["time"],
            "source": "Open-Meteo current air quality",
        }

    def rainfall(self, payload):
        model_bundle = self.rainfall_model.model
        if model_bundle is None:
            raise RuntimeError(f"Rainfall prediction is unavailable. {self.rainfall_model.error}")
        latitude = self.number(payload, "latitude", 28.6139, minimum=-90)
        longitude = self.number(payload, "longitude", 77.2090, minimum=-180)
        if latitude > 90:
            raise ValueError("'latitude' must be between -90 and 90.")
        if longitude > 180:
            raise ValueError("'longitude' must be between -180 and 180.")
        query = urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,pressure_msl,precipitation",
            "timezone": "UTC",
        })
        with urlopen(f"{OPEN_METEO_BASE_URL}/forecast?{query}", timeout=10) as response:
            current = load(response)["current"]
        timestamp = pd.to_datetime(current["time"], utc=True)
        values = pd.DataFrame([{
            "temperature_2m": current["temperature_2m"],
            "relative_humidity_2m": current["relative_humidity_2m"],
            "cloud_cover": current["cloud_cover"],
            "wind_speed_10m": current["wind_speed_10m"],
            "pressure_msl": current["pressure_msl"],
            "hour": timestamp.hour,
            "day_of_year": timestamp.dayofyear,
        }], columns=model_bundle["features"])
        probability = float(model_bundle["model"].predict_proba(values)[0][1])
        return {
            "rain_probability": round(probability, 4),
            "rain_probability_percent": round(probability * 100, 2),
            "observed_precipitation_mm": current["precipitation"],
            "latitude": latitude,
            "longitude": longitude,
            "observed_at": current["time"],
            "source": "Open-Meteo current weather",
        }

    def temperature(self, payload):
        model_bundle = self.temperature_model.model
        if model_bundle is None:
            raise RuntimeError(f"Temperature prediction is unavailable. {self.temperature_model.error}")
        latitude = self.number(payload, "latitude", 28.6139, minimum=-90)
        longitude = self.number(payload, "longitude", 77.2090, minimum=-180)
        if latitude > 90:
            raise ValueError("'latitude' must be between -90 and 90.")
        if longitude > 180:
            raise ValueError("'longitude' must be between -180 and 180.")
        query = urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,cloud_cover,pressure_msl,wind_speed_10m",
            "timezone": "UTC",
        })
        with urlopen(f"{OPEN_METEO_BASE_URL}/forecast?{query}", timeout=10) as response:
            current = load(response)["current"]
        timestamp = pd.to_datetime(current["time"], utc=True)
        values = pd.DataFrame([{
            "relative_humidity_2m": current["relative_humidity_2m"],
            "cloud_cover": current["cloud_cover"],
            "pressure_msl": current["pressure_msl"],
            "wind_speed_10m": current["wind_speed_10m"],
            "hour": timestamp.hour,
            "day_of_year": timestamp.dayofyear,
        }], columns=model_bundle["features"])
        prediction = max(0, float(model_bundle["model"].predict(values)[0]))
        return {
            "temperature_celsius": round(prediction, 2),
            "observed_temperature_celsius": current["temperature_2m"],
            "latitude": latitude,
            "longitude": longitude,
            "observed_at": current["time"],
            "source": "Open-Meteo current weather",
        }

    def uv_index(self, payload):
        metrics = self.model_metrics(self.uv_index_metrics_file)
        registry = decision("uv_index", metrics)
        model_bundle = self.uv_index_model.model
        latitude = self.number(payload, "latitude", 28.6139, minimum=-90)
        longitude = self.number(payload, "longitude", 77.2090, minimum=-180)
        if latitude > 90:
            raise ValueError("'latitude' must be between -90 and 90.")
        if longitude > 180:
            raise ValueError("'longitude' must be between -180 and 180.")
        query = urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max",
            "forecast_days": 1,
            "timezone": "UTC",
        })
        with urlopen(f"{OPEN_METEO_BASE_URL}/forecast?{query}", timeout=10) as response:
            daily = load(response)["daily"]
        if not daily.get("time") or daily.get("uv_index_max", [None])[0] is None:
            raise RuntimeError("Open-Meteo did not return UV-index data for this location.")
        timestamp = daily["time"][0]
        if registry["status"] != "VALIDATED":
            return {
                "status": "gated_rejected",
                "model_status": registry["status"],
                "reason": registry["reason"],
                "uv_index": round(float(daily["uv_index_max"][0]), 2),
                "latitude": latitude,
                "longitude": longitude,
                "forecast_date": timestamp,
                "source": "Open-Meteo daily forecast fallback",
            }
        if model_bundle is None:
            raise RuntimeError(f"UV-index prediction is unavailable. {self.uv_index_model.error}")
        date = pd.to_datetime(timestamp, utc=True)
        values = pd.DataFrame([{
            "temperature_2m_max": daily["temperature_2m_max"][0],
            "temperature_2m_min": daily["temperature_2m_min"][0],
            "precipitation_sum": daily["precipitation_sum"][0],
            "wind_speed_10m_max": daily["wind_speed_10m_max"][0],
            "day_of_year": date.dayofyear,
        }], columns=model_bundle["features"])
        prediction = max(0, float(model_bundle["model"].predict(values)[0]))
        return {
            "uv_index": round(prediction, 2),
            "latitude": latitude,
            "longitude": longitude,
            "forecast_date": timestamp,
            "source": "Open-Meteo daily forecast",
        }

    def wind(self, payload):
        metrics = self.model_metrics(self.wind_metrics_file)
        registry = decision("wind", metrics)
        model_bundle = self.wind_model.model
        latitude = self.number(payload, "latitude", 28.6139, minimum=-90)
        longitude = self.number(payload, "longitude", 77.2090, minimum=-180)
        if latitude > 90:
            raise ValueError("'latitude' must be between -90 and 90.")
        if longitude > 180:
            raise ValueError("'longitude' must be between -180 and 180.")
        query = urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,cloud_cover,pressure_msl,wind_speed_10m",
            "timezone": "UTC",
        })
        with urlopen(f"{OPEN_METEO_BASE_URL}/forecast?{query}", timeout=10) as response:
            current = load(response)["current"]
        if registry["status"] != "VALIDATED":
            return {
                "status": "gated_rejected",
                "model_status": registry["status"],
                "reason": registry["reason"],
                "wind_speed_kmh": round(float(current["wind_speed_10m"]), 2),
                "latitude": latitude,
                "longitude": longitude,
                "observed_at": current["time"],
                "source": "Open-Meteo current weather fallback",
            }
        if model_bundle is None:
            raise RuntimeError(f"Wind prediction is unavailable. {self.wind_model.error}")
        timestamp = pd.to_datetime(current["time"], utc=True)
        values = pd.DataFrame([{
            "temperature_2m": current["temperature_2m"],
            "relative_humidity_2m": current["relative_humidity_2m"],
            "cloud_cover": current["cloud_cover"],
            "pressure_msl": current["pressure_msl"],
            "wind_speed_10m": current["wind_speed_10m"],
            "hour": timestamp.hour,
            "day_of_year": timestamp.dayofyear,
        }], columns=model_bundle["features"])
        prediction = max(0, float(model_bundle["model"].predict(values)[0]))
        return {
            "wind_speed_kmh": round(prediction, 2),
            "observed_wind_speed_kmh": current["wind_speed_10m"],
            "latitude": latitude,
            "longitude": longitude,
            "observed_at": current["time"],
            "source": "Open-Meteo current weather",
        }
