import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import { predictionApi } from "../../services/api";
import { INITIAL_QUIZZES, useEco } from "../../context/EcoContext";

const MODULES = [
  { id: "carbon", number: "01", title: "Carbon Footprint Prediction", description: "Predict your household carbon footprint from energy, travel, and lifestyle signals.", status: "Completed", icon: "🌍", action: "predict" },
  { id: "energy", number: "02", title: "Energy Consumption Prediction", description: "Estimate appliance energy use and inspect the energy workspace.", status: "In development", icon: "⚡", action: "energy", tab: "energy" },
  { id: "water", number: "03", title: "Water Consumption Prediction", description: "Estimate household water use and generate conservation recommendations.", status: "Build", icon: "💧", action: "water", tab: "water" },
  { id: "actions", number: "04", title: "Green Action Prediction", description: "Rank suitable environmental actions from the current household signals.", status: "Available", icon: "🌱", action: "actions", tab: "ai" },
  { id: "advice", number: "05", title: "Personalized Eco-Advice", description: "Rank the top three recommendations by impact, relevance, and feasibility.", status: "Available", icon: "✨", action: "advice", tab: "schemes" },
  { id: "rio-trio", number: "06", title: "Rio Trio Action Prediction", description: "Select climate, biodiversity, and land-protection actions from household signals.", status: "Available", icon: "🌍", action: "rio-trio", tab: "learning" },
  { id: "methane", number: "07", title: "Methane Emission Prediction", description: "Estimate annual household methane and avoided emissions from diet and composting inputs.", status: "Available", icon: "🐮", action: "methane", tab: "methane" },
  { id: "tutor", number: "08", title: "Green Tutor", description: "Learn climate, biodiversity, and land protection through short quizzes.", status: "Available", icon: "🎓", action: "tutor", tab: "learning" },
  { id: "realtime", number: "09", title: "Realtime Solar Forecast", description: "Predict current solar radiation from weather conditions using the trained realtime dataset model.", status: "Completed", icon: "☀️", action: "realtime" },
  { id: "uv-index", number: "10", title: "UV Index Forecast", description: "Awaiting more predictive training data before this forecast is enabled.", status: "Needs validation", icon: "🕶️", action: "uv-index" },
  { id: "wind", number: "11", title: "Wind Speed Forecast", description: "Awaiting stronger weather features before this forecast is enabled.", status: "Needs validation", icon: "🌬️", action: "wind" },
  { id: "air-quality", number: "12", title: "Air Quality Forecast", description: "Estimate current PM2.5 from live Open-Meteo air-quality observations.", status: "Completed", icon: "🌫️", action: "air-quality" },
  { id: "rainfall", number: "13", title: "Rainfall Probability", description: "Estimate the probability of a rain event from current weather conditions.", status: "Completed", icon: "🌧️", action: "rainfall" },
  { id: "temperature", number: "14", title: "Temperature Forecast", description: "Estimate current temperature from local weather conditions and time signals.", status: "Completed", icon: "🌡️", action: "temperature" },
];

const STATUS_CLASS = {
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Available: "bg-sky-50 text-sky-700 border-sky-100",
  Build: "bg-amber-50 text-amber-700 border-amber-100",
  Future: "bg-slate-100 text-slate-500 border-slate-200",
  "In development": "bg-blue-50 text-blue-700 border-blue-100",
  "Needs validation": "bg-red-50 text-red-700 border-red-100",
};

