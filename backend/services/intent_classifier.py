import re

from .language_detector import detect_language


INTENTS = (
    "GENERAL_ADVICE", "WEATHER_QUESTION", "RAIN_QUESTION", "SOLAR_QUESTION",
    "SOLAR_USAGE_WINDOW", "EV_CHARGING", "ENERGY_ADVICE", "ENERGY_CALCULATION",
    "WATER_ADVICE", "WATER_CALCULATION", "WASTE_ADVICE", "RECYCLING_ADVICE",
    "TRANSPORT_ADVICE", "FOOD_ADVICE", "CLIMATE_ADVICE", "AIR_QUALITY",
    "TEMPERATURE", "UV", "WIND", "CARBON_FOOTPRINT", "CARBON_CALCULATION",
    "COMPARISON", "PERSONAL_ACTION", "NOTIFICATION_QUERY", "ECO_TIP",
    "PREDICTION", "EXPLANATION",
)


def _has(text, *terms):
    return any(term in text for term in terms)


def classify_intent(text, previous_intent=None):
    original = str(text or "").strip()
    value = re.sub(r"\s+", " ", original.lower())
    language = detect_language(original)
    entities = {
        "date": "tomorrow" if _has(value, "tomorrow", "kal", "કાલે") else ("today" if _has(value, "today", "aaj", "આજે") else None),
        "activity": "washing_machine" if _has(value, "washing machine", "laundry", "કપડાં", "વોશિંગ") else None,
        "ev": _has(value, "ev", "electric car", "ગાડી charge", "कार charge"),
        "solar": _has(value, "solar", "સોલાર", "सोलर"),
        "weather_condition": "rain" if _has(value, "rain", "barish", "વરસાદ", "बारिश") else None,
        "requested_calculation": _has(value, "how much", "kitna", "કેટલું", "કેટલું", "कितना", "calculate", "calculation"),
    }

    is_follow_up = previous_intent and _has(value, "then", "તો", "so", "પછી", "फिर")
    if is_follow_up and entities["activity"] and previous_intent in {"RAIN_QUESTION", "WEATHER_QUESTION", "SOLAR_QUESTION"}:
        intent = "SOLAR_USAGE_WINDOW"
    elif _has(value, "what should i do", "what can i do", "હું શું કરું", "मैं क्या करूं"):
        intent = "PERSONAL_ACTION"
    elif _has(value, "weather", "હવામાન", "मौसम"):
        intent = "WEATHER_QUESTION"
    elif _has(value, "compare", "versus", "better than"):
        intent = "COMPARISON"
    elif _has(value, "forecast", "predict", "prediction"):
        intent = "PREDICTION"
    elif _has(value, "solar", "સોલાર", "सोलर") and _has(value, "when", "best", "full", "window", "ક્યારે"):
        intent = "SOLAR_USAGE_WINDOW"
    elif _has(value, "uv", "sunburn", "sunlight", "તડકો"):
        intent = "UV"
    elif _has(value, "wind", "પવન", "हવા तेज"):
        intent = "WIND"
    elif _has(value, "rain", "barish", "વરસાદ", "बारिश"):
        intent = "RAIN_QUESTION"
    elif _has(value, "why", "what is", "explain", "shu che", "શું છે"):
        intent = "EXPLANATION"
    elif _has(value, "notification", "notifications", "નોટિફિકેશન"):
        intent = "NOTIFICATION_QUERY"
    elif _has(value, "air quality", "pollution", "હવા", "वायु"):
        intent = "AIR_QUALITY"
    elif _has(value, "temperature", "hot", "ગરમી", "गर्मी"):
        intent = "TEMPERATURE"
    elif entities["ev"] and _has(value, "charge", "charging", "ચાર્જ", "चार्ज"):
        intent = "EV_CHARGING"
    elif entities["activity"] and (_has(value, "when", "ક્યારે", "kab", "तो") or entities["solar"]):
        intent = "SOLAR_USAGE_WINDOW" if entities["solar"] or entities["weather_condition"] else "ENERGY_ADVICE"
    elif _has(value, "solar", "સોલાર", "सोलर", "ધૂપ", "धूप"):
        intent = "SOLAR_QUESTION"
    elif _has(value, "electricity", "electric", "energy", "bill", "વીજળી", "बिजली"):
        intent = "ENERGY_CALCULATION" if entities["requested_calculation"] else "ENERGY_ADVICE"
    elif _has(value, "travel", "transport", "commute", "bus", "train", "મુસાફરી", "यात्रा"):
        intent = "TRANSPORT_ADVICE"
    elif _has(value, "water", "pani", "paani", "પાણી", "પાણી", "पानी"):
        intent = "WATER_CALCULATION" if entities["requested_calculation"] else "WATER_ADVICE"
    elif _has(value, "climate", "methane", "ch4", "cow", "livestock", "ruminant", "મિથેન", "આબોહવા", "जलवायु"):
        intent = "CLIMATE_ADVICE"
    elif _has(value, "food", "diet", "compost", "ખોરાક", "भोजन"):
        intent = "FOOD_ADVICE"
    elif _has(value, "rio", "unfccc", "cbd", "unccd", "treaty"):
        intent = "CLIMATE_ADVICE"
    elif _has(value, "carbon", "co2", "emission"):
        intent = "CARBON_CALCULATION" if entities["requested_calculation"] else "CARBON_FOOTPRINT"
    elif _has(value, "recycl", "plastic", "રિસાયકલ"):
        intent = "RECYCLING_ADVICE"
    elif _has(value, "waste", "compost", "kachra", "કચરો"):
        intent = "WASTE_ADVICE"
    elif _has(value, "tip", "ટિપ", "सलाह"):
        intent = "ECO_TIP"
    elif is_follow_up:
        intent = previous_intent
    else:
        intent = "GENERAL_ADVICE"

    return {"intent": intent, "language": language, "entities": entities, "text": original}
