from .intent_classifier import classify_intent


def _has_word(text, *terms):
    lower = str(text or "").lower()
    return any(t in lower for t in terms)


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
        reply = self._reply(intent, language, classification["entities"], weather, context.get("userContext") or {}, wants_values, text)
        return {"reply": reply, "intent": intent, "language": language, "entities": classification["entities"], "mode": "QUICK" if len(reply) < 180 else "NORMAL", "source": "rules"}

    @staticmethod
    def _reply(intent, language, entities, weather, user_context, wants_values=False, text=""):
        rain_probability = weather.get("rainProbability")
        msg = str(text or "").lower()

        # ── Gujarati / Gujlish replies ─────────────────────────────────────────
        if language in {"Gujarati", "Gujlish"}:
            if _has_word(msg, "rio", "treaty", "ટ્રીટી", "કરાર", "unfccc", "cbd", "unccd"):
                return "🌍 Rio Trio એટલે 3 મહત્વના UN પર્યાવરણ કરારો:\n• UNFCCC: વાતાવરણ બદલાવ અને પ્રદૂષણ રોકવા\n• CBD: વન્યજીવ અને જંગલો બચાવવા\n• UNCCD: જમીન અને માટીને સુધારી રક્ષણ આપવા."
            if _has_word(msg, "methane", "ch4", "મિથેન"):
                return "🐮 મિથેન (CH₄) CO₂ કરતાં 80 ગણી વધુ ગરમી પકડે છે! શાકભાજી-ફળોના કચરામાંથી ખાતર બનાવીને અને વધુ શાકાહારી ભોજન લઈને આપણે મિથેન તરત જ ઘટાડી શકીએ છીએ."
            if _has_word(msg, "metering", "મીટરિંગ", "net meter"):
                return "☀️ સોલાર નેટ મીટરિંગમાં વધારાની સૌર ઊર્જા ગ્રીડમાં જાય છે અને તમારું લાઇટ બિલ ઘટે છે!"
            if _has_word(msg, "rebate", "subsidy", "incentive", "સબસિડી"):
                return "🚗 હા! PM E-DRIVE અને સરકારી યોજનાઓ હેઠળ EV વાહનો પર સબસિડી, ટેક્સ છૂટ અને સોલાર પેનલ પર 40% સુધી સહાય મળે છે."
            if _has_word(msg, "compost", "ખાતર"):
                return "🌱 રસોડાનો શાકભાજી અને ફળોનો કચરો એક માટલામાં ભેગો કરો. 3-4 અઠવાડિયામાં ઉત્તમ દેશી ઓર્ગેનિક ખાતર બની જશે!"
            if intent == "RAIN_QUESTION":
                return "🌧️ Forecast પ્રમાણે વરસાદ આવી શકે છે." if rain_probability is None or not wants_values else f"🌧️ Forecast પ્રમાણે વરસાદની શક્યતા લગભગ {rain_probability}% છે."
            if intent == "SOLAR_QUESTION":
                return "☀️ Solar panel ત્યારે સૌથી સારું કામ કરે છે જ્યારે આકાશ સ્વચ્છ હોય. App માં Solar tab ચેક કરો."
            if intent == "SOLAR_USAGE_WINDOW":
                return "☀️ Solar સારું હોય ત્યારે (11 AM થી 3 PM) washing machine ચલાવવી સારી રહેશે. વાદળો કે વરસાદ પહેલાં કરી લો."
            if intent == "EV_CHARGING":
                return "🔋 તડકો સારો હોય ત્યારે EV ચાર્જ કરો, જેથી મફત સોલાર પાવરનો ઉપયોગ થાય."
            if intent == "WATER_ADVICE":
                return "💧 Shower થોડો ટૂંકો રાખો, leaks ચેક કરો અને બચેલું પાણી છોડ માટે વાપરો."
            if intent == "ENERGY_ADVICE":
                return "⚡ Standby appliances બંધ કરો અને ભારે કામ solar સારી હોય ત્યારે કરો."
            if intent == "RECYCLING_ADVICE":
                return "♻️ ભીનો કચરો (શાકભાજી) અને સૂકો કચરો (પ્લાસ્ટિક/કાગળ) અલગ રાખો."
            if intent == "WASTE_ADVICE":
                return "🗑️ ભીનો કચરો compost bin માં નાખો અને સૂકો કચરો recycle center ને આપો."
            if intent == "AIR_QUALITY":
                return "🌿 તમારું લોકેશન શેર કરો, હું તાજી હવાની ગુણવત્તા (Air Quality) ચેક કરી આપીશ."

        # ── Hindi / Hinglish replies ───────────────────────────────────────────
        if language in {"Hindi", "Hinglish"}:
            if _has_word(msg, "rio", "treaty", "समझौते", "unfccc", "cbd", "unccd"):
                return "🌍 Rio Trio teen mukhya UN environmental samjhote hain:\n• UNFCCC: Climate change aur carbon emissions rokna\n• CBD: Ped-paudhe aur biodiversity bachana\n• UNCCD: Mitti aur zameen ko kharab hone se bachana."
            if _has_word(msg, "methane", "ch4", "मीथेन"):
                return "🐮 Methane (CH₄) CO₂ se lagbhag 80 guna jyada heat trap karti hai! Geela kachra compost karke aur green diet apna kar hum methane turant kam kar sakte hain."
            if _has_word(msg, "metering", "मीटरिंग", "net meter"):
                return "☀️ Net metering mein jab aapka solar panel extra bijli banata hai, to wo grid mein chali jaati hai aur bijli bill mein credits milte hain!"
            if _has_word(msg, "rebate", "subsidy", "incentive", "सब्सिडी"):
                return "🚗 Haan! PM E-DRIVE aur government schemes mein EV par road tax chhoot aur solar rooftop par 40% tak subsidy milti hai."
            if _has_word(msg, "compost", "खाद"):
                return "🌱 Geela kachra (sabziyon ke chhilke, bacha khana) ek matke mein daalo. Kuch hafton mein paudhon ke liye behtareen organic khaad ban jayegi!"
            if intent == "RAIN_QUESTION":
                return "🌧️ Forecast ke hisaab se baarish ki possibility hai." if rain_probability is None or not wants_values else f"🌧️ Baarish ki possibility lagbhag {rain_probability}% hai."
            if intent == "SOLAR_QUESTION":
                return "☀️ Solar panel saaf dhoop mein best kaam karta hai. App mein Solar tab check karo."
            if intent == "SOLAR_USAGE_WINDOW":
                return "☀️ Solar achha ho (11 AM se 3 PM) to washing machine chalana better rahega, clouds ya rain se pehle."
            if intent == "EV_CHARGING":
                return "🔋 Dhoop ke time EV charge karna best hai — isse free solar bijli ka use hota hai."
            if intent == "WATER_ADVICE":
                return "💧 Shower thoda short rakho, leaks check karo aur bacha hua paani plants ke liye use karo."
            if intent == "ENERGY_ADVICE":
                return "⚡ Standby appliances off rakho aur heavy-use kaam solar window mein karo."
            if intent == "RECYCLING_ADVICE":
                return "♻️ Geela kachra aur sukha kachra (plastic, paper) alag alag dabbe mein rakho."
            if intent == "WASTE_ADVICE":
                return "🗑️ Geele kachre ko compost bin mein daalo aur sukha kachra recycle centre ko do."
            if intent == "AIR_QUALITY":
                return "🌿 Apna location batao, main turant air quality reading check kar deta hoon."

        # ── English replies (default) ──────────────────────────────────────────
        # Specific rich prompt matches first (easy, direct explanations)
        if _has_word(msg, "rio", "unfccc", "cbd", "unccd", "treaty", "treaties"):
            return "🌍 The Rio Trio refers to 3 landmark UN environmental treaties signed in 1992:\n1. UNFCCC — Combats global climate change and reduces greenhouse gases.\n2. CBD — Protects biodiversity, wildlife, and natural ecosystems.\n3. UNCCD — Prevents land degradation, soil erosion, and desertification."

        if _has_word(msg, "methane", "ch4"):
            return "🐮 Methane (CH₄) traps ~80 times more heat than CO₂ over 20 years, making it a critical warming gas! It mainly comes from food waste rotting in landfills, livestock, and leaks. Composting food scraps and choosing plant-based meals cuts methane immediately."

        if _has_word(msg, "net meter", "net-meter", "net metering"):
            return "☀️ Solar net metering lets you send extra electricity produced by your solar panels back into the grid. Your meter runs backwards and you receive credits on your monthly power bill!"

        if _has_word(msg, "rebate", "rebates", "subsidy", "subsidies", "incentive", "incentives") and (_has_word(msg, "ev", "car", "vehicle") or intent in {"EV_CHARGING", "TRANSPORT_ADVICE"}):
            return "🚗 Yes! Schemes like PM E-DRIVE, state EV policies, and tax breaks offer purchase discounts, road tax exemptions, and lower 5% GST for electric vehicles. Solar rooftop systems also receive up to 40% government subsidy under PM Surya Ghar."

        if _has_word(msg, "compost", "composting"):
            return "🌱 Composting is simple: collect fruit peels, vegetable scraps, and dry leaves in a container. Over 3–4 weeks, friendly bacteria turn them into rich, natural fertiliser for your plants, keeping organic waste out of methane-producing landfills!"

        if intent == "RAIN_QUESTION":
            return "🌧️ Rain looks possible later. If you need solar power for laundry, earlier may be a better time." if rain_probability is None or not wants_values else f"🌧️ Rain looks possible — about {rain_probability}% chance right now."

        if intent == "SOLAR_QUESTION":
            return "☀️ Solar panels produce the most power in direct midday sun. Open the Solar tab in GreenPlus to check today's live output!"

        if intent == "SOLAR_USAGE_WINDOW":
            return "☀️ Peak solar production is typically between 11:00 AM and 3:00 PM. That's the best window to run your washing machine or heavy appliances using clean, free sunshine!"

        if intent == "WEATHER_QUESTION":
            return "🌤️ Tell me what you're planning outside today and I'll help you pick the best time based on current weather conditions."

        if intent == "EV_CHARGING":
            if _has_word(msg, "rebate", "subsidy", "incentive", "discount", "tax"):
                return "🚗 Yes! Government programs like PM E-DRIVE and state subsidies offer purchase discounts, zero road tax, and low 5% GST on EVs."
            return "🔋 Charging your EV during midday peak sun (11 AM – 3 PM) lets you charge with free solar energy instead of expensive grid electricity."

        if intent == "TRANSPORT_ADVICE":
            return "🚲 For short trips under 3 km, walking or cycling is zero-emission and healthy. For longer trips, buses, trains, or metro cut your carbon footprint by up to 70% compared to driving alone."

        if intent == "PERSONAL_ACTION":
            return "🌱 Here are 3 easy green steps for today:\n1. Switch off appliances at the wall instead of standby.\n2. Keep your shower under 5 minutes.\n3. Separate food scraps into a compost bin instead of the trash."

        if intent in {"ENERGY_ADVICE", "ENERGY_CALCULATION"}:
            if entities.get("activity") == "washing_machine":
                return "☀️ For laundry and heavy appliances, running them during peak solar hours (11 AM – 3 PM) saves the most energy and cuts grid costs."
            return "⚡ Your biggest electricity consumers are air conditioning, heating, and devices left on standby. Unplugging idle electronics can save up to 10% on your power bill!"

        if intent in {"WATER_ADVICE", "WATER_CALCULATION"}:
            return "💧 Easy ways to save water at home:\n• Take 5-minute showers (saves ~40 L each time)\n• Fix dripping taps promptly (saves ~20 L/day)\n• Reuse vegetable washing water for house plants."

        if intent == "RECYCLING_ADVICE":
            return "♻️ Simple recycling rules:\n• Keep 3 bins: wet kitchen waste, dry recyclables (paper/plastic/metal), and e-waste.\n• Rinse food containers before recycling so they don't contaminate paper.\n• Never bag recyclables in plastic grocery bags."

        if intent == "WASTE_ADVICE":
            return "🗑️ Minimise waste with the 3 R's: Reduce single-use packaging, Reuse containers, and Recycle dry items. Kitchen food scraps can go into compost to create free garden fertiliser!"

        if intent == "CLIMATE_ADVICE":
            return "🌍 Every small choice counts: use renewable solar power, reduce avoidable car trips, eat more plant-based meals, and keep organic food scraps out of landfills."

        if intent == "FOOD_ADVICE":
            return "🍃 Eating plant-based meals even 1–2 days a week cuts your food emissions by up to 30%. Buying local produce and composting peels makes an even bigger difference!"

        if intent == "AIR_QUALITY":
            return "🌿 Share your city or coordinates and I'll check live PM2.5 levels. On high pollution days, keep windows shut during peak traffic hours and run an air purifier indoors."

        if intent in {"TEMPERATURE", "UV", "WIND"}:
            return "🌤️ Open the Weather tab in GreenPlus or share your location for live temperature, UV index risk levels, and wind speed forecasts."

        if intent in {"CARBON_CALCULATION", "CARBON_FOOTPRINT"}:
            return "🌍 I can estimate your household carbon footprint! Use the Carbon module in the dashboard or share your monthly electricity kWh and commute distance for an instant breakdown."

        if intent == "NOTIFICATION_QUERY":
            return "🔔 You can check all recent eco-alerts in the Notification Center above. I only nudge you when there is an actionable weather or solar opportunity!"

        if intent == "COMPARISON":
            return "⚖️ Tell me which two options you want to compare (like EV vs petrol car, or solar vs grid power) and I'll break down the energy savings, cost, and climate impact!"

        if intent == "ECO_TIP":
            return "🌿 Eco Tip of the day: Turn off power strips before going to bed. Standby power accounts for 5–10% of residential electricity bills without you even knowing it!"

        if intent == "EXPLANATION":
            return "🌱 I can explain clean energy, solar net metering, water conservation, composting, EV charging, the Rio Trio treaties, or carbon footprints in plain, simple terms. What would you like to know?"

        if intent == "PREDICTION":
            return "📊 GreenPlus provides machine learning forecasts for solar generation, rainfall, air quality (PM2.5), and temperature. Check the Prediction Modules modal to see them in action!"

        return "🌿 Hi! I'm Leafy, your eco assistant. Ask me anything about saving energy, water conservation, solar power, EV charging, or climate action!"
