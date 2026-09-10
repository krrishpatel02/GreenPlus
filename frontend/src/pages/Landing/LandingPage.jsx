import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEco } from "../../context/EcoContext";
import Mascot from "../../componentes/common/Mascot";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaBolt, FaBrain, FaChevronLeft, FaChevronRight, FaGraduationCap, FaLeaf, FaTint } from "react-icons/fa";
import { predictionApi } from "../../services/api";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const { addXp } = useEco();

  // Calculator Wizard State
  const [step, setStep] = useState(0); // 0: Intro, 1: Commute, 2: Energy, 3: Recycling, 4: Results
  const [commute, setCommute] = useState("");
  const [energySource, setEnergySource] = useState("");
  const [recycling, setRecycling] = useState("");
  const [mlFootprint, setMlFootprint] = useState(null);
  const [impactIndex, setImpactIndex] = useState(0);
  const [activeSignal, setActiveSignal] = useState("total");
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    if (showQuestions) {
      requestAnimationFrame(() => {
        document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [showQuestions]);

  const signalSummaries = {
    energy: { label: "energy orbit", value: commute ? "mapped" : "01", detail: commute || "transport signal" },
    water: { label: "water orbit", value: energySource ? "mapped" : "02", detail: energySource || "home utility signal" },
    total: { label: "total orbit", value: mlFootprint || "03", detail: mlFootprint ? "kg CO2e baseline" : "three signals to go" },
  };

  const impacts = [
    { eyebrow: "Energy intelligence", title: "Make every watt count.", detail: "See where your household energy goes and turn useful patterns into lower-impact routines.", value: "-18%", label: "potential energy waste" },
    { eyebrow: "Water stewardship", title: "Catch the invisible leaks.", detail: "Track water habits before small daily losses become a large monthly footprint.", value: "42 L", label: "average daily saving" },
    { eyebrow: "Habit momentum", title: "Small choices compound.", detail: "Quests and feedback keep sustainable actions visible, measurable, and rewarding.", value: "+50 XP", label: "starter momentum" },
  ];

  const currentImpact = impacts[impactIndex];

  // Query Python Flask ML API (ai/carbon/carbon_model_v3.joblib)
  useEffect(() => {
    if (step === 4) {
      predictionApi.carbon({
          commute,
          energy_source: energySource,
          recycling,
          monthly_kwh: 260,
          diet_type: "Omnivore",
      })
        .then((data) => {
          setMlFootprint(data.prediction?.carbon_emission_kg ?? null);
        })
        .catch(() => setMlFootprint(null));
    }
  }, [step, commute, energySource, recycling]);

  const getMascotSpeech = () => {
    switch (step) {
      case 0:
        return "Hey there! I'm Leafy. Let's calculate your baseline carbon footprint using our trained ML model! 🌿";
      case 1:
        return "How do you commute most often? Cars release lots of CO2, but EVs and bikes are super clean! 🚲";
      case 2:
        return "Electricity fuels our life, but where does it come from? Clean energy makes my leaves shine! ⚡";
      case 3:
        return "Composting and recycling prevent landfills from creating greenhouse gases. How do you do? 🗑️";
      case 4:
        return "Our Random Forest ML Model (v3) calculated your footprint! Claim your 50 XP starter bonus and let's start improving together! 🎉";
      default:
        return "Together, we can cut down carbon emissions!";
    }
  };

  const handleStartApp = () => {
    addXp(50);
    navigate("/dashboard");
  };

  const moveImpact = (direction) => {
    setImpactIndex((current) => (current + direction + impacts.length) % impacts.length);
  };

  const selectImpact = (index) => {
    setImpactIndex(index);
    setActiveSignal(index === 0 ? "energy" : index === 1 ? "water" : "total");
  };

  const selectSignal = (signal, index) => {
    setActiveSignal(signal);
    setImpactIndex(index);
  };

  return (
    <div className="landing-page min-h-screen">
      {/* Hero Section */}
      <section className="landing-hero relative px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl hero-actions"
        >
          <div className="hero-brand-lockup"><span className="hero-brand-name"><FaLeaf className="hero-brand-icon" /> GreenPlus</span><span className="hero-kicker">Your household impact, in orbit</span></div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5">Live lighter.<br /><span>Stay in motion.</span></h1>
          <p className="max-w-2xl mx-auto mb-4 leading-relaxed font-light">A calm, intelligent companion for turning everyday energy, water, and waste decisions into lasting momentum.</p>
          <div className={`hero-orbit-dashboard ${step > 0 ? "has-selection" : ""}`} aria-label="GreenPlus impact orbit">
            <span className="orbit-ring orbit-ring--outer" /><span className="orbit-ring orbit-ring--inner" />
            <div className="orbit-core"><span>{signalSummaries[activeSignal].label}</span><strong>{signalSummaries[activeSignal].value}</strong><small>{signalSummaries[activeSignal].detail}</small></div>
            <span className="orbit-satellite orbit-satellite--energy"><button className={`orbit-node orbit-node--energy ${activeSignal === "energy" ? "is-selected" : ""}`} onClick={() => selectSignal("energy", 0)}><FaBolt /><span>Energy<br /><b>{commute ? "mapped" : "map it"}</b></span></button></span>
            <span className="orbit-satellite orbit-satellite--water"><button className={`orbit-node orbit-node--water ${activeSignal === "water" ? "is-selected" : ""}`} onClick={() => selectSignal("water", 1)}><FaTint /><span>Water<br /><b>{energySource ? "tracked" : "track it"}</b></span></button></span>
            <span className="orbit-satellite orbit-satellite--habit"><button className={`orbit-node orbit-node--habit ${activeSignal === "total" ? "is-selected" : ""}`} onClick={() => selectSignal("total", 2)}><FaLeaf /><span>Total<br /><b>{recycling ? "in motion" : "begin"}</b></span></button></span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowQuestions(true);
                setStep(1);
              }}
              className="px-7 py-3 bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer text-sm"
            >
              Find my baseline <FaChevronRight className="text-sm" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/login")}
              className="px-7 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-sm"
            >
              Enter GreenPlus
            </motion.button>
          </div>
        </motion.div>
        <div className="impact-carousel">
          <div className={`impact-carousel__glow impact-carousel__glow--${impactIndex === 0 ? "mint" : impactIndex === 1 ? "sky" : "sun"}`} />
          <div className="impact-carousel__topline"><span className="impact-live"><span /> Orbit signals live</span><div className="impact-controls"><button onClick={() => moveImpact(-1)} aria-label="Previous impact"><FaChevronLeft /></button><button onClick={() => moveImpact(1)} aria-label="Next impact"><FaChevronRight /></button></div></div>
          <AnimatePresence mode="wait"><motion.div key={impactIndex} className="impact-carousel__content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><div><span className="impact-eyebrow">{currentImpact.eyebrow}</span><h2>{currentImpact.title}</h2><p className="impact-detail">{currentImpact.detail}</p></div><div className="impact-value"><strong>{currentImpact.value}</strong><span>{currentImpact.label}</span></div></motion.div></AnimatePresence>
          <div className="impact-dots">{impacts.map((impact, index) => <button key={impact.eyebrow} className={index === impactIndex ? "is-active" : ""} onClick={() => setImpactIndex(index)} aria-label={`Show ${impact.eyebrow}`} />)}</div>
        </div>
      </section>

      <section className="landing-orbit-section">
        <div className="action-orbit-section">
          <div className="action-orbit-copy">
            <span className="section-kicker">The green loop</span>
            <AnimatePresence mode="wait">
              <motion.div key={impactIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <h2>{currentImpact.title.replace(".", "")}.<br />Moves the system.</h2>
                <p>{currentImpact.detail}</p>
              </motion.div>
            </AnimatePresence>
            <button onClick={() => { setShowQuestions(true); setStep(1); }}>Enter your orbit <FaChevronRight /></button>
          </div>
          <div className="action-orbit-visual" aria-label="Choose an impact signal">
            <div className="action-orbit-planet"><FaLeaf /></div>
            <div className="action-orbit-track action-orbit-track--one"><button className={`action-orbit-signal ${impactIndex === 0 ? "is-selected" : ""}`} onClick={() => selectImpact(0)} aria-label="Energy signal"><FaBolt /></button></div>
            <div className="action-orbit-track action-orbit-track--two"><button className={`action-orbit-signal ${impactIndex === 1 ? "is-selected" : ""}`} onClick={() => selectImpact(1)} aria-label="Water signal"><FaTint /></button></div>
            <div className="action-orbit-track action-orbit-track--three"><button className={`action-orbit-signal ${impactIndex === 2 ? "is-selected" : ""}`} onClick={() => selectImpact(2)} aria-label="Total habit signal"><FaLeaf /></button></div>
          </div>
        </div>
      </section>

      {/* Interactive Eco Calculator Section */}
      {showQuestions && <section id="calculator-section" className="landing-calculator py-20 border-y border-slate-100 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="landing-section-heading text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Real ML Carbon Footprint Predictor</h2>
            <p className="text-slate-500 mt-2">Powered by Random Forest ML v3 (trained on household dataset).</p>
          </div>

          <div className="landing-calculator__panel grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border p-6 md:p-10">
            <div className="lg:col-span-5 flex justify-center">
              <Mascot mood={step === 4 ? "celebrate" : step === 0 ? "happy" : "thinking"} speechText={getMascotSpeech()} />
            </div>

            <div className="lg:col-span-7 min-h-[340px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-slate-900 font-sans">Ready to test the ML Model?</h3>
                      <p className="text-slate-500 leading-relaxed font-sans">
                        Answer 3 short questions about your travel, utility electricity, and recycling.
                        Leafy will feed these inputs directly to our Python Flask ML Inference server.
                      </p>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-4 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:shadow-none active:translate-y-1 transition-all cursor-pointer"
                      >
                        Start Questions
                      </button>
                    </div>
                  )}

                  {step === 1 && (
                    <div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full mb-6">
                        <div className="bg-emerald-500 h-2.5 rounded-full w-1/3 transition-all duration-300"></div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-4">1. What is your primary mode of travel?</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["EV/Bicycle", "Public Transit", "Car", "SUV"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setCommute(opt);
                              setStep(2);
                            }}
                            className={`p-4 rounded-2xl border-2 text-left font-semibold transition-all cursor-pointer ${
                              commute === opt
                                ? "border-emerald-500 bg-emerald-50/50 text-emerald-800"
                                : "border-slate-200 hover:border-emerald-200"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full mb-6">
                        <div className="bg-emerald-500 h-2.5 rounded-full w-2/3 transition-all duration-300"></div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600">
                          <FaArrowLeft />
                        </button>
                        <h3 className="text-xl font-bold text-slate-800">2. Where does your home electricity come from?</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {["Solar/Renewables", "Mixed Grid", "Coal/Fossil Fuel Grid"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setEnergySource(opt);
                              setStep(3);
                            }}
                            className={`p-4 rounded-2xl border-2 text-left font-semibold transition-all cursor-pointer ${
                              energySource === opt
                                ? "border-emerald-500 bg-emerald-50/50 text-emerald-800"
                                : "border-slate-200 hover:border-emerald-200"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full mb-6">
                        <div className="bg-emerald-500 h-2.5 rounded-full w-full transition-all duration-300"></div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-600">
                          <FaArrowLeft />
                        </button>
                        <h3 className="text-xl font-bold text-slate-800">3. Do you compost food waste and recycle regularly?</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {["Always", "Sometimes", "Never"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setRecycling(opt);
                              setStep(4);
                            }}
                            className={`p-4 rounded-2xl border-2 text-center font-semibold transition-all cursor-pointer ${
                              recycling === opt
                                ? "border-emerald-500 bg-emerald-50/50 text-emerald-800"
                                : "border-slate-200 hover:border-emerald-200"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                            <FaBrain /> ML Model v3 Output (Joblib)
                          </div>
                          {mlFootprint === null ? (
                            <span className="text-2xl font-bold text-emerald-800 animate-pulse">Running Inference...</span>
                          ) : (
                            <span className="text-4xl font-extrabold text-emerald-950 font-mono">{mlFootprint} kg</span>
                          )}
                          <span className="text-xs block text-emerald-600 mt-1">CO₂ equivalent predicted via Random Forest</span>
                        </div>
                        <div className="text-emerald-500 font-extrabold text-5xl">🌱</div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed font-sans">
                        Predicted via **GreenPlus Carbon AI v3**. You're starting at **Level 1** with **50 Bonus XP** waiting. Get ready to log daily improvements and lower this footprint!
                      </p>
                      <button
                        onClick={handleStartApp}
                        className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:shadow-none active:translate-y-1 transition-all cursor-pointer text-center"
                      >
                        Claim 50 XP & Go to Dashboard
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {step > 0 && step < 4 && (
                <button
                  onClick={() => setStep(0)}
                  className="mt-6 text-xs text-slate-400 hover:text-slate-600 font-semibold self-start"
                >
                  Restart Calculator
                </button>
              )}
            </div>
          </div>
        </div>
      </section>}

      {/* App Features Grid */}
      <section className="landing-features py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            An Ecosystem of Research & Action
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto font-sans">
            Actionable daily tracking supported by 20+ peer-reviewed climate literature papers.
          </p>
        </div>

        <div className="landing-feature-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="landing-feature-card p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg mb-6">
                <FaBolt />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tesla-style Energy Logs</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Log home energy consumption and solar generation. Track grid offsets in real-time charts powered by ML energy forecasting.
              </p>
            </div>
            <span className="text-amber-500 text-xs font-bold uppercase tracking-wider">⚡ Energy & XAI Hub</span>
          </div>

          <div className="landing-feature-card landing-feature-card--side p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg mb-6">
                <FaTint />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Water Stewardship & Sensors</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Monitor water conservation with smart IoT anomaly alerts and disaggregated outlet-level tracking.
              </p>
            </div>
            <span className="text-blue-500 text-xs font-bold uppercase tracking-wider">💧 Hydration & Leak Alerts</span>
          </div>

          <div className="landing-feature-card p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg mb-6">
                <FaGraduationCap />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Rio Trio & Duolingo Quizzes</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Learn environmental concepts (UNFCCC Climate, CBD Biodiversity, UNCCD Desertification) with bite-sized quizzes.
              </p>
            </div>
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">🌿 Learn & Level Up</span>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="landing-footer py-12 text-slate-400 border-t border-slate-800 text-center text-sm font-sans">
        <p className="flex items-center justify-center gap-2 text-white font-bold mb-3">
          <FaLeaf className="text-emerald-500" /> GreenPlus AI
        </p>
        <p>© 2026 GreenPlus. Integrated with Python ML Inference Engine & Research Literature Review.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
