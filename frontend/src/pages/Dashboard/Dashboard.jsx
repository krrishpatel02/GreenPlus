import { useState, useEffect, useRef } from "react";
import { useEco } from "../../context/EcoContext";
import TeslaChart from "../../componentes/ui/TeslaChart";
import DashboardSidebar from "../../componentes/dashboard/DashboardSidebar";
import DashboardOverview from "../../componentes/dashboard/DashboardOverview";
import useDashboardNavigation from "../../hooks/useDashboardNavigation";
import useDashboardMetrics from "../../hooks/useDashboardMetrics.jsx";
import useDashboardFilters from "../../hooks/useDashboardFilters";
import useRealtimeConnection from "../../hooks/useRealtimeConnection";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaFolder,
  FaBolt,
  FaTint,
  FaGraduationCap,
  FaBookmark,
  FaDatabase,
  FaAngleRight,
  FaShareSquare,
  FaSearch,
  FaFilter,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./Dashboard.css";

const RESEARCH_MODULES = [
  {
    number: "01",
    title: "Carbon Footprint Model",
    summary: "Limited-feature machine learning can estimate household emissions without a full lifecycle assessment.",
    sources: [
      ["Tackling Climate Change with Machine Learning", "https://arxiv.org/abs/1906.05433"],
      ["Efficient Data-Driven Prediction of Household Carbon Footprint", "https://www.sciencedirect.com/science/article/abs/pii/S0301421523005116"],
      ["Aligning Artificial Intelligence with Climate Change Mitigation", "https://doi.org/10.1038/s41558-022-01377-7"],
      ["Achieving Sustainable Practices with Semi-Supervised Learning", "https://link.springer.com/article/10.1007/s10668-024-05578-2"],
    ],
  },
  {
    number: "02",
    title: "Energy Recommendation",
    summary: "Energy prediction becomes more actionable when models explain the household factors behind each recommendation.",
    sources: [
      ["A Machine Learning-Powered Energy Consumption Prediction System with API", "https://jesit.springeropen.com/articles/10.1186/s43067-025-00242-9"],
      ["Personalized Residential Energy Usage Recommendation System", "https://ieeexplore.ieee.org/document/9078031/"],
      ["Machine Learning Algorithms for Energy Consumption Prediction in Smart Homes", "https://link.springer.com/chapter/10.1007/978-3-031-80817-3_5"],
      ["Optimizing Daily Household Energy Consumption with Explainable AI", "https://journal.aptika.org/index.php/jistics/article/view/224"],
    ],
  },
  {
    number: "03",
    title: "Water Recommendation",
    summary: "IoT outlet data and interpretable models support targeted conservation tips and leak detection.",
    sources: [
      ["Monitoring Water Consumption Patterns with IoT and Machine Learning", "https://doi.org/10.3390/w14142187"],
      ["Predicting and Understanding Residential Water Use", "https://iopscience.iop.org/article/10.1088/1748-9326/ad1434"],
      ["Systematic Review of ML Techniques for Household Water Consumption", "https://link.springer.com/article/10.1007/s11269-026-04496-4"],
      ["Machine Learning for Smart Water Distribution Systems", "https://link.springer.com/article/10.1007/s10462-024-11093-7"],
    ],
  },
  {
    number: "04",
    title: "Green Action Prediction",
    summary: "Random Forest and interpretable behavioral models can identify likely action while keeping the intention gap visible.",
    sources: [
      ["Predicting Pro-Environmental Behavioral Intention", "https://www.nature.com/articles/s41598-026-52271-7"],
      ["Examining Digital Nudges to Influence Pro-Environmental Behavior", "https://www.tandfonline.com/doi/full/10.1080/08874417.2025.2526385"],
      ["Predictive Analysis of Pro-Environmental Behaviour of College Students", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9367762/"],
      ["LLM-Generated Personalized Nudges for Resource Conservation", "https://arxiv.org/html/2604.03881v2"],
    ],
  },
  {
    number: "05",
    title: "Personalized Eco Advice",
    summary: "Sustainable recommender systems work best when environmental goals are part of personalization, not an afterthought.",
    sources: [
      ["Advancing Sustainability via Recommender Systems", "https://arxiv.org/pdf/2411.07658"],
      ["Understanding the Impact of Sustainability-Oriented Recommender Systems", "https://www.sciencedirect.com/science/article/abs/pii/S1567422325000651"],
      ["Preference Learning for Eco-Friendly Hotels Recommendation", "https://doi.org/10.1016/j.jclepro.2019.01.012"],
      ["Recommender Systems and Sustainability: A Dual Perspective", "https://www.sciencedirect.com/science/article/pii/S1574013726000213"],
    ],
  },
  {
    number: "06",
    title: "Methane Model",
    summary: "Proxy data, ensemble learning, and IoT monitoring provide a research-backed path for the planned methane feature.",
    sources: [
      ["Approaches for Predicting Dairy Cattle Methane Emissions", "https://academic.oup.com/jas/article/doi/10.1093/jas/skae219/7731169"],
      ["Predicting Methane Emissions in Smallholder Dairy Systems", "https://doi.org/10.3389/fsufs.2025.1668517"],
      ["Enteric Methane Emission in Livestock Sector: Bibliometric Research", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11545165/"],
      ["IoT-Enabled Framework for Real-Time Methane Prediction", "https://www.ijies.org/portfolio-item/B105505020226/"],
    ],
  },
];

const Dashboard = () => {
  const {
    user,
    dailyTasks,
    energyLogs,
    waterLogs,
    methaneLogs,
    completedQuizzes,
    bookmarkedSchemes,
    DEFAULT_SCHEMES,
    INITIAL_QUIZZES,
    addEnergyLog,
    addWaterLog,
    addMethaneLog,
    completeQuiz,
    claimStreakBonus,
    toggleBookmarkScheme,
    levelUpMessage,
    setLevelUpMessage,
  } = useEco();

  const { activeTab, setActiveTab } = useDashboardNavigation();
  const { status: realtimeStatus } = useRealtimeConnection(import.meta.env.VITE_REALTIME_URL);

  // Sidebar Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form Inputs
  const [gridEnergyInput, setGridEnergyInput] = useState("");
  const [solarEnergyInput, setSolarEnergyInput] = useState("");
  const [solarSimulationPct, setSolarSimulationPct] = useState(40);

  // Water Quick Log Feedback state
  const [waterFeedback, setWaterFeedback] = useState("");

  // Methane Logger Inputs
  const [dietChoiceInput, setDietChoiceInput] = useState("Plant-Based");
  const [compostInput, setCompostInput] = useState("");
  const [methaneFeedback, setMethaneFeedback] = useState("");

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState([
    { sender: "leafy", text: "Hey! I am Leafy, your AI Eco Assistant. Ask me about solar energy, the Rio Trio treaties (UNFCCC, CBD, UNCCD), water saving, or methane mitigation! 🤖🌿" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatThinking, setIsChatThinking] = useState(false);

  // DOM ref for auto-scrolling chat
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === "ai") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatThinking, activeTab]);

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStep, setQuizStep] = useState("intro");

  // Schemes Filter State
  const [schemeSearch, setSchemeSearch] = useState("");
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState("All");
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState(null);
  const [researchSearch, setResearchSearch] = useState("");
  const [researchModuleFilter, setResearchModuleFilter] = useState("All");

  const { filteredSchemes, filteredResearchModules } = useDashboardFilters({
    schemes: DEFAULT_SCHEMES,
    schemeSearch,
    schemeCategoryFilter,
    researchModules: RESEARCH_MODULES,
    researchSearch,
    researchModuleFilter,
  });

  const { overviewPulse, overviewModules } = useDashboardMetrics({
    energyLogs,
    waterLogs,
    methaneLogs,
    completedQuizzes,
    bookmarkedSchemes,
    quizCount: INITIAL_QUIZZES.length,
  });

  // Handlers
  const handleLogEnergySubmit = (e) => {
    e.preventDefault();
    const grid = parseFloat(gridEnergyInput);
    const solar = parseFloat(solarEnergyInput);
    if (!isNaN(grid) && !isNaN(solar)) {
      addEnergyLog(grid, solar);
      setGridEnergyInput("");
      setSolarEnergyInput("");
    }
  };

  const handleWaterQuickLog = (used, saved, activityName) => {
    addWaterLog(used, saved);
    setWaterFeedback(`Awesome! Saved ${saved}L today by doing: "${activityName}" (+15 XP)`);
    setTimeout(() => setWaterFeedback(""), 4000);
  };

  const handleMethaneSubmit = (e) => {
    e.preventDefault();
    const compostKg = parseFloat(compostInput) || 0;
    addMethaneLog(dietChoiceInput, compostKg);
    setMethaneFeedback(`Log Saved! Prevented methane release via ${dietChoiceInput} diet & composting! (+20 XP)`);
    setCompostInput("");
    setTimeout(() => setMethaneFeedback(""), 4000);
  };

  const startQuizFlow = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setQuizAnswered(false);
    setQuizScore(0);
    setQuizStep("questions");
  };

  const handleOptionSelect = (optionIdx) => {
    if (quizAnswered) return;
    setSelectedOption(optionIdx);
    setQuizAnswered(true);

    const isCorrect = optionIdx === activeQuiz.questions[currentQuestionIndex].answer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setQuizAnswered(false);

    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalScorePct = (quizScore / activeQuiz.questions.length) * 100;
      completeQuiz(activeQuiz.id, finalScorePct);
      setQuizStep("summary");
    }
  };

  const handleSendChatMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = { sender: "user", text };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatThinking(true);

    setTimeout(() => {
      const query = text.toLowerCase();
      let replyText = "";

      if (query.includes("rio") || query.includes("unfccc") || query.includes("cbd") || query.includes("unccd") || query.includes("treaty")) {
        replyText =
          "The Rio Trio refers to the 3 key treaties born at the 1992 Earth Summit: 1) UNFCCC for Climate Change (IPCC consensus), 2) CBD for Biodiversity preservation (30x30 target), and 3) UNCCD to fight Desertification & Soil erosion. You can take our Rio Trio Quizzes in the Learning Center! 🌍📜";
      } else if (query.includes("methane") || query.includes("ch4") || query.includes("cow") || query.includes("diet") || query.includes("livestock")) {
        replyText =
          "Methane (CH4) is 80x more potent than CO2 over 20 years. About 40% comes from agriculture (ruminant enteric fermentation & landfills). Switching to plant-based meals and composting organic waste directly cuts methane! Take a look at our Methane Tracker tab. 🐮🍃";
      } else if (
        query.includes("solar") ||
        query.includes("panel") ||
        query.includes("electric") ||
        query.includes("energy") ||
        query.includes("net metering")
      ) {
        replyText =
          "Solar energy is a game-changer! You can generate your own power, save on utility bills, and get up to 30% tax credits (check our Green Schemes tab). I recommend starting with the Solar Basics quiz in the Learning Center to earn 50 XP! ⚡☀️";
      } else if (
        query.includes("water") ||
        query.includes("greywater") ||
        query.includes("rainwater") ||
        query.includes("shower")
      ) {
        replyText =
          "Conserving water is vital. Quick tips: restrict shower times to 5 minutes (saves ~40L), reuse kitchen rinse water for backyard soil, and check if your local utility offers rainwater tank subsidies. Log your savings today to gain XP! 💧🏺";
      } else {
        replyText =
          "That is a great question! Living sustainably is a journey of small daily habits supported by peer-reviewed research. Try completing today's eco-checklist, or ask me about 'Rio Trio treaties', 'Methane reduction', or 'Solar rebates'! 🌿";
      }

      setChatMessages((prev) => [...prev, { sender: "leafy", text: replyText }]);
      setIsChatThinking(false);
    }, 1000);
  };

  return (
    <div className="dashboard-motion-page min-h-screen bg-[#030303] flex font-sans pt-16">
      <div className="dashboard-cyber-mesh" aria-hidden="true">
        <span className="dashboard-cyber-orb dashboard-cyber-orb--mint" />
        <span className="dashboard-cyber-orb dashboard-cyber-orb--blue" />
        <span className="dashboard-cyber-orb dashboard-cyber-orb--amber" />
      </div>
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} />

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-7xl mx-auto">
        {/* Toggle Sidebar Button & Breadcrumbs */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-500 hover:text-slate-950 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition cursor-pointer"
            whileHover={{ scale: 1.03, boxShadow: "0 0 22px rgba(184, 243, 107, 0.2)" }}
            whileTap={{ scale: 0.96 }}
          >
            <FaBars />
          </motion.button>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-semibold font-sans">
            <FaFolder />
            <span>GreenPlus Workspace</span>
            <FaAngleRight className="text-xs" />
            <span className="text-slate-800 font-bold capitalize">
              {activeTab === "ai" ? "AI Nudge Assistant" : activeTab === "methane" ? "Methane Model (CH4)" : activeTab}
            </span>
          </div>
        </div>

        {/* Level Up Banner Overlay */}
        <AnimatePresence>
          {levelUpMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white p-5 rounded-3xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_8px_20px_rgba(16,185,129,0.25)] border border-emerald-400/20"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🎉</span>
                <div>
                  <h4 className="font-extrabold text-lg font-sans">Level Up!</h4>
                  <p className="text-sm opacity-90">{levelUpMessage}</p>
                </div>
              </div>
              <button
                onClick={() => setLevelUpMessage(null)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-xs font-bold rounded-2xl transition cursor-pointer shadow-sm"
              >
                Awesome!
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === "overview" && (
          <DashboardOverview
            user={user}
            dailyTasks={dailyTasks}
            overviewPulse={overviewPulse}
            overviewModules={overviewModules}
            claimStreakBonus={claimStreakBonus}
            setActiveTab={setActiveTab}
            realtimeStatus={realtimeStatus}
          />
        )}

        {/* ==================== ENERGY TRACKER TAB ==================== */}
        {activeTab === "energy" && (
          <div className="dashboard-tab-stage space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between h-[140px]">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Cumulative CO₂ Offsets</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {energyLogs.reduce((acc, curr) => acc + curr.offset, 0).toFixed(1)} kg
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">Equivalent to planting {Math.round(energyLogs.reduce((acc, curr) => acc + curr.offset, 0) / 10)} trees!</span>
              </div>
              <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between h-[140px]">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Average Solar Output</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {energyLogs.length ? (energyLogs.reduce((acc, curr) => acc + curr.solarEnergy, 0) / energyLogs.length).toFixed(1) : 0} kWh
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-sans">Self-generated clean electricity</span>
              </div>
              <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between h-[140px]">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Grid Reliance Ratio</span>
                <span className="text-3xl font-extrabold text-amber-400 font-mono font-sans">
                  {energyLogs.length
                    ? Math.round(
                        (energyLogs.reduce((acc, curr) => acc + curr.gridEnergy, 0) /
                          (energyLogs.reduce((acc, curr) => acc + curr.gridEnergy, 0) +
                            energyLogs.reduce((acc, curr) => acc + curr.solarEnergy, 0))) *
                          100
                      )
                    : 100}
                  %
                </span>
                <span className="text-[10px] text-amber-500 font-bold">Electricity sourced from municipal grids</span>
              </div>
            </div>

            {/* Explainable AI (XAI) Feature Attribution Panel (Module 2 from PDF) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaInfoCircle className="text-emerald-500 text-lg" />
                <h3 className="font-extrabold text-slate-900 text-base">Explainable AI (XAI / SHAP-style) Household Energy Attribution</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Based on ensemble ML feature attribution models (*Springer Journal of Intelligent Systems, 2026*), here is what drives your household footprint:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">HVAC & Cooling</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">42%</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Primary usage driver</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Standby Electronics</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">28%</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Vampire power loads</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Lighting & Cooking</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">18%</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Standard routine</span>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Solar Subtraction</span>
                  <span className="text-2xl font-extrabold text-emerald-950 font-mono">-12%</span>
                  <span className="text-[10px] text-emerald-700 block mt-1">Net grid offset</span>
                </div>
              </div>
            </div>

            {/* Tesla Chart display */}
            <div className="h-[360px]">
              <TeslaChart type="energy" dataLogs={energyLogs} />
            </div>

            {/* Input logger & simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                  <FaBolt className="text-amber-500" /> Log Daily Utility Usage
                </h3>
                <form onSubmit={handleLogEnergySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Grid Consumption (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={gridEnergyInput}
                      onChange={(e) => setGridEnergyInput(e.target.value)}
                      placeholder="e.g. 12.5"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Solar Generation (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={solarEnergyInput}
                      onChange={(e) => setSolarEnergyInput(e.target.value)}
                      placeholder="e.g. 5.8 (Input 0 if no solar)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center font-sans tracking-wide"
                  >
                    Log Usage Stats
                  </button>
                </form>
              </div>

              <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-1.5 text-white">
                    <span>⚡</span> Smart Solar Offset Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Slide to simulate upgrading your house with solar panels. See how increasing solar offset cuts down your reliance on carbon-heavy municipal energy.
                  </p>
                </div>

                <div className="my-6">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 mb-2">
                    <span>Solar Capacity Ratio</span>
                    <span className="text-emerald-400 text-sm font-extrabold">{solarSimulationPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={solarSimulationPct}
                    onChange={(e) => setSolarSimulationPct(e.target.value)}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-extrabold">Estimated Monthly Savings</span>
                    <span className="text-lg font-extrabold text-white font-mono">${Math.round(solarSimulationPct * 1.8)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-extrabold">Annual Carbon Avoided</span>
                    <span className="text-lg font-extrabold text-emerald-400 font-mono">
                      {Math.round(solarSimulationPct * 14.5)} kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== WATER TRACKER TAB ==================== */}
        {activeTab === "water" && (
          <div className="dashboard-tab-stage dashboard-water space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-700 font-bold uppercase tracking-wider block">Total Water Tracked</span>
                  <span className="text-3xl font-extrabold text-blue-950 font-mono">
                    {waterLogs.reduce((acc, curr) => acc + curr.waterUsed, 0)} Liters
                  </span>
                  <span className="text-xs text-blue-600 font-semibold block mt-1">From showers and appliances</span>
                </div>
                <span className="text-4xl">💧</span>
              </div>
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block">Water Conserved</span>
                  <span className="text-3xl font-extrabold text-emerald-950 font-mono">
                    {waterLogs.reduce((acc, curr) => acc + curr.waterSaved, 0)} Liters
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold block mt-1">Compared to regional averages</span>
                </div>
                <span className="text-4xl">🌿</span>
              </div>
            </div>

            {/* Smart Leak Detection Alert (Module 3 from PDF) */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-amber-500 text-xl shrink-0" />
                <div>
                  <h4 className="font-extrabold text-amber-950 text-sm">Smart Water Anomaly Detection (IoT ML Model)</h4>
                  <p className="text-xs text-amber-800/80 mt-0.5">Flow rate pattern is steady. Zero anomalies detected in plumbing outlets today.</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                Plumbing Normal ✓
              </span>
            </div>

            <div className="h-[360px]">
              <TeslaChart type="water" dataLogs={waterLogs} />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <FaTint className="text-blue-500 animate-pulse" /> Hydration & Savings Logger
                </h3>
                <p className="text-sm text-slate-500 mt-1">Tap a card to register daily actions. Keep your water budget clean!</p>
              </div>

              {waterFeedback && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-sm mb-6 text-center">
                  {waterFeedback}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-slate-100 rounded-2xl text-center space-y-4 hover:shadow-sm transition">
                  <span className="text-4xl block">🚿</span>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Eco-Shower</span>
                    <span className="text-xs text-slate-400 block mt-1">Restrict bathing to under 5 minutes to reduce waste.</span>
                  </div>
                  <button
                    onClick={() => handleWaterQuickLog(35, 45, "5-Min Shower")}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer"
                  >
                    Log Activity (+45L Saved)
                  </button>
                </div>

                <div className="p-5 border border-slate-100 rounded-2xl text-center space-y-4 hover:shadow-sm transition">
                  <span className="text-4xl block">🍽️</span>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Full Load Dishwasher</span>
                    <span className="text-xs text-slate-400 block mt-1">Wait for full capacity before running dish cycles.</span>
                  </div>
                  <button
                    onClick={() => handleWaterQuickLog(12, 15, "Full Load Dishwasher")}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer"
                  >
                    Log Activity (+15L Saved)
                  </button>
                </div>

                <div className="p-5 border border-slate-100 rounded-2xl text-center space-y-4 hover:shadow-sm transition">
                  <span className="text-4xl block">🏺</span>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Greywater Recycling</span>
                    <span className="text-xs text-slate-400 block mt-1">Reuse rinsing water to irrigate backyard plants.</span>
                  </div>
                  <button
                    onClick={() => handleWaterQuickLog(0, 30, "Greywater Irrigation")}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer"
                  >
                    Log Activity (+30L Saved)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== METHANE MODEL TAB (Module 6 from PDF) ==================== */}
        {activeTab === "methane" && (
          <div className="dashboard-tab-stage space-y-8 animate-fadeIn">
            {/* Header Shield */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 border border-emerald-500/20 shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Module 6: Agricultural & Waste Methane Model
                  </span>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight">Methane (CH₄) Mitigation Tracker</h3>
                  <p className="text-xs text-emerald-200 mt-2 max-w-2xl leading-relaxed">
                    Methane is responsible for ~40% of anthropogenic warming and is 80x more potent than CO₂ over 20 years. Composting food waste and choosing plant-based meals cuts CH₄ at the source.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-emerald-500/30 text-center shrink-0">
                  <span className="text-[10px] text-emerald-400 uppercase font-extrabold block">Cumulative CH₄ Avoided</span>
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {methaneLogs.reduce((acc, curr) => acc + curr.ch4AvoidedKg, 0).toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Methane Log Form & Proxy Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>🐮</span> Log Meal & Compost Methane Offsets
                </h4>
                {methaneFeedback && (
                  <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl mb-4">
                    {methaneFeedback}
                  </div>
                )}
                <form onSubmit={handleMethaneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Today's Primary Meal Pattern</label>
                    <select
                      value={dietChoiceInput}
                      onChange={(e) => setDietChoiceInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 text-sm bg-white"
                    >
                      <option value="Plant-Based">100% Plant-Based (Saves 1.8 kg CH4)</option>
                      <option value="Vegetarian">Vegetarian (Saves 1.2 kg CH4)</option>
                      <option value="Conventional">Standard Meal (Base)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Organic Food Waste Composted (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={compostInput}
                      onChange={(e) => setCompostInput(e.target.value)}
                      placeholder="e.g. 0.8 kg fruit peels / coffee grounds"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center text-xs"
                  >
                    Log Methane Offset (+20 XP)
                  </button>
                </form>
              </div>

              <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📊</span> Methane History Log
                </h4>
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
                  {methaneLogs.map((log, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{log.dietChoice} Diet</span>
                        <span className="text-[10px] text-slate-400 block">{log.date} • Composted {log.compostedKg} kg</span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-600 font-mono">
                        +{log.ch4AvoidedKg} kg CH₄ avoided
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== LEARNING CENTER (RIO TRIO QUIZZES) TAB ==================== */}
        {activeTab === "learning" && (
          <div className="dashboard-tab-stage dashboard-learning space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                  <FaGraduationCap className="text-emerald-600" /> Rio Trio & Environmental Quizzes
                </h3>
                <p className="text-sm text-emerald-700/80 mt-1">
                  Covers official UNFCCC Climate, CBD Biodiversity, and UNCCD Land degradation research modules.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white rounded-2xl border border-emerald-100 text-center shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 leading-none">QUIZZES SOLVED</span>
                  <span className="text-lg font-extrabold text-emerald-800 leading-none">{completedQuizzes.length} / 7</span>
                </div>
              </div>
            </div>

            {/* Quiz Interaction Block */}
            {activeQuiz ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 max-w-2xl mx-auto">
                {quizStep === "questions" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-400">
                      <span>Quiz: {activeQuiz.title}</span>
                      <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <h4 className="text-xl font-extrabold text-slate-900 leading-relaxed font-sans">
                      {activeQuiz.questions[currentQuestionIndex].question}
                    </h4>

                    <div className="space-y-3">
                      {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === activeQuiz.questions[currentQuestionIndex].answer;
                        
                        let btnStyle = "border-slate-200 hover:border-emerald-300";
                        if (quizAnswered) {
                          if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950";
                          else if (isSelected) btnStyle = "border-red-500 bg-red-50 text-red-950";
                          else btnStyle = "border-slate-100 opacity-60";
                        } else if (isSelected) {
                          btnStyle = "border-emerald-500 bg-emerald-50/50";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={quizAnswered}
                            onClick={() => handleOptionSelect(idx)}
                            className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {quizAnswered && isCorrect && <span className="text-emerald-600 text-sm font-bold">Correct ✓</span>}
                            {quizAnswered && isSelected && !isCorrect && <span className="text-red-600 text-sm font-bold">Incorrect ✗</span>}
                          </button>
                        );
                      })}
                    </div>

                    {quizAnswered && (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
                      >
                        {currentQuestionIndex < activeQuiz.questions.length - 1 ? "Next Question" : "View Results"}
                      </button>
                    )}
                  </div>
                )}

                {quizStep === "summary" && (
                  <div className="text-center space-y-6">
                    <span className="text-5xl block animate-bounce">🎉</span>
                    <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quiz Completed!</h4>
                    
                    <div className="max-w-md mx-auto p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <span className="block text-xs text-emerald-700 font-extrabold uppercase tracking-wider">Score Achieved</span>
                      <span className="text-4xl font-extrabold text-emerald-950 font-mono">
                        {Math.round((quizScore / activeQuiz.questions.length) * 100)}%
                      </span>
                      <span className="text-xs text-slate-500 block mt-2 leading-relaxed">
                        {quizScore === activeQuiz.questions.length
                          ? "Flawless score! Unlocked research points."
                          : "Nice effort! You've learned core practices. Complete again for 100%!"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveQuiz(null);
                        setQuizStep("intro");
                      }}
                      className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                    >
                      Back to Learning Dashboard
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {INITIAL_QUIZZES.map((quiz) => {
                  const solved = completedQuizzes.includes(quiz.id);

                  return (
                    <div key={quiz.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">{quiz.title}</span>
                          {solved && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                              Completed ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
                          <span>Difficulty: {quiz.difficulty}</span>
                          <span>•</span>
                          <span>Category: {quiz.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <span className="text-sm font-bold text-emerald-600 shrink-0">+{quiz.xp} XP reward</span>
                        <button
                          onClick={() => startQuizFlow(quiz)}
                          className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          {solved ? "Retake Quiz" : "Start Quiz"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== RESEARCH LIBRARY TAB ==================== */}
        {activeTab === "research" && (
          <div className="dashboard-tab-stage dashboard-research space-y-8 animate-fadeIn">
            <div className="dashboard-research__hero">
              <div>
                <span className="dashboard-kicker">Verified research review</span>
                <h2>Evidence behind GreenPlus</h2>
                <p>Six product modules grounded in the supplied literature review, with peer-reviewed and authoritative sources kept distinct.</p>
              </div>
              <span className="dashboard-research__count">{filteredResearchModules.length} MODULES · {filteredResearchModules.reduce((total, module) => total + module.sources.length, 0)} PAPERS</span>
            </div>

            <div className="dashboard-research__controls">
              <div className="dashboard-research__search">
                <FaSearch />
                <input
                  type="search"
                  value={researchSearch}
                  onChange={(event) => setResearchSearch(event.target.value)}
                  placeholder="Search papers, methods, or modules"
                  aria-label="Search research library"
                />
              </div>
              <select
                value={researchModuleFilter}
                onChange={(event) => setResearchModuleFilter(event.target.value)}
                aria-label="Filter research modules"
              >
                <option value="All">All modules</option>
                {RESEARCH_MODULES.map((module) => <option key={module.number} value={module.number}>{module.number} · {module.title}</option>)}
              </select>
            </div>

            <div className="dashboard-research__grid">
              {filteredResearchModules.map((module) => (
                <motion.article
                  className="dashboard-research__card dashboard-focus-row"
                  key={module.number}
                  initial={{ opacity: 0.45, scale: 0.97, borderColor: "rgba(63, 63, 70, 0.45)" }}
                  whileInView={{ opacity: 1, scale: 1, borderColor: "rgba(184, 243, 107, 0.55)" }}
                  viewport={{ amount: 0.7, margin: "-12% 0px -12%" }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                  <div className="dashboard-research__card-top">
                    <span>{module.number}</span>
                    <span>Literature signal</span>
                  </div>
                  <h3>{module.title}</h3>
                  <p>{module.summary}</p>
                  <div className="dashboard-research__sources">
                    {module.sources.map(([title, url]) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        <span>{title}</span><FaShareSquare />
                      </a>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>

            {!filteredResearchModules.length && <div className="dashboard-research__empty">No research matches this search. Try a module name, method, or paper title.</div>}

            <div className="dashboard-research__note">
              <strong>Authoritative context</strong>
              <span>Rio Trio: UNFCCC, CBD, and UNCCD. Methane context: IPCC, UNEP/CCAC, and IEA resources.</span>
            </div>
          </div>
        )}

        {/* ==================== GREEN SCHEMES TAB ==================== */}
        {activeTab === "schemes" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FaDatabase className="text-emerald-500" /> Notion Eco-Schemes Database (Multi-Criteria SDGs)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-criteria recommendation engine matching SDG goals (SDG 6, SDG 7, SDG 12, SDG 13).
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={schemeSearch}
                    onChange={(e) => setSchemeSearch(e.target.value)}
                    placeholder="Search schemes..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FaFilter className="text-slate-400 text-sm" />
                  <select
                    value={schemeCategoryFilter}
                    onChange={(e) => setSchemeCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-slate-700 bg-white"
                  >
                    <option value="All">All Categories</option>
                    <option value="Solar">Solar</option>
                    <option value="Transport">Transport</option>
                    <option value="Energy Efficiency">Energy Efficiency</option>
                    <option value="Water Conservation">Water Conservation</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 border-collapse">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-100 font-extrabold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Scheme Name</th>
                      <th className="px-6 py-4">Category & SDGs</th>
                      <th className="px-6 py-4">Incentive</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredSchemes.map((sch) => {
                      const isBookmarked = bookmarkedSchemes.includes(sch.id);

                      return (
                        <tr key={sch.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-bold text-slate-900 cursor-pointer" onClick={() => setSelectedSchemeDetail(sch)}>
                            {sch.title}
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 block w-fit">
                              {sch.category}
                            </span>
                            {sch.sdgs && (
                              <div className="flex gap-1 flex-wrap">
                                {sch.sdgs.map((sdg, i) => (
                                  <span key={i} className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">
                                    {sdg}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-extrabold text-emerald-600">{sch.reward}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                sch.status === "Open" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {sch.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => toggleBookmarkScheme(sch.id)}
                              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                                isBookmarked
                                  ? "bg-amber-500 text-white border-amber-500"
                                  : "bg-white text-slate-400 hover:text-amber-500 border-slate-100 hover:border-amber-200"
                              }`}
                            >
                              <FaBookmark />
                            </button>
                            <button
                              onClick={() => setSelectedSchemeDetail(sch)}
                              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== AI ASSISTANT TAB ==================== */}
        {activeTab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <h3 className="font-bold text-slate-900 text-sm">Leafy AI Eco Assistant (LLM Nudges)</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Powered</span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
                {chatMessages.map((msg, index) => {
                  const isLeafy = msg.sender === "leafy";
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={index}
                      className={`flex gap-3 max-w-[85%] ${isLeafy ? "self-start" : "ml-auto flex-row-reverse"}`}
                    >
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${
                        isLeafy ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                      }`}>
                        {isLeafy ? "🌱" : user.name[0]}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isLeafy ? "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100" : "bg-emerald-500 text-white rounded-tr-none shadow-[0_3px_0_0_#059669]"
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })}
                {isChatThinking && (
                  <div className="flex gap-3 max-w-[80%] self-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shadow-sm animate-pulse">
                      🌱
                    </div>
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage(chatInput);
                }}
                className="p-4 border-t border-slate-100 flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Leafy about solar, Rio Trio treaties, water, methane..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-800"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_3px_0_0_#059669] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-xs"
                >
                  Send
                </button>
              </form>
            </div>

            <div className="lg:col-span-4 space-y-6 flex flex-col justify-between h-[520px]">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex-1">
                <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-1.5">
                  <span>💡</span> Research Prompts
                </h4>
                <div className="space-y-3">
                  {[
                    "What are the 3 Rio Trio treaties?",
                    "How does methane (CH4) impact climate?",
                    "Explain solar net metering.",
                    "Are there federal rebates for EVs?"
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChatMessage(prompt)}
                      className="w-full p-3.5 border border-slate-100 hover:border-emerald-300 rounded-2xl text-left text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/20 shadow-[0_3px_0_0_#f3f4f6] hover:shadow-none hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-center gap-4">
                <div className="text-3xl">🤖</div>
                <div className="text-xs text-emerald-800 font-semibold leading-relaxed">
                  Leafy AI uses field-validated research models to provide personalized recommendations.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== LEADERBOARD TAB ==================== */}
        {activeTab === "leaderboard" && (
          <div className="dashboard-tab-stage space-y-8 max-w-4xl mx-auto animate-fadeIn">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-3xl p-6 shadow-[0_6px_15px_rgba(245,158,11,0.25)] flex flex-col sm:flex-row justify-between items-center gap-6 border border-amber-400/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                  🏆
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">GreenPlus Emerald League</h3>
                  <p className="text-xs opacity-95 mt-0.5 font-medium">Rankings reset in 3 days. Complete tasks to top the table!</p>
                </div>
              </div>
              <div className="text-center sm:text-right shrink-0">
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-100">Weekly Pool</span>
                <span className="text-xl font-extrabold text-white font-mono">+250 XP Grand Prize</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4 flex flex-col">
              {[
                { rank: 1, name: "SolarSam", level: 12, xp: 1240, badge: "☀️ Solar Pioneer", isUser: false },
                { rank: 2, name: "WaterWendy", level: 9, xp: 980, badge: "💧 Water Wizard", isUser: false },
                { rank: 3, name: "GreenGodzilla", level: 6, xp: 620, badge: "🦎 Wildlife Knight", isUser: false },
                { rank: 4, name: user.name, level: user.level, xp: user.level * 100 + user.xp, badge: "🌿 Active Champion", isUser: true },
                { rank: 5, name: "EcoEmily", level: 3, xp: 240, badge: "🌸 Plant Lover", isUser: false },
              ].sort((a, b) => b.xp - a.xp).map((player, idx) => {
                const globalRank = idx + 1;
                let rankVisual = `${globalRank}`;
                let metallicStyle = "bg-white border-slate-50";

                if (globalRank === 1) {
                  rankVisual = "🥇";
                  metallicStyle = "bg-gradient-to-r from-amber-500/5 to-amber-500/0 border-amber-100";
                } else if (globalRank === 2) {
                  rankVisual = "🥈";
                  metallicStyle = "bg-gradient-to-r from-slate-400/5 to-slate-400/0 border-slate-200";
                } else if (globalRank === 3) {
                  rankVisual = "🥉";
                  metallicStyle = "bg-gradient-to-r from-orange-400/5 to-orange-400/0 border-orange-200";
                } else if (player.isUser) {
                  metallicStyle = "border-emerald-300 bg-emerald-50/40 shadow-[0_4px_12px_rgba(16,185,129,0.1)] ring-2 ring-emerald-500/20";
                }

                return (
                  <div
                    key={player.name}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${metallicStyle}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-extrabold w-8 text-center">{rankVisual}</span>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl font-bold border border-slate-100">
                        {player.isUser ? "🌿" : "👤"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{player.name}</span>
                          {player.isUser && (
                            <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.2 rounded">YOU</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">{player.badge}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-6">
                      <div className="text-xs font-semibold text-slate-400">Level {player.level}</div>
                      <div className="text-sm font-extrabold text-slate-900 font-mono w-20">{player.xp} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scheme Detail Modal */}
        <AnimatePresence>
          {selectedSchemeDetail && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                      {selectedSchemeDetail.category}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-2">{selectedSchemeDetail.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedSchemeDetail(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-sm text-slate-600 font-sans">
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase">Governing Body</span>
                    <span className="text-slate-900 font-semibold">{selectedSchemeDetail.authority}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase">Reward Details</span>
                    <span className="text-emerald-600 font-extrabold">{selectedSchemeDetail.reward}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase">Description</span>
                    <p className="leading-relaxed mt-1 text-slate-500">{selectedSchemeDetail.desc}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      toggleBookmarkScheme(selectedSchemeDetail.id);
                    }}
                    className={`flex-1 py-3 border font-bold text-sm rounded-xl transition ${
                      bookmarkedSchemes.includes(selectedSchemeDetail.id)
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {bookmarkedSchemes.includes(selectedSchemeDetail.id) ? "Bookmarked ✓" : "Bookmark Scheme"}
                  </button>
                  <a
                    href="https://www.energy.gov"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-xl text-center shadow-[0_3px_0_0_#059669] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Apply Now <FaShareSquare />
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
