from backend.services.assistant_service import AssistantService
from backend.services.intent_classifier import classify_intent
from backend.services.language_detector import detect_language


def test_required_language_detection_variants():
    assert detect_language("What is the weather today?") == "English"
    assert detect_language("કાલે વરસાદ પડશે?") == "Gujarati"
    assert detect_language("कल बारिश होगी?") == "Hindi"
    assert detect_language("kal rain hai?") == "Hinglish"
    assert detect_language("kal varsad aavse?") == "Gujlish"


def test_required_intents_across_scripts():
    cases = {
        "ક્યારે વરસાદ પડશે?": "RAIN_QUESTION",
        "कल धूप कैसी है?": "SOLAR_QUESTION",
        "kal EV charge karu?": "EV_CHARGING",
        "પાણી કેટલું બચાવું?": "WATER_CALCULATION",
        "how much carbon do I produce?": "CARBON_CALCULATION",
        "recycling kaise karu?": "RECYCLING_ADVICE",
    }
    for text, expected in cases.items():
        assert classify_intent(text)["intent"] == expected


def test_mixed_script_follow_up_keeps_conversation_context():
    result = classify_intent("તો washing machine ક્યારે ચલાવું?", "RAIN_QUESTION")
    assert result["intent"] == "SOLAR_USAGE_WINDOW"
    assert result["entities"]["activity"] == "washing_machine"


def test_natural_answer_rule_omits_forecast_number_unless_requested():
    service = AssistantService()
    context = {"weather": {"rainProbability": 82}}
    normal = service.respond("Will it rain?", context=context)
    numeric = service.respond("What is the rain probability percentage?", context=context)
    assert "82" not in normal["reply"]
    assert "82" in numeric["reply"]