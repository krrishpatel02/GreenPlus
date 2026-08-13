import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEco } from "../../context/EcoContext";
import Mascot from "../../componentes/common/Mascot";
import { motion, AnimatePresence } from "framer-motion";
import { FaLeaf, FaBolt, FaTint, FaGraduationCap, FaChevronRight, FaArrowLeft } from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();
  const { addXp } = useEco();

  // Calculator Wizard State
  const [step, setStep] = useState(0); // 0: Intro, 1: Commute, 2: Energy, 3: Recycling, 4: Results
  const [commute, setCommute] = useState("");
  const [energySource, setEnergySource] = useState("");
  const [recycling, setRecycling] = useState("");

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
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero Section (Clean like Apple, Modern like Tesla) */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Abstract glowing backgrounds */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-200/40 to-blue-200/40 filter blur-3xl rounded-full -z-10 animate-pulse"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-6 border border-emerald-100">
            <FaLeaf className="text-emerald-500 animate-spin" style={{ animationDuration: "8s" }} /> Smart Eco-Gamification
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-8 font-sans">
            Tracking Carbon, <br />
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              Growing Habits.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-light">
            GreenPlus makes eco-friendly living rewarding. Track daily electricity & water savings, learn with byte-sized quests, and unlock regional rebates.
          </p>

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
      </section>

      {/* Interactive Eco Calculator Section (Duolingo + Apple Style) */}
      <section id="calculator-section" className="py-20 bg-gray-50 border-y border-gray-100 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Eco-Baseline Calculator</h2>
            <p className="text-gray-500 mt-2">Get an instant carbon estimate and unlock Leafy's rewards.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-10">
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

      {/* App Features Grid (Apple-style simplicity) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
            An Ecosystem of Action
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto font-sans">
            Actionable daily tracking coupled with rewards. Everything you need to live sustainably.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between h-[300px]">
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
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between h-[300px]">
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
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between h-[300px]">
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
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400 border-t border-gray-800 text-center text-sm font-sans">
        <p className="flex items-center justify-center gap-2 text-white font-bold mb-3">
          <FaLeaf className="text-emerald-500" /> GreenPlus
        </p>
        <p>© 2026 GreenPlus AI. Built with Apple clean lines and Tesla telemetry.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