const PredictionModulesModal = ({ onClose, onOpenTab }) => {
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [form, setForm] = useState({ household_size: 3, monthly_kwh: 250, commute: "Car", recycling: "Sometimes", energy_source: "Mixed Grid" });
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [realtimeForm, setRealtimeForm] = useState({ latitude: 28.6139, longitude: 77.209 });
  const [realtimePrediction, setRealtimePrediction] = useState(null);
  const [uvIndexPrediction, setUvIndexPrediction] = useState(null);
  const [windPrediction, setWindPrediction] = useState(null);
  const [airQualityPrediction, setAirQualityPrediction] = useState(null);
  const [rainfallPrediction, setRainfallPrediction] = useState(null);
  const [temperaturePrediction, setTemperaturePrediction] = useState(null);
  const [waterForm, setWaterForm] = useState({ household_size: 3, showers_per_day: 1, shower_minutes: 8, toilet_flushes: 5, laundry_loads_week: 4, outdoor_liters_day: 20 });
  const [actionForm, setActionForm] = useState({ monthly_kwh: 250, daily_water_liters: 400, monthly_car_km: 300, solar_percent: 0, compost_kg_week: 0 });
  const [adviceForm, setAdviceForm] = useState({ monthly_kwh: 250, daily_water_liters: 400, monthly_car_km: 300, solar_percent: 0, compost_kg_week: 0 });
  const [rioForm, setRioForm] = useState({ monthly_kwh: 250, monthly_car_km: 300, solar_percent: 0, compost_kg_week: 0, food_type: "Mixed" });
  const [methaneForm, setMethaneForm] = useState({ household_size: 3, diet: "Conventional", compost_kg: 0 });
  const [moduleResult, setModuleResult] = useState(null);
  const [tutorQuiz, setTutorQuiz] = useState(null);
  const [tutorQuestionIndex, setTutorQuestionIndex] = useState(0);
  const [tutorSelectedOption, setTutorSelectedOption] = useState(null);
  const [tutorAnswered, setTutorAnswered] = useState(false);
  const [tutorScore, setTutorScore] = useState(0);
  const { completedQuizzes, completeQuiz } = useEco();

  useEffect(() => {
    predictionApi.status()
      .then((result) => setModelStatus(result.models))
      .catch((requestError) => setStatusError(requestError.message));
  }, []);

  const selectedModule = MODULES.find((module) => module.id === selectedModuleId);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setPrediction(null);
    setError("");
  };

  const predictCarbon = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await predictionApi.carbon({ ...form, household_size: Number(form.household_size), monthly_kwh: Number(form.monthly_kwh) });
      setPrediction(result.prediction);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const predictRealtime = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await predictionApi.realtime({ latitude: Number(realtimeForm.latitude), longitude: Number(realtimeForm.longitude) });
      setRealtimePrediction(result.prediction);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const predictEnvironmental = async (event, type, form, setter) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await predictionApi[type]({ latitude: Number(form.latitude), longitude: Number(form.longitude) });
      setter(result.prediction);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const predictRuleModule = async (event, type, form) => {
    event.preventDefault();
    setIsLoading(true); setError("");
    try {
      const result = await predictionApi[type](Object.fromEntries(Object.entries(form).map(([key, value]) => [key, Number.isNaN(Number(value)) ? value : Number(value)])));
      setModuleResult(result.prediction);
    } catch (requestError) { setError(requestError.message); } finally { setIsLoading(false); }
  };

  const predictWater = (event) => predictRuleModule(event, "water", waterForm);

  const updateModuleForm = (setter, event) => setter((current) => ({ ...current, [event.target.name]: event.target.value }));

  const openExistingModule = () => {
    onClose();
    onOpenTab(selectedModule.tab);
  };

  const startTutorQuiz = (quiz) => {
    setTutorQuiz(quiz);
    setTutorQuestionIndex(0);
    setTutorSelectedOption(null);
    setTutorAnswered(false);
    setTutorScore(0);
  };

  const answerTutorQuestion = (optionIndex) => {
    if (tutorAnswered) return;
    setTutorSelectedOption(optionIndex);
    setTutorAnswered(true);
    if (optionIndex === tutorQuiz.questions[tutorQuestionIndex].answer) setTutorScore((score) => score + 1);
  };

  const nextTutorQuestion = () => {
    if (tutorQuestionIndex < tutorQuiz.questions.length - 1) {
      setTutorQuestionIndex((index) => index + 1);
      setTutorSelectedOption(null);
      setTutorAnswered(false);
      return;
    }
    completeQuiz(tutorQuiz.id, ((tutorScore + (tutorSelectedOption === tutorQuiz.questions[tutorQuestionIndex].answer ? 1 : 0)) / tutorQuiz.questions.length) * 100);
    setTutorQuiz(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl md:p-8" role="dialog" aria-modal="true" aria-labelledby="modules-modal-title">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-600">GreenPlus workspace</span>
            <h2 id="modules-modal-title" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Prediction & learning modules</h2>
            <p className="mt-1 text-sm text-slate-500">Open a completed tool, try the live carbon model, or continue a module in development.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modules" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><FaTimes /></button>
        </div>
        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Realtime model validation</span>
            <span className={`rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase ${modelStatus?.realtime?.metrics?.validation === "passed" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-amber-100 bg-amber-50 text-amber-700"}`}>
              {modelStatus?.realtime?.metrics?.fit_diagnosis || "Checking..."}
            </span>
          </div>
          {modelStatus?.realtime?.metrics && <p className="mt-2 text-xs text-slate-500">Train R² {modelStatus.realtime.metrics.train_r2} · Test R² {modelStatus.realtime.metrics.test_r2} · Overfit gap {modelStatus.realtime.metrics.overfit_gap} · CV R² {modelStatus.realtime.metrics.cv_r2_mean}</p>}
          {modelStatus?.water?.metrics && <p className="mt-2 text-xs text-slate-500">Water model: {modelStatus.water.metrics.fit_diagnosis} · Test R² {modelStatus.water.metrics.test_r2} · MAE {modelStatus.water.metrics.test_mae_liters} L · CV R² {modelStatus.water.metrics.cv_r2_mean}</p>}
          {modelStatus?.green_action?.metrics && <p className="mt-2 text-xs text-slate-500">Action model: {modelStatus.green_action.metrics.fit_diagnosis} · Test R² {modelStatus.green_action.metrics.test_r2} · CV R² {modelStatus.green_action.metrics.cv_r2_mean}</p>}
          {modelStatus?.eco_advice?.metrics && <p className="mt-2 text-xs text-slate-500">Advice model: {modelStatus.eco_advice.metrics.fit_diagnosis} · Test F1 {modelStatus.eco_advice.metrics.test_f1_macro} · CV F1 {modelStatus.eco_advice.metrics.cv_f1_macro_mean}</p>}
          {modelStatus?.rio_trio?.metrics && <p className="mt-2 text-xs text-slate-500">Rio Trio model: {modelStatus.rio_trio.metrics.fit_diagnosis} · Test R² {modelStatus.rio_trio.metrics.targets_metrics?.unfccc_opportunity?.test_r2} · CV R² {modelStatus.rio_trio.metrics.cv_r2_mean}</p>}
          {modelStatus?.methane?.metrics && <p className="mt-2 text-xs text-slate-500">Methane model: {modelStatus.methane.metrics.fit_diagnosis} · Test R² {modelStatus.methane.metrics.test_r2} · CV R² {modelStatus.methane.metrics.cv_r2_mean}</p>}
          {modelStatus?.uv_index && <p className="mt-2 text-xs text-slate-500">UV model: {modelStatus.uv_index.available ? "available" : "unavailable"} · Wind model: {modelStatus.wind?.available ? "available" : "unavailable"}</p>}
                    {modelStatus?.air_quality && <span className="mt-2 text-xs text-slate-500"> · Air quality: {modelStatus.air_quality.available ? "available" : "unavailable"}</span>}
                    {modelStatus?.rainfall && <span className="mt-2 text-xs text-slate-500"> · Rainfall: {modelStatus.rainfall.available ? "available" : "unavailable"}</span>}
                    {modelStatus?.temperature && <span className="mt-2 text-xs text-slate-500"> · Temperature: {modelStatus.temperature.available ? "available" : "unavailable"}</span>}
          {statusError && <p className="mt-2 text-xs font-semibold text-amber-700">Model status unavailable: {statusError}</p>}
        </div>

        {!selectedModule ? (
          <div className="grid gap-3 md:grid-cols-2">
            {MODULES.map((module) => (
              <button key={module.id} type="button" onClick={() => { setSelectedModuleId(module.id); setPrediction(null); setModuleResult(null); setError(""); }} className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/40">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">{module.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2"><span className="font-bold text-slate-900">{module.number} · {module.title}</span><FaArrowRight className="mt-1 shrink-0 text-xs text-slate-300 transition group-hover:text-emerald-500" /></span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-500">{module.description}</span>
                    <span className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${STATUS_CLASS[module.status]}`}>{module.status}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button type="button" onClick={() => setSelectedModuleId(null)} className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-emerald-700"><FaArrowLeft /> All modules</button>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 md:p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">{selectedModule.icon}</span>
                <div><span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Module {selectedModule.number} · {selectedModule.status}</span><h3 className="mt-1 text-xl font-extrabold text-slate-900">{selectedModule.title}</h3><p className="mt-1 text-sm text-slate-500">{selectedModule.description}</p></div>
              </div>

              {selectedModule.action === "predict" ? (
                <form onSubmit={predictCarbon} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Household size<input name="household_size" type="number" min="1" required value={form.household_size} onChange={updateField} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Monthly electricity (kWh)<input name="monthly_kwh" type="number" min="0" required value={form.monthly_kwh} onChange={updateField} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Main commute<select name="commute" value={form.commute} onChange={updateField} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"><option>Car</option><option>SUV</option><option>Public Transit</option><option>EV/Bicycle</option></select></label>
                    <label className="text-xs font-bold text-slate-600">Energy source<select name="energy_source" value={form.energy_source} onChange={updateField} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"><option>Mixed Grid</option><option>Solar/Renewables</option><option>Coal/Fossil Fuel Grid</option></select></label>
                  </div>
                  <label className="block text-xs font-bold text-slate-600">Recycling frequency<select name="recycling" value={form.recycling} onChange={updateField} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"><option>Always</option><option>Sometimes</option><option>Never</option></select></label>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Calculating..." : "Predict carbon footprint"}</button>
                  {prediction !== null && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center"><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Estimated footprint</span><strong className="mt-1 block text-3xl font-extrabold text-emerald-950">{prediction} kg CO₂e</strong></div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "realtime" ? (
                <form onSubmit={predictRealtime} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Latitude<input name="latitude" type="number" step="0.0001" min="-90" max="90" required value={realtimeForm.latitude} onChange={(event) => setRealtimeForm((current) => ({ ...current, latitude: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Longitude<input name="longitude" type="number" step="0.0001" min="-180" max="180" required value={realtimeForm.longitude} onChange={(event) => setRealtimeForm((current) => ({ ...current, longitude: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Loading weather and predicting..." : "Predict current solar radiation"}</button>
                  {realtimePrediction && <div className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center sm:grid-cols-2"><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Predicted radiation</span><strong className="mt-1 block text-2xl font-extrabold text-emerald-950">{realtimePrediction.shortwave_radiation_w_m2} W/m²</strong></div><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Observed at</span><strong className="mt-1 block text-sm font-bold text-emerald-950">{realtimePrediction.observed_at}</strong></div></div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "uv-index" ? (
                <form onSubmit={(event) => predictEnvironmental(event, "uvIndex", realtimeForm, setUvIndexPrediction)} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Latitude<input name="latitude" type="number" step="0.0001" min="-90" max="90" required value={realtimeForm.latitude} onChange={(event) => setRealtimeForm((current) => ({ ...current, latitude: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Longitude<input name="longitude" type="number" step="0.0001" min="-180" max="180" required value={realtimeForm.longitude} onChange={(event) => setRealtimeForm((current) => ({ ...current, longitude: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Loading forecast..." : "Predict today's UV index"}</button>
                  {uvIndexPrediction && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center"><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Forecast UV index</span><strong className="mt-1 block text-3xl font-extrabold text-emerald-950">{uvIndexPrediction.uv_index}</strong><span className="mt-1 block text-xs text-emerald-700">{uvIndexPrediction.forecast_date}</span></div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "wind" ? (
                <form onSubmit={(event) => predictEnvironmental(event, "wind", realtimeForm, setWindPrediction)} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Latitude<input name="latitude" type="number" step="0.0001" min="-90" max="90" required value={realtimeForm.latitude} onChange={(event) => setRealtimeForm((current) => ({ ...current, latitude: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Longitude<input name="longitude" type="number" step="0.0001" min="-180" max="180" required value={realtimeForm.longitude} onChange={(event) => setRealtimeForm((current) => ({ ...current, longitude: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Loading weather..." : "Predict current wind speed"}</button>
                  {windPrediction && <div className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center sm:grid-cols-2"><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Predicted wind</span><strong className="mt-1 block text-2xl font-extrabold text-emerald-950">{windPrediction.wind_speed_kmh} km/h</strong></div><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Observed at</span><strong className="mt-1 block text-sm font-bold text-emerald-950">{windPrediction.observed_at}</strong></div></div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : ["air-quality", "rainfall", "temperature"].includes(selectedModule.action) ? (
                <form onSubmit={(event) => predictEnvironmental(event, selectedModule.action === "air-quality" ? "airQuality" : selectedModule.action, realtimeForm, selectedModule.action === "air-quality" ? setAirQualityPrediction : selectedModule.action === "rainfall" ? setRainfallPrediction : setTemperaturePrediction)} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Latitude<input name="latitude" type="number" step="0.0001" min="-90" max="90" required value={realtimeForm.latitude} onChange={(event) => setRealtimeForm((current) => ({ ...current, latitude: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Longitude<input name="longitude" type="number" step="0.0001" min="-180" max="180" required value={realtimeForm.longitude} onChange={(event) => setRealtimeForm((current) => ({ ...current, longitude: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Loading weather..." : `Predict ${selectedModule.title.toLowerCase()}`}</button>
                  {airQualityPrediction && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center"><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Estimated PM2.5</span><strong className="mt-1 block text-3xl font-extrabold text-emerald-950">{airQualityPrediction.pm2_5_ug_m3} µg/m³</strong></div>}
                  {rainfallPrediction && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center"><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Rain probability</span><strong className="mt-1 block text-3xl font-extrabold text-emerald-950">{rainfallPrediction.rain_probability_percent}%</strong></div>}
                  {temperaturePrediction && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center"><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Estimated temperature</span><strong className="mt-1 block text-3xl font-extrabold text-emerald-950">{temperaturePrediction.temperature_celsius} °C</strong></div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "water" ? (
                <form onSubmit={predictWater} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Household size<input name="household_size" type="number" min="1" required value={waterForm.household_size} onChange={(event) => updateModuleForm(setWaterForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Showers per person/day<input name="showers_per_day" type="number" min="0" required value={waterForm.showers_per_day} onChange={(event) => updateModuleForm(setWaterForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Minutes per shower<input name="shower_minutes" type="number" min="0" required value={waterForm.shower_minutes} onChange={(event) => updateModuleForm(setWaterForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Toilet flushes/person/day<input name="toilet_flushes" type="number" min="0" required value={waterForm.toilet_flushes} onChange={(event) => updateModuleForm(setWaterForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Laundry loads/week<input name="laundry_loads_week" type="number" min="0" required value={waterForm.laundry_loads_week} onChange={(event) => updateModuleForm(setWaterForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Outdoor water litres/day<input name="outdoor_liters_day" type="number" min="0" required value={waterForm.outdoor_liters_day} onChange={(event) => updateModuleForm(setWaterForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Predicting..." : "Predict household water use"}</button>
                  {moduleResult && <div className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center sm:grid-cols-3"><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Daily use</span><strong className="mt-1 block text-2xl font-extrabold text-emerald-950">{moduleResult.daily_liters} L</strong></div><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Weekly use</span><strong className="mt-1 block text-2xl font-extrabold text-emerald-950">{moduleResult.weekly_liters} L</strong></div><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Model</span><strong className="mt-1 block text-sm font-bold text-emerald-950">{moduleResult.model}</strong></div></div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "actions" ? (
                <form onSubmit={(event) => predictRuleModule(event, "actions", actionForm)} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Monthly electricity (kWh)<input name="monthly_kwh" type="number" min="0" required value={actionForm.monthly_kwh} onChange={(event) => updateModuleForm(setActionForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Daily water use (litres)<input name="daily_water_liters" type="number" min="0" required value={actionForm.daily_water_liters} onChange={(event) => updateModuleForm(setActionForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Monthly car travel (km)<input name="monthly_car_km" type="number" min="0" required value={actionForm.monthly_car_km} onChange={(event) => updateModuleForm(setActionForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Solar electricity share (%)<input name="solar_percent" type="number" min="0" max="100" required value={actionForm.solar_percent} onChange={(event) => updateModuleForm(setActionForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600 sm:col-span-2">Food composted per week (kg)<input name="compost_kg_week" type="number" min="0" required value={actionForm.compost_kg_week} onChange={(event) => updateModuleForm(setActionForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Ranking actions..." : "Recommend green actions"}</button>
                  {moduleResult?.actions && <div className="space-y-3">{moduleResult.actions.map((action, index) => <div key={action.action} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><strong className="text-sm font-extrabold text-emerald-950">{action.action}</strong><span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] font-extrabold uppercase text-emerald-700">{action.difficulty}</span></div><p className="mt-1 text-xs leading-relaxed text-emerald-800">{action.reason}</p><span className="mt-2 block text-[11px] font-bold uppercase tracking-wide text-emerald-600">Impact: {action.impact}</span></div></div></div>)}</div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "advice" ? (
                <form onSubmit={(event) => predictRuleModule(event, "advice", adviceForm)} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Monthly electricity (kWh)<input name="monthly_kwh" type="number" min="0" required value={adviceForm.monthly_kwh} onChange={(event) => updateModuleForm(setAdviceForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Daily water use (litres)<input name="daily_water_liters" type="number" min="0" required value={adviceForm.daily_water_liters} onChange={(event) => updateModuleForm(setAdviceForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Monthly car travel (km)<input name="monthly_car_km" type="number" min="0" required value={adviceForm.monthly_car_km} onChange={(event) => updateModuleForm(setAdviceForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Solar electricity share (%)<input name="solar_percent" type="number" min="0" max="100" required value={adviceForm.solar_percent} onChange={(event) => updateModuleForm(setAdviceForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600 sm:col-span-2">Food composted per week (kg)<input name="compost_kg_week" type="number" min="0" required value={adviceForm.compost_kg_week} onChange={(event) => updateModuleForm(setAdviceForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Personalizing advice..." : "Select personalized recommendations"}</button>
                  {moduleResult?.recommendations && <div className="space-y-3">{moduleResult.recommendations.map((recommendation, index) => <div key={recommendation.action} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><strong className="text-sm font-extrabold text-emerald-950">{recommendation.action}</strong><span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] font-extrabold uppercase text-emerald-700">Score {recommendation.score}</span></div><p className="mt-1 text-xs leading-relaxed text-emerald-800">{recommendation.reason}</p><span className="mt-2 block text-[11px] font-bold uppercase tracking-wide text-emerald-600">{recommendation.impact} · {recommendation.difficulty}</span></div></div></div>)}</div>}
                  {moduleResult?.predicted_impact_level && <p className="text-xs font-semibold text-slate-500">Predicted household impact: {moduleResult.predicted_impact_level}</p>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "rio-trio" ? (
                <form onSubmit={(event) => predictRuleModule(event, "rioTrio", rioForm)} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Monthly electricity (kWh)<input name="monthly_kwh" type="number" min="0" required value={rioForm.monthly_kwh} onChange={(event) => updateModuleForm(setRioForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Monthly car travel (km)<input name="monthly_car_km" type="number" min="0" required value={rioForm.monthly_car_km} onChange={(event) => updateModuleForm(setRioForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Solar electricity share (%)<input name="solar_percent" type="number" min="0" max="100" required value={rioForm.solar_percent} onChange={(event) => updateModuleForm(setRioForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Compost per week (kg)<input name="compost_kg_week" type="number" min="0" required value={rioForm.compost_kg_week} onChange={(event) => updateModuleForm(setRioForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600 sm:col-span-2">Food pattern<select name="food_type" value={rioForm.food_type} onChange={(event) => updateModuleForm(setRioForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"><option>Mixed</option><option>Non-Veg</option><option>Vegetarian</option><option>Vegan</option></select></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Selecting treaty actions..." : "Predict Rio Trio actions"}</button>
                  {moduleResult?.actions && <div className="space-y-3">{moduleResult.actions.map((action, index) => <div key={action.treaty} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><strong className="text-sm font-extrabold text-emerald-950">{action.action}</strong><span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] font-extrabold uppercase text-emerald-700">{action.treaty} · {action.score}</span></div><p className="mt-1 text-xs font-bold text-emerald-700">{action.domain}</p><p className="mt-1 text-xs leading-relaxed text-emerald-800">{action.reason}</p></div></div></div>)}</div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "methane" ? (
                <form onSubmit={(event) => predictRuleModule(event, "methane", methaneForm)} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-600">Household size<input name="household_size" type="number" min="1" required value={methaneForm.household_size} onChange={(event) => updateModuleForm(setMethaneForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                    <label className="text-xs font-bold text-slate-600">Diet pattern<select name="diet" value={methaneForm.diet} onChange={(event) => updateModuleForm(setMethaneForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"><option>Conventional</option><option>Vegetarian</option><option>Plant-Based</option></select></label>
                    <label className="text-xs font-bold text-slate-600 sm:col-span-2">Compost per week (kg)<input name="compost_kg" type="number" min="0" required value={methaneForm.compost_kg} onChange={(event) => updateModuleForm(setMethaneForm, event)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" /></label>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{isLoading ? "Estimating methane..." : "Predict methane emissions"}</button>
                  {moduleResult?.estimated_annual_methane_kg !== undefined && <div className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center sm:grid-cols-3"><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Annual baseline</span><strong className="mt-1 block text-2xl font-extrabold text-emerald-950">{moduleResult.estimated_annual_methane_kg} kg</strong></div><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Avoided methane</span><strong className="mt-1 block text-2xl font-extrabold text-emerald-950">{moduleResult.avoided_kg_ch4} kg</strong></div><div><span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Baseline model</span><strong className="mt-1 block text-sm font-bold text-emerald-950">{moduleResult.predicted_baseline_tonnes_per_person} t/person</strong></div></div>}
                  {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
                </form>
              ) : selectedModule.action === "tutor" ? (
                <div className="mt-6 space-y-4">
                  {!tutorQuiz ? <div className="grid gap-3">{INITIAL_QUIZZES.map((quiz) => <div key={quiz.id} className="flex flex-col gap-3 rounded-xl border border-white bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="block text-sm font-extrabold text-slate-900">{quiz.title}</strong><span className="mt-1 block text-xs text-slate-500">{quiz.questions.length} questions · {quiz.difficulty} · +{quiz.xp} XP {completedQuizzes.includes(quiz.id) ? "· Completed" : ""}</span></div><button type="button" onClick={() => startTutorQuiz(quiz)} className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-400">{completedQuizzes.includes(quiz.id) ? "Retake quiz" : "Start quiz"}</button></div>)}</div> : <div className="rounded-xl border border-white bg-white p-5"><div className="flex items-center justify-between text-xs font-extrabold text-slate-400"><span>{tutorQuiz.title}</span><span>Question {tutorQuestionIndex + 1} of {tutorQuiz.questions.length}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((tutorQuestionIndex + 1) / tutorQuiz.questions.length) * 100}%` }} /></div><h4 className="mt-5 text-lg font-extrabold leading-relaxed text-slate-900">{tutorQuiz.questions[tutorQuestionIndex].question}</h4><div className="mt-4 space-y-2">{tutorQuiz.questions[tutorQuestionIndex].options.map((option, index) => { const correct = index === tutorQuiz.questions[tutorQuestionIndex].answer; const selected = index === tutorSelectedOption; const style = !tutorAnswered ? selected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300" : correct ? "border-emerald-500 bg-emerald-50 text-emerald-950" : selected ? "border-red-500 bg-red-50 text-red-950" : "border-slate-100 opacity-60"; return <button key={option} type="button" disabled={tutorAnswered} onClick={() => answerTutorQuestion(index)} className={`w-full rounded-xl border-2 p-3 text-left text-xs font-bold transition ${style}`}>{option}{tutorAnswered && correct && <span className="float-right text-emerald-600">Correct</span>}{tutorAnswered && selected && !correct && <span className="float-right text-red-600">Incorrect</span>}</button>; })}</div>{tutorAnswered && <button type="button" onClick={nextTutorQuestion} className="mt-5 w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-white transition hover:bg-emerald-400">{tutorQuestionIndex < tutorQuiz.questions.length - 1 ? "Next question" : "Finish quiz"}</button>}</div>}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-white bg-white p-4">
                  <p className="text-sm leading-relaxed text-slate-600">This module is available through the existing GreenPlus workspace. Open it to continue with its tracker, assistant, recommendations, or lessons.</p>
                  <button type="button" onClick={openExistingModule} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-emerald-400">Open module <FaArrowRight /></button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionModulesModal;