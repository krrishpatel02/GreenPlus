from .intent_classifier import classify_intent


class AssistantService:
    def respond(self, text, history=None, context=None):
        history = history or []
        context = context or {}
        previous_intent = next((item.get("intent") for item in reversed(history) if item.get("intent")), None)
        classification = classify_intent(text, previous_intent)
        intent = classification["intent"]
        language = classification["language"]
        weather = context.get("weather") or {}
        wants_values = classification["entities"].get("requested_calculation") or any(
            term in str(text).lower() for term in ("number", "percent", "%", " कित", " કેટ")
        )
        reply = self._reply(intent, language, classification["entities"], weather, context.get("userContext") or {}, wants_values)
        return {"reply": reply, "intent": intent, "language": language, "entities": classification["entities"], "mode": "QUICK" if len(reply) < 180 else "NORMAL", "source": "rules"}

    @staticmethod
    def _reply(intent, language, entities, weather, user_context, wants_values=False):
        rain_probability = weather.get("rainProbability")
        if language in {"Gujarati", "Gujlish"}:
            if intent == "RAIN_QUESTION":
                return "🌧️ Forecast પ્રમાણે વરસાદની શક્યતા છે." if rain_probability is None or not wants_values else f"🌧️ Forecast પ્રમાણે વરસાદની શક્યતા લગભગ {rain_probability}% છે."
            if intent == "SOLAR_USAGE_WINDOW":
                return "☀️ Solar સારું હોય ત્યારે washing machine ચલાવવી સારી રહેશે. વાદળો કે વરસાદ પહેલાં કરી લો."
            if intent == "WATER_ADVICE":
                return "💧 Shower થોડો ટૂંકો રાખો, leaks ચેક કરો અને બચેલું પાણી છોડ માટે વાપરો."
            if intent == "ENERGY_ADVICE":
                return "⚡ Standby appliances બંધ કરો અને ભારે કામ solar સારી હોય ત્યારે કરો."
        if language == "Hindi" or language == "Hinglish":
            if intent == "RAIN_QUESTION":
                return "🌧️ Forecast ke hisaab se baarish ki possibility hai." if rain_probability is None or not wants_values else f"🌧️ Baarish ki possibility lagbhag {rain_probability}% hai."
            if intent == "SOLAR_USAGE_WINDOW":
                return "☀️ Solar achha ho to washing machine abhi chalana better rahega, especially clouds ya rain se pehle."
            if intent == "WATER_ADVICE":
                return "💧 Shower thoda short rakho, leaks check karo aur bacha hua paani plants ke liye use karo."
            if intent == "ENERGY_ADVICE":
                return "⚡ Standby appliances off rakho aur heavy-use kaam solar window mein karo."
        if intent == "RAIN_QUESTION":
            return "🌧️ Rain looks possible later. If you need solar power for laundry, earlier may be easier." if rain_probability is None or not wants_values else f"🌧️ Rain looks possible, with about {rain_probability}% chance in the current forecast."
        if intent == "SOLAR_USAGE_WINDOW":
            return "☀️ If your solar is producing well right now, this could be a good time to run the washing machine or another heavy appliance."
        if intent == "WEATHER_QUESTION":
            return "🌤️ I can help interpret the current weather when a location or forecast is available. Tell me what you are planning outdoors."
        if intent == "EV_CHARGING":
            return "🔋 If your EV is not full and solar is available, charging during the brighter part of the day may be a good window."
        if intent == "TRANSPORT_ADVICE":
            return "🚲 For short trips, walking or cycling is the lightest option. For longer trips, public transport or shared rides usually reduce impact."
        if intent == "PERSONAL_ACTION":
            return "🌱 Pick one small action today: switch off standby devices, shorten a shower, avoid a car trip, or separate food scraps."
        if intent in {"ENERGY_ADVICE", "ENERGY_CALCULATION"}:
            return "⚡ Start with the biggest loads: cooling, heating, and standby devices. I can calculate usage when you share the appliance or meter details."
        if intent in {"WATER_ADVICE", "WATER_CALCULATION"}:
            return "💧 Shorter showers, leak checks, and reusing suitable rinse water are practical places to start."
        if intent == "CLIMATE_ADVICE":
            return "🌍 Small choices add up: reduce avoidable energy use, travel lighter when practical, and keep food waste out of landfill."
        if intent == "FOOD_ADVICE":
            return "🍃 Try one lower-impact meal and compost suitable food scraps. Small, repeatable changes are easier to keep."
        if intent == "AIR_QUALITY":
            return "🌿 I can check air quality for your location when location data is available. For now, avoid assuming conditions are safe without a current reading."
        if intent in {"TEMPERATURE", "UV", "WIND"}:
            return "🌤️ I can interpret that forecast for your location. Share a location or ask for the current reading when data is available."
        if intent in {"CARBON_CALCULATION", "CARBON_FOOTPRINT"}:
            return "🌍 I can estimate your footprint from measured household and travel details. Share the numbers you want included and I’ll label the result clearly."
        if intent == "NOTIFICATION_QUERY":
            return "🔔 I’ll show your recent eco notifications and keep repeated alerts under control."
        if intent == "COMPARISON":
            return "⚖️ I can compare the options by energy use, water demand, carbon impact, cost, and practical effort. Tell me which two you are weighing."
        if intent == "ECO_TIP":
            return "🌿 Eco tip: make one efficient choice repeatable, such as a shorter shower or switching off standby power before bed."
        if intent == "EXPLANATION":
            return "🌱 Tell me the topic you want explained and I’ll keep it practical, with details only when they help."
        return "🌿 Tell me what you’re planning today and I’ll suggest the most useful next step."
