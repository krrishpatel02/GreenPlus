import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEco } from "../../context/EcoContext";
import Mascot from "../../componentes/common/Mascot";
import { Reveal } from "../../componentes/common/AnimatedPage";
import { motion, AnimatePresence } from "framer-motion";
import { FaLeaf, FaBolt, FaTint, FaGraduationCap, FaChevronRight, FaArrowLeft, FaChevronLeft, FaChartLine, FaShieldAlt, FaSeedling } from "react-icons/fa";
import "./LandingPage.css";

const impactSlides = [
  {
    eyebrow: "Your week in motion",
    title: "Small choices compound.",
    detail: "Track the quiet wins that add up to a lighter footprint.",
    value: "18.4 kg",
    label: "CO2 avoided this week",
    color: "mint",
  },
  {
    eyebrow: "Community pulse",
    title: "Good habits travel.",
    detail: "See how your daily actions move the collective score forward.",
    value: "2,840",
    label: "eco actions logged today",
    color: "sun",
  },
  {
    eyebrow: "Level up",
    title: "Progress feels better together.",
    detail: "Turn practical learning into streaks, XP, and lasting change.",
    value: "+240 XP",
    label: "ready to earn this week",
    color: "sky",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { addXp } = useEco();

  // Calculator Wizard State
  const [step, setStep] = useState(0); // 0: Intro, 1: Commute, 2: Energy, 3: Recycling, 4: Results
  const [commute, setCommute] = useState("");
  const [energySource, setEnergySource] = useState("");
  const [recycling, setRecycling] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const carouselTimer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % impactSlides.length);
    }, 5000);

    return () => window.clearInterval(carouselTimer);
  }, []);

  const changeSlide = (direction) => {
    setActiveSlide((current) => (current + direction + impactSlides.length) % impactSlides.length);
  };

  const calculateFootprint = () => {
    let base = 50;
    if (commute === "EV/Bicycle") base += 5;
    if (commute === "Public Transit") base += 15;
    if (commute === "Car") base += 45;
    if (commute === "SUV") base += 75;

    if (energySource === "Solar/Renewables") base += 5;
    if (energySource === "Mixed Grid") base += 35;
    if (energySource === "Coal/Fossil Fuel Grid") base += 70;

    if (recycling === "Always") base -= 15;
    if (recycling === "Sometimes") base -= 5;
    if (recycling === "Never") base += 20;

    return base;
  };

  const getMascotSpeech = () => {
    switch (step) {
      case 0:
        return "Hey there! I'm Leafy. Let's calculate your baseline carbon footprint to start our green journey! 🌿";
      case 1:
        return "How do you commute most often? Cars release lots of CO2, but EVs and bikes are super clean! 🚲";
      case 2:
        return "Electricity fuels our life, but where does it come from? Clean energy makes my leaves shine! ⚡";
      case 3:
        return "Composting and recycling prevent landfills from creating greenhouse gases. How do you do? 🗑️";
      case 4:
        return "Wow! We calculated your footprint. Claim your 50 XP starter bonus and let's start improving together! 🎉";
      default:
        return "Together, we can cut down carbon emissions!";
    }
  };

  const handleStartApp = () => {
    // Grant XP bonus for taking the quiz
    addXp(50);
    navigate("/dashboard");
  };

  return (
    <div className="landing-page min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero Section (Clean like Apple, Modern like Tesla) */}
      <section className="landing-hero relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Abstract glowing backgrounds */}
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <span className="hero-kicker inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-6 border border-emerald-100">
            <FaLeaf className="text-emerald-500 animate-spin" style={{ animationDuration: "8s" }} /> Smart Eco-Gamification
          </span>
          <h1 className="hero-title text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-8 font-sans">
            Tracking Carbon, <br />
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              Growing Habits.
            </span>
          </h1>
          <div className="hero-signal-row" aria-label="GreenPlus capabilities">
            <span><FaChartLine /> Live footprint</span>
            <span><FaSeedling /> Habit streaks</span>
            <span><FaShieldAlt /> Local rewards</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setStep(1);
                const el = document.getElementById("calculator-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:shadow-none active:translate-y-1 transition-all flex items-center gap-3 cursor-pointer text-base"
            >
              Calculate Your Footprint <FaChevronRight className="text-sm" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer text-base"
            >
              Sign In to Account
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="impact-carousel"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={`impact-carousel__glow impact-carousel__glow--${impactSlides[activeSlide].color}`} />
          <div className="impact-carousel__topline">
            <span className="impact-live"><span /> LIVE IMPACT FEED</span>
            <div className="impact-controls">
              <button aria-label="Previous impact" onClick={() => changeSlide(-1)}><FaChevronLeft /></button>
              <button aria-label="Next impact" onClick={() => changeSlide(1)}><FaChevronRight /></button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              className="impact-carousel__content"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div>
                <p className="impact-eyebrow">{impactSlides[activeSlide].eyebrow}</p>
                <h2>{impactSlides[activeSlide].title}</h2>
                <p className="impact-detail">{impactSlides[activeSlide].detail}</p>
              </div>
              <div className="impact-value">
                <strong>{impactSlides[activeSlide].value}</strong>
                <span>{impactSlides[activeSlide].label}</span>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="impact-dots" aria-label="Impact slides">
            {impactSlides.map((slide, index) => (
              <button
                key={slide.eyebrow}
                aria-label={`Show ${slide.eyebrow}`}
                className={index === activeSlide ? "is-active" : ""}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      <motion.div
        className="floating-action-bar"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <span className="floating-status"><FaChartLine /> Carbon baseline ready</span>
        <span className="floating-divider" />
        <span className="floating-stat"><strong>3</strong> quick questions</span>
        <button onClick={() => document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" })}>
          Start now <FaChevronRight />
        </button>
      </motion.div>

      {/* Interactive Eco Calculator Section (Duolingo + Apple Style) */}
      <Reveal>
      <section id="calculator-section" className="landing-calculator py-20 bg-gray-50 border-y border-gray-100 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="landing-section-heading text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Eco-Baseline Calculator</h2>
            <p className="text-gray-500 mt-2">Get an instant carbon estimate and unlock Leafy's rewards.</p>
          </div>

          <div className="landing-calculator__panel grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-10">
            {/* Mascot advice */}
            <div className="lg:col-span-5 flex justify-center">
              <Mascot mood={step === 4 ? "celebrate" : step === 0 ? "happy" : "thinking"} speechText={getMascotSpeech()} />
            </div>

            {/* Wizard Box */}
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
                      <h3 className="text-2xl font-bold text-gray-900 font-sans">Ready to audit your carbon?</h3>
                      <p className="text-gray-500 leading-relaxed font-sans">
                        Answer 3 short questions about your travel, utility electricity, and recycling.
                        Leafy will calculate your carbon footprint and initialize your player profile.
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
                      {/* Step indicator */}
                      <div className="w-full bg-gray-100 h-2.5 rounded-full mb-6">
                        <div className="bg-emerald-500 h-2.5 rounded-full w-1/3 transition-all duration-300"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">1. What is your primary mode of travel?</h3>
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
                                : "border-gray-200 hover:border-emerald-200"
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
                      <div className="w-full bg-gray-100 h-2.5 rounded-full mb-6">
                        <div className="bg-emerald-500 h-2.5 rounded-full w-2/3 transition-all duration-300"></div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600">
                          <FaArrowLeft />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800">2. Where does your home electricity come from?</h3>
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
                                : "border-gray-200 hover:border-emerald-200"
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
                      <div className="w-full bg-gray-100 h-2.5 rounded-full mb-6">
                        <div className="bg-emerald-500 h-2.5 rounded-full w-full transition-all duration-300"></div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-600">
                          <FaArrowLeft />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800">3. Do you compost food waste and recycle regularly?</h3>
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
                                : "border-gray-200 hover:border-emerald-200"
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
                          <h4 className="text-xs uppercase font-bold text-emerald-700 tracking-wider">Weekly Carbon Footprint</h4>
                          <span className="text-4xl font-extrabold text-emerald-950 font-mono">{calculateFootprint()} kg</span>
                          <span className="text-xs block text-emerald-600 mt-1">CO₂ equivalent generated</span>
                        </div>
                        <div className="text-emerald-500 font-extrabold text-5xl">🌱</div>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed font-sans">
                        Nice work! The average baseline is around 120 kg/week. You're starting at **Level 1** with **50 Bonus XP** waiting. Get ready to log daily improvements and lower this footprint!
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

              {/* Reset button at bottom */}
              {step > 0 && step < 4 && (
                <button
                  onClick={() => setStep(0)}
                  className="mt-6 text-xs text-gray-400 hover:text-gray-600 font-semibold self-start"
                >
                  Restart Calculator
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      {/* App Features Grid (Apple-style simplicity) */}
      <Reveal>
      <section className="landing-features py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="landing-section-heading text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
            An Ecosystem of Action
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto font-sans">
            Actionable daily tracking coupled with rewards. Everything you need to live sustainably.
          </p>
        </div>

        <div className="landing-feature-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <motion.div initial={{ opacity: 0, x: -42 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.08, duration: 0.65 }} whileHover={{ y: -6 }} className="landing-feature-card landing-feature-card--side p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg mb-6">
                <FaBolt />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tesla-style Energy Logs</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Log home energy consumption and solar generation. Track your grids offsets in gorgeous real-time canvas charts.
              </p>
            </div>
            <span className="text-amber-500 text-xs font-bold uppercase tracking-wider">⚡ Energy Hub</span>
          </motion.div>

          {/* Card 2 */}
          <motion.div initial={{ opacity: 0, y: 42 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.18, duration: 0.65 }} whileHover={{ y: -6 }} className="landing-feature-card landing-feature-card--side p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg mb-6">
                <FaTint />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Water Stewardship</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Monitor and budget water conservation. Log smart appliances, shower length, and rainwater harvesting gains.
              </p>
            </div>
            <span className="text-blue-500 text-xs font-bold uppercase tracking-wider">💧 Hydration & Savings</span>
          </motion.div>

          {/* Card 3 */}
          <motion.div initial={{ opacity: 0, x: 42 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.28, duration: 0.65 }} whileHover={{ y: -6 }} className="landing-feature-card landing-feature-card--side p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between h-[300px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg mb-6">
                <FaGraduationCap />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Duolingo Gamification</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Learn green concepts with short, bite-sized quizzes. Boost your Eco Score, claim streak fire caps, and earn badges.
              </p>
            </div>
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">🌿 Learn & Level Up</span>
          </motion.div>
        </div>
      </section>
      </Reveal>

      {/* Elegant Footer */}
      <footer className="landing-footer py-12 bg-gray-900 text-gray-400 border-t border-gray-800 text-center text-sm font-sans">
        <p className="flex items-center justify-center gap-2 text-white font-bold mb-3">
          <FaLeaf className="text-emerald-500" /> GreenPlus
        </p>
        <p>© 2026 GreenPlus AI. Built with Apple clean lines and Tesla telemetry.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
