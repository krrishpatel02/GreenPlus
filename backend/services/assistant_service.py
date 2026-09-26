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
            term in str(text).lower() for term in ("number", "percent", "%", " કિત", " કેટ")
        )
        reply = self._reply(intent, language, classification["entities"], weather, context.get("userContext") or {}, wants_values)
        return {"reply": reply, "intent": intent, "language": language, "entities": classification["entities"], "mode": "QUICK" if len(reply) < 180 else "NORMAL", "source": "rules"}

    @staticmethod
    def _reply(intent, language, entities, weather, user_context, wants_values=False):
        rain_probability = weather.get("rainProbability")

        # ── Gujarati / Gujlish replies ─────────────────────────────────────────
        if language in {"Gujarati", "Gujlish"}:
            if intent == "RAIN_QUESTION":
                return "🌧️ Forecast પ્રમાણે વરસાદ આવી શકે છે." if rain_probability is None or not wants_values else f"🌧️ Forecast પ્રમાણે વરસાદની શક્યતા લગભગ {rain_probability}% છે."
            if intent == "SOLAR_QUESTION":
                return "☀️ Solar panel ત્યારે સૌથી સારું કામ કરે છે જ્યારે આકાશ સ્વચ્છ હોય. App માં Solar tab ચેક કરો."
            if intent == "SOLAR_USAGE_WINDOW":
                return "☀️ Solar સારું હોય ત્યારે washing machine ચલાવવી સારી રહેશે. વાદળો કે વરસાદ પહેલાં કરી લો."
            if intent == "WATER_ADVICE":
                return "💧 Shower થોડો ટૂંકો રાખો, leaks ચેક કરો અને બચેલું પાણી છોડ માટે વાપરો."
            if intent == "ENERGY_ADVICE":
                return "⚡ Standby appliances બંધ કરો અને ભારે કામ solar સારી હોય ત્યારે કરો."
            if intent == "RECYCLING_ADVICE":
                return "♻️ Plastic, paper અને glass ને અલગ-અલગ રાખો. ભીનો ક waste ─ dry waste ─ e-waste ─ ત્રણ ડબ્બા રાખો."
            if intent == "WASTE_ADVICE":
                return "🗑️ ભીજ્યો waste (શાક, ફળ) compost bin માં નાખો. Dry waste recycle center ને આપો."

        # ── Hindi / Hinglish replies ───────────────────────────────────────────
        if language in {"Hindi", "Hinglish"}:
            if intent == "RAIN_QUESTION":
                return "🌧️ Forecast ke hisaab se baarish ki possibility hai." if rain_probability is None or not wants_values else f"🌧️ Baarish ki possibility lagbhag {rain_probability}% hai."
            if intent == "SOLAR_QUESTION":
                return "☀️ Solar panel saaf aasman mein best kaam karta hai. App mein Solar tab check karo."
            if intent == "SOLAR_USAGE_WINDOW":
                return "☀️ Solar achha ho to washing machine abhi chalana better rahega, especially clouds ya rain se pehle."
            if intent == "WATER_ADVICE":
                return "💧 Shower thoda short rakho, leaks check karo aur bacha hua paani plants ke liye use karo."
            if intent == "ENERGY_ADVICE":
                return "⚡ Standby appliances off rakho aur heavy-use kaam solar window mein karo."
            if intent == "RECYCLING_ADVICE":
                return "♻️ Plastic, paper aur glass ko alag rakho. Teen dabbe: geela kachra, sukha kachra, e-waste."
            if intent == "WASTE_ADVICE":
                return "🗑️ Geele kachra (sabzi, phal) ko compost bin mein daalo. Sukha kachra recycle centre ko do."

        # ── English replies (default) ──────────────────────────────────────────
        if intent == "RAIN_QUESTION":
            return "🌧️ Rain looks possible later. If you need solar power for laundry, earlier may be a better time." if rain_probability is None or not wants_values else f"🌧️ Rain looks possible — about {rain_probability}% chance right now."
        if intent == "SOLAR_QUESTION":
            return "☀️ Solar panels work best when the sky is clear and it's the middle of the day. Check the Solar tab in the app for today's reading."
        if intent == "SOLAR_USAGE_WINDOW":
            return "☀️ Solar is looking good right now. It could be a good time to run the washing machine or another big appliance."
        if intent == "WEATHER_QUESTION":
            return "🌤️ Tell me what you're planning outside and I'll help you pick the best time based on today's weather."
        if intent == "EV_CHARGING":
            return "🔋 If your EV isn't full and it's sunny, charging now uses free solar power instead of grid electricity."
        if intent == "TRANSPORT_ADVICE":
            return "🚲 For short trips, walking or cycling is the greenest option. For longer trips, a bus or train usually uses far less energy than a car."
        if intent == "PERSONAL_ACTION":
            return "🌱 Pick one small action today: switch off standby devices, take a shorter shower, skip a car trip, or separate food scraps for compost."
        if intent in {"ENERGY_ADVICE", "ENERGY_CALCULATION"}:
            return "⚡ The biggest energy users are usually heating, cooling, and devices left on standby. Tell me which appliances you want help with and I'll break it down."
        if intent in {"WATER_ADVICE", "WATER_CALCULATION"}:
            return "💧 Shorter showers, fixing dripping taps, and reusing rinse water for plants are easy ways to cut water use."
        if intent == "RECYCLING_ADVICE":
            return "♻️ Keep three separate bins: wet waste (food scraps), dry waste (paper, plastic, glass), and e-waste (old electronics). Clean containers before recycling them."
        if intent == "WASTE_ADVICE":
            return "🗑️ Food scraps and vegetable peels go into a compost bin — they turn into free garden fertiliser. Dry waste like cardboard and bottles can be recycled."
        if intent == "CLIMATE_ADVICE":
            return "🌍 Small daily choices add up: cut avoidable energy use, travel lighter when you can, and keep food waste out of landfill."
        if intent == "FOOD_ADVICE":
            return "🍃 Try swapping one meal a week for a plant-based option and compost your food scraps. Small, repeatable changes are easier to stick to."
        if intent == "AIR_QUALITY":
            return "🌿 Share your location and I'll check the current air quality reading. On bad air days, try to avoid busy roads and keep windows closed."
        if intent in {"TEMPERATURE", "UV", "WIND"}:
            return "🌤️ I can look up that forecast for your location. Tell me where you are or open the Weather tab in the app for a live reading."
        if intent in {"CARBON_CALCULATION", "CARBON_FOOTPRINT"}:
            return "🌍 I can estimate how much CO₂ your household produces. Share details like your electricity use, car travel, and food habits and I'll give you a clear number."
        if intent == "NOTIFICATION_QUERY":
            return "🔔 I'll show your recent eco alerts. I keep repeated notifications under control so you only see what's useful."
        if intent == "COMPARISON":
            return "⚖️ Tell me which two options you want to compare — for example, car vs train, or gas cooker vs induction — and I'll break down the energy, cost, and environmental difference."
        if intent == "ECO_TIP":
            return "🌿 Quick tip: switch off devices at the wall before bed (not just standby), take a one-minute shorter shower, and buy loose fruit and veg instead of packaged."
        if intent == "EXPLANATION":
            return "🌱 Tell me the topic and I'll explain it in plain language — no jargon, just the key points."
        if intent == "PREDICTION":
            return "📊 I can show predictions for rainfall, temperature, air quality, and solar output for your location. What would you like to know?"
        return "🌿 Tell me what you're planning today and I'll suggest the most useful next step."
