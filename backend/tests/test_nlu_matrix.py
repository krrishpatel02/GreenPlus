import pytest

from backend.services.assistant_service import AssistantService
from backend.services.intent_classifier import INTENTS, classify_intent
from backend.services.language_detector import detect_language


@pytest.mark.parametrize(
    "text, expected",
    [
        ("hello", "GENERAL_ADVICE"),
        ("what is the weather today?", "WEATHER_QUESTION"),
        ("kal rain hai?", "RAIN_QUESTION"),
        ("solar available che?", "SOLAR_QUESTION"),
        ("best solar usage window?", "SOLAR_USAGE_WINDOW"),
        ("When should I charge my EV?", "EV_CHARGING"),
        ("give energy advice", "ENERGY_ADVICE"),
        ("calculate electricity usage", "ENERGY_CALCULATION"),
        ("how can I save water?", "WATER_ADVICE"),
        ("paani kitna calculate karo", "WATER_CALCULATION"),
        ("how do I reduce waste?", "WASTE_ADVICE"),
        ("how do I recycle plastic?", "RECYCLING_ADVICE"),
        ("best transport option for commute", "TRANSPORT_ADVICE"),
        ("food and diet advice", "FOOD_ADVICE"),
        ("climate advice please", "CLIMATE_ADVICE"),
        ("check air quality", "AIR_QUALITY"),
        ("is it hot today?", "TEMPERATURE"),
        ("what is the UV index?", "UV"),
        ("is the wind strong?", "WIND"),
        ("show my carbon footprint", "CARBON_FOOTPRINT"),
        ("calculate my carbon emissions", "CARBON_CALCULATION"),
        ("compare solar versus grid", "COMPARISON"),
        ("what should I do today?", "PERSONAL_ACTION"),
        ("show my notifications", "NOTIFICATION_QUERY"),
        ("give me an eco tip", "ECO_TIP"),
        ("predict tomorrow's rainfall", "PREDICTION"),
        ("explain composting", "EXPLANATION"),
    ],
)
def test_all_declared_intents_have_classification_paths(text, expected):
    result = classify_intent(text)
    assert result["intent"] == expected
    assert result["intent"] in INTENTS


@pytest.mark.parametrize(
    "text, expected",
    [
        ("ચાલો પાણી બચાવીએ", "Gujarati"),
        ("મારે washing machine ક્યારે ચલાવું?", "Gujlish"),
        ("बारिश कब होगी", "Hindi"),
        ("kal washing machine kab chalau", "Hinglish"),
        ("When should I run laundry?", "English"),
        ("કાલે rain આવશે", "Gujlish"),
    ],
)
def test_language_detection_covers_required_modes(text, expected):
    assert detect_language(text) == expected


def test_follow_up_preserves_context_and_applies_natural_answer_rule():
    classification = classify_intent("તો washing machine ક્યારે ચલાવું?", "RAIN_QUESTION")
    assert classification["intent"] == "SOLAR_USAGE_WINDOW"

    result = AssistantService().respond(
        "Will it rain later?",
        history=[{"intent": "WEATHER_QUESTION"}],
        context={"weather": {"rainProbability": 82}},
    )
    assert result["intent"] == "RAIN_QUESTION"
    assert "82" not in result["reply"]

    numeric_result = AssistantService().respond(
        "What percent chance of rain?",
        context={"weather": {"rainProbability": 82}},
    )
    assert "82" in numeric_result["reply"]
