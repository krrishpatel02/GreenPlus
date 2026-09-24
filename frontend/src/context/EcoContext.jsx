import { createContext, useState, useContext, useMemo, useEffect } from "react";
import { useEcoProgress } from "./EcoProgressContext";

const EcoContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useEco = () => useContext(EcoContext);

const DEFAULT_SCHEMES = [
  {
    id: "india-pm-surya-ghar",
    title: "PM Surya Ghar: Muft Bijli Yojana",
    category: "Solar",
    authority: "Ministry of New and Renewable Energy (MNRE)",
    reward: "Central rooftop-solar subsidy; amount depends on system capacity",
    status: "Open",
    difficulty: "Medium",
    desc: "India's residential rooftop-solar programme supports eligible households installing grid-connected rooftop systems. Check the current subsidy rules, vendor list, and DISCOM process before applying.",
    eligibility: "Residential electricity consumers; state and DISCOM conditions apply.",
    sourceUrl: "https://pmsuryaghar.gov.in/",
    sdgs: ["SDG 7: Clean Energy", "SDG 13: Climate Action"],
  },
  {
    id: "india-pm-kusum",
    title: "PM-KUSUM",
    category: "Agriculture & Solar",
    authority: "Ministry of New and Renewable Energy (MNRE)",
    reward: "Support for solar pumps and decentralised renewable power; state share varies",
    status: "Open",
    difficulty: "Hard",
    desc: "PM-KUSUM supports farmers, solar pumps, feeder solarisation, and decentralised solar plants through state implementing agencies.",
    eligibility: "Farmers and eligible agricultural stakeholders; apply through the state implementing agency.",
    sourceUrl: "https://pmkusum.mnre.gov.in/",
    sdgs: ["SDG 2: Zero Hunger", "SDG 7: Clean Energy", "SDG 13: Climate Action"],
  },
  {
    id: "india-ujala",
    title: "UJALA LED Lighting Programme",
    category: "Energy Efficiency",
    authority: "Energy Efficiency Services Limited (EESL)",
    reward: "Affordable energy-efficient LED lighting through programme channels",
    status: "Ongoing",
    difficulty: "Easy",
    desc: "UJALA promotes efficient LED bulbs and lighting to reduce household electricity consumption. Availability and distribution channels can vary by location.",
    eligibility: "Households and consumers in participating distribution areas.",
    sourceUrl: "https://eeslindia.org/en/ujala/",
    sdgs: ["SDG 7: Clean Energy", "SDG 12: Responsible Consumption"],
  },
  {
    id: "india-pm-e-drive",
    title: "PM E-DRIVE Scheme",
    category: "Transport",
    authority: "Ministry of Heavy Industries",
    reward: "Demand incentives for eligible electric vehicles and charging support, subject to scheme rules",
    status: "Check eligibility",
    difficulty: "Medium",
    desc: "PM E-DRIVE supports electric mobility and charging infrastructure. Incentives depend on vehicle type, purchase date, registration, and notified conditions.",
    eligibility: "Eligible vehicle buyers, manufacturers, and charging ecosystem participants under current guidelines.",
    sourceUrl: "https://pmedrive.heavyindustries.gov.in/",
    sdgs: ["SDG 9: Industry and Innovation", "SDG 11: Sustainable Cities", "SDG 13: Climate Action"],
  },
  {
    id: "india-jal-jeevan",
    title: "Jal Jeevan Mission",
    category: "Water Conservation",
    authority: "Department of Drinking Water and Sanitation",
    reward: "Rural household tap-water infrastructure through state programmes",
    status: "Ongoing",
    difficulty: "Medium",
    desc: "Jal Jeevan Mission works with states and local institutions to improve rural household tap-water supply and source sustainability.",
    eligibility: "Rural households and local institutions; implementation is coordinated through state and village systems.",
    sourceUrl: "https://jaljeevanmission.gov.in/",
    sdgs: ["SDG 6: Clean Water", "SDG 3: Good Health"],
  },
  {
    id: "india-amrut-2",
    title: "AMRUT 2.0",
    category: "Water Conservation",
    authority: "Ministry of Housing and Urban Affairs",
    reward: "Urban water-supply, sewerage, reuse, and water-body improvement through city projects",
    status: "Ongoing",
    difficulty: "Hard",
    desc: "AMRUT 2.0 supports urban water security, reuse, sewerage, and rejuvenation projects through participating urban local bodies.",
    eligibility: "Residents benefit through participating cities; projects are implemented by urban local bodies.",
    sourceUrl: "https://mohua.gov.in/",
    sdgs: ["SDG 6: Clean Water", "SDG 11: Sustainable Cities"],
  },
  {
    id: "india-sbm-urban",
    title: "Swachh Bharat Mission - Urban 2.0",
    category: "Waste Management",
    authority: "Ministry of Housing and Urban Affairs",
    reward: "City sanitation, source segregation, recycling, and waste-processing services",
    status: "Ongoing",
    difficulty: "Medium",
    desc: "The urban mission supports source segregation, scientific waste processing, sanitation, and garbage-free city initiatives.",
    eligibility: "Residents, institutions, and urban local bodies in participating cities.",
    sourceUrl: "https://sbmurban.org/",
    sdgs: ["SDG 11: Sustainable Cities", "SDG 12: Responsible Consumption"],
  },
  {
    id: "india-gobardhan",
    title: "GOBARdhan",
    category: "Waste Management",
    authority: "Department of Drinking Water and Sanitation",
    reward: "Support for converting organic waste into biogas, bio-CNG, and compost through local projects",
    status: "Ongoing",
    difficulty: "Hard",
    desc: "GOBARdhan promotes village-level organic waste management and useful products from cattle dung and biodegradable waste.",
    eligibility: "Local bodies, community groups, entrepreneurs, and eligible project partners.",
    sourceUrl: "https://sbm.gov.in/GOBARdhan/",
    sdgs: ["SDG 7: Clean Energy", "SDG 12: Responsible Consumption", "SDG 13: Climate Action"],
  },
  {
    id: "india-green-credit",
    title: "Green Credit Programme",
    category: "Climate & Biodiversity",
    authority: "Ministry of Environment, Forest and Climate Change",
    reward: "Voluntary green-credit framework for eligible environmental actions",
    status: "Check eligibility",
    difficulty: "Hard",
    desc: "The Green Credit Programme provides a framework for verified environmental actions. Rules, activities, and registration requirements should be checked on the current government portal.",
    eligibility: "Individuals, organisations, and entities participating in notified activities.",
    sourceUrl: "https://www.moef.gov.in/",
    sdgs: ["SDG 13: Climate Action", "SDG 15: Life on Land"],
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export const INITIAL_QUIZZES = [
  // --- Module 6 & Rio Trio Education (UNFCCC, CBD, UNCCD) ---
  {
    id: "quiz-rio-climate",
    title: "Rio Trio: Climate Action (UNFCCC & IPCC)",
    category: "Rio Trio",
    xp: 60,
    difficulty: "Intermediate",
    questions: [
      {
        question: "What is the main objective of the UNFCCC treaty adopted at the 1992 Rio Earth Summit?",
        options: [
          "To stabilize greenhouse gas concentrations to prevent dangerous anthropogenic climate interference",
          "To tax international airline travel",
          "To build offshore solar farms exclusively",
          "To eliminate plastic bottle production by 2030",
        ],
        answer: 0,
      },
      {
        question: "According to the IPCC AR6 Synthesis Report, what is the target global warming limit above pre-industrial levels to avoid extreme climate risks?",
        options: ["3.0°C", "2.5°C", "1.5°C", "0.5°C"],
        answer: 2,
      },
      {
        question: "Which sector is responsible for the largest share of human-caused greenhouse gas emissions globally?",
        options: ["Commercial aviation", "Energy & electricity production", "Residential lighting", "Waste incineration"],
        answer: 1,
      },
    ],
  },
  {
    id: "quiz-rio-biodiversity",
    title: "Rio Trio: Biodiversity Protection (CBD)",
    category: "Rio Trio",
    xp: 60,
    difficulty: "Intermediate",
    questions: [
      {
        question: "What does the UN Convention on Biological Diversity (CBD) focus on?",
        options: [
          "Promoting industrial urban development",
          "Conserving biological diversity and sustainable use of ecosystems",
          "Managing deep sea mineral mining",
          "Establishing global satellite communications",
        ],
        answer: 1,
      },
      {
        question: "How does protecting natural forests and wetlands contribute to climate mitigation?",
        options: [
          "They act as natural carbon sinks that absorb CO2 from the atmosphere",
          "They reflect 100% of sunlight back to space",
          "They reduce atmospheric pressure",
          "They stop tectonic plate movement",
        ],
        answer: 0,
      },
      {
        question: "What is the Kunming-Montreal Global Biodiversity Framework target for land & ocean protection by 2030?",
        options: ["10%", "30% (30x30 Target)", "50%", "75%"],
        answer: 1,
      },
    ],
  },
  {
    id: "quiz-rio-desertification",
    title: "Rio Trio: Land & Desertification (UNCCD)",
    category: "Rio Trio",
    xp: 60,
    difficulty: "Intermediate",
    questions: [
      {
        question: "What is Land Degradation Neutrality (LDN) under the UNCCD?",
        options: [
          "A state where the amount and quality of land resources remains stable or increases",
          "Banning all agricultural plowing worldwide",
          "Converting deserts into artificial concrete cities",
          "Paving dry soils with solar panels",
        ],
        answer: 0,
      },
      {
        question: "Which landscaping strategy conserves water and prevents soil erosion in dry areas?",
        options: ["Over-watering lawns daily", "Xeriscaping with native drought-tolerant plants", "Burning dead grass", "Importing tropical turf"],
        answer: 1,
      },
    ],
  },
  {
    id: "quiz-methane",
    title: "Methane Model & Agricultural Impact",
    category: "Methane",
    xp: 60,
    difficulty: "Advanced",
    questions: [
      {
        question: "How much more potent is methane (CH4) compared to carbon dioxide (CO2) over a 20-year timescale?",
        options: ["2 times", "10 times", "Over 80 times", "500 times"],
        answer: 2,
      },
      {
        question: "What is the primary agricultural source of human-influenced methane emissions?",
        options: ["Enteric fermentation in ruminant livestock & food waste in landfills", "Tractor diesel fuel", "Fertilizer runoff in streams", "Solar array installation"],
        answer: 0,
      },
    ],
  },
  // --- Original Core Quizzes ---
  {
    id: "quiz-energy",
    title: "Solar & Smart Grid Basics",
    category: "Energy",
    xp: 50,
    difficulty: "Beginner",
    questions: [
      {
        question: "Which type of solar panel is generally the most efficient?",
        options: ["Monocrystalline", "Polycrystalline", "Thin-Film", "Organic solar cells"],
        answer: 0,
      },
      {
        question: "What is net metering?",
        options: [
          "Measuring fish in reservoirs",
          "Selling excess solar energy back to the electric grid",
          "Tracking your internet bandwidth",
          "Limiting electrical usage to night hours",
        ],
        answer: 1,
      },
      {
        question: "What does a home battery storage system do?",
        options: [
          "Powers your neighborhood",
          "Stores solar energy generated during the day for use at night",
          "Speeds up your electric cooker",
          "Increases standard grid voltage",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "quiz-water",
    title: "Every Drop Counts: Water Efficiency",
    category: "Water",
    xp: 50,
    difficulty: "Beginner",
    questions: [
      {
        question: "What is greywater?",
        options: [
          "Water contaminated with toxic chemicals",
          "Rainwater collected directly from the sky",
          "Gently used water from baths, sinks, and washing machines",
          "Pure distilled laboratory water",
        ],
        answer: 2,
      },
      {
        question: "On average, what household activity uses the absolute most water indoors?",
        options: ["Flushing toilets", "Taking showers", "Washing dishes", "Drinking and cooking"],
        answer: 0,
      },
      {
        question: "How does xeriscaping save water?",
        options: [
          "It uses automated heavy sprinklers",
          "It uses native plants that require minimal or no irrigation",
          "It uses synthetic artificial lawns",
          "It blocks rainwater from entering the soil",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "quiz-waste",
    title: "Demystifying Compost & Recycling",
    category: "Waste",
    xp: 50,
    difficulty: "Intermediate",
    questions: [
      {
        question: "Which of these is NOT suitable for a standard home compost pile?",
        options: ["Eggshells", "Coffee grounds", "Meat scraps", "Dry leaves"],
        answer: 2,
      },
      {
        question: "What does the chasing arrows triangle symbol on plastics actually mean?",
        options: [
          "The plastic is 100% compostable",
          "It identifies the type of plastic resin, not necessarily that it is recyclable locally",
          "It can be recycled infinite times",
          "It is manufactured from biodegradable seaweed",
        ],
        answer: 1,
      },
      {
        question: "What is 'wishcycling'?",
        options: [
          "Riding a bicycle to save energy",
          "Tossing non-recyclable items into recycling bins hoping they get recycled",
          "Upcycling old tires into flower pots",
          "Buying products only from eco-friendly companies",
        ],
        answer: 1,
      },
    ],
  },
];

export const EcoProvider = ({ children }) => {
  const progressContext = useEcoProgress() || {};
  const { progress, addLog: persistLog, completeQuiz: persistQuiz, updateState: persistState } = progressContext;
  const [user, setUser] = useState({
    name: "Eco Champion",
    level: 1,
    xp: 20,
    xpToNextLevel: 100,
    streak: 3,
    streakClaimed: false,
    leafyOutfit: "default",
  });

  const [dailyTasks, setDailyTasks] = useState([
    { id: "log_energy", text: "Log electricity & solar stats today", xp: 15, completed: false },
    { id: "log_water", text: "Log water savings today", xp: 15, completed: false },
    { id: "log_methane", text: "Log plant-based meal / organic compost (Methane Model)", xp: 20, completed: false },
    { id: "quiz", text: "Complete an Eco-Quiz to earn knowledge", xp: 30, completed: false },
  ]);

  const [energyLogs, setEnergyLogs] = useState([
    { date: "2026-07-07", gridEnergy: 12, solarEnergy: 6, offset: 2.4 },
    { date: "2026-07-08", gridEnergy: 10, solarEnergy: 8, offset: 3.2 },
    { date: "2026-07-09", gridEnergy: 14, solarEnergy: 5, offset: 2.0 },
  ]);

  const [waterLogs, setWaterLogs] = useState([
    { date: "2026-07-07", waterUsed: 180, waterSaved: 40 },
    { date: "2026-07-08", waterUsed: 150, waterSaved: 70 },
    { date: "2026-07-09", waterUsed: 210, waterSaved: 10 },
  ]);

  const [methaneLogs, setMethaneLogs] = useState([
    { date: "2026-07-07", dietChoice: "Plant-Based", ch4AvoidedKg: 1.8, compostedKg: 0.5 },
    { date: "2026-07-08", dietChoice: "Vegetarian", ch4AvoidedKg: 1.2, compostedKg: 1.0 },
    { date: "2026-07-09", dietChoice: "Plant-Based", ch4AvoidedKg: 1.8, compostedKg: 0.8 },
  ]);

  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState([]);
  const badges = useMemo(() => {
    const unlockedBadges = ["First Step"];
    const unlock = (condition, badge) => {
      if (condition && !unlockedBadges.includes(badge)) unlockedBadges.push(badge);
    };

    unlock(energyLogs.some((log) => log.solarEnergy > 10), "Solar Pioneer");
    unlock(waterLogs.reduce((acc, curr) => acc + curr.waterSaved, 0) >= 150, "Water Wizard");
    unlock(methaneLogs.reduce((acc, curr) => acc + curr.ch4AvoidedKg, 0) >= 4.0, "Methane Mitigation Master");
    unlock(
      completedQuizzes.includes("quiz-rio-climate") &&
        completedQuizzes.includes("quiz-rio-biodiversity") &&
        completedQuizzes.includes("quiz-rio-desertification"),
      "Rio Trio Scholar",
    );
    unlock(user.streak >= 5, "Streak Master");

    return unlockedBadges;
  }, [energyLogs, waterLogs, methaneLogs, completedQuizzes, user.streak]);
  const [levelUpMessage, setLevelUpMessage] = useState(null);

  useEffect(() => {
    if (!progress) return;
    if (Object.keys(progress.state || {}).length) {
      // Hydrate the compatibility context from the server-owned progress snapshot.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser((current) => ({ ...current, ...progress.state }));
      if (Array.isArray(progress.state.bookmarkedSchemes)) {
        setBookmarkedSchemes(progress.state.bookmarkedSchemes);
      }
    }
    if (progress.stats?.completedQuizzes?.length) {
      setCompletedQuizzes(progress.stats.completedQuizzes);
    }
  }, [progress]);

  const saveState = (values) => {
    if (persistState) persistState(values).catch(() => undefined);
  };

  const addXp = (amount) => {
    setUser((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      let leveledUp = false;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.round(100 * Math.pow(1.2, newLevel - 1));
        leveledUp = true;
      }

      if (leveledUp) {
        setLevelUpMessage(`Congratulations! You've reached Level ${newLevel}! Leafy has unlocked new insights for you!`);
      }

      const nextUser = {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
      };
      saveState(nextUser);
      return nextUser;
    });
  };

  const addEnergyLog = (gridEnergy, solarEnergy) => {
    const date = new Date().toISOString().split("T")[0];
    const offset = parseFloat((solarEnergy * 0.4).toFixed(2));
    
    setEnergyLogs((prev) => {
      const filtered = prev.filter((log) => log.date !== date);
      return [...filtered, { date, gridEnergy, solarEnergy, offset }];
    });
    if (persistLog) persistLog("energy", { gridEnergy, solarEnergy, offset }).catch(() => undefined);

    setDailyTasks((prev) =>
      prev.map((t) => (t.id === "log_energy" ? { ...t, completed: true } : t))
    );

    const task = dailyTasks.find((t) => t.id === "log_energy");
    if (task && !task.completed) {
      addXp(task.xp);
    } else {
      addXp(5);
    }
  };

  const addWaterLog = (waterUsed, waterSaved) => {
    const date = new Date().toISOString().split("T")[0];
    
    setWaterLogs((prev) => {
      const filtered = prev.filter((log) => log.date !== date);
      return [...filtered, { date, waterUsed, waterSaved }];
    });
    if (persistLog) persistLog("water", { waterUsed, waterSaved }).catch(() => undefined);

    setDailyTasks((prev) =>
      prev.map((t) => (t.id === "log_water" ? { ...t, completed: true } : t))
    );

    const task = dailyTasks.find((t) => t.id === "log_water");
    if (task && !task.completed) {
      addXp(task.xp);
    } else {
      addXp(5);
    }
  };

  const addMethaneLog = (dietChoice, compostedKg) => {
    const date = new Date().toISOString().split("T")[0];
    let ch4AvoidedKg = 0.5;
    if (dietChoice === "Plant-Based") ch4AvoidedKg = 1.8;
    if (dietChoice === "Vegetarian") ch4AvoidedKg = 1.2;

    ch4AvoidedKg += parseFloat((compostedKg * 0.4).toFixed(2));

    setMethaneLogs((prev) => {
      const filtered = prev.filter((log) => log.date !== date);
      return [...filtered, { date, dietChoice, ch4AvoidedKg, compostedKg }];
    });
    if (persistLog) persistLog("methane", { dietChoice, compostedKg, ch4AvoidedKg }).catch(() => undefined);

    setDailyTasks((prev) =>
      prev.map((t) => (t.id === "log_methane" ? { ...t, completed: true } : t))
    );

    const task = dailyTasks.find((t) => t.id === "log_methane");
    if (task && !task.completed) {
      addXp(task.xp);
    } else {
      addXp(5);
    }
  };

  const completeQuiz = async (quizId, score, reward = 60) => {
    if (score >= 60) {
      if (!completedQuizzes.includes(quizId)) {
        const persisted = persistQuiz ? await persistQuiz(quizId, reward).catch(() => null) : { created: true };
        if (!persisted?.created) return false;
        setCompletedQuizzes((prev) => [...prev, quizId]);
        addXp(reward);
      }
      
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === "quiz" ? { ...t, completed: true } : t))
      );
      
      const task = dailyTasks.find((t) => t.id === "quiz");
      if (task && !task.completed) {
        addXp(task.xp);
      }
      return true;
    }
    return false;
  };

  const claimStreakBonus = () => {
    if (!user.streakClaimed) {
      setUser((prev) => ({
        ...prev,
        streak: prev.streak + 1,
        streakClaimed: true,
      }));
      saveState({ streak: user.streak + 1, streakClaimed: true });
      addXp(25);
    }
  };

  const changeOutfit = (outfit) => {
    setUser((prev) => ({ ...prev, leafyOutfit: outfit }));
    saveState({ leafyOutfit: outfit });
  };

  const toggleBookmarkScheme = (schemeId) => {
    setBookmarkedSchemes((prev) => {
      const next = prev.includes(schemeId) ? prev.filter((id) => id !== schemeId) : [...prev, schemeId];
      saveState({ bookmarkedSchemes: next });
      return next;
    });
  };

  const resetAllData = () => {
    setUser({
      name: "Eco Champion",
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      streak: 1,
      streakClaimed: false,
      leafyOutfit: "default",
    });
    setDailyTasks([
      { id: "log_energy", text: "Log electricity & solar stats today", xp: 15, completed: false },
      { id: "log_water", text: "Log water savings today", xp: 15, completed: false },
      { id: "log_methane", text: "Log plant-based meal / organic compost (Methane Model)", xp: 20, completed: false },
      { id: "quiz", text: "Complete an Eco-Quiz to earn knowledge", xp: 30, completed: false },
    ]);
    setEnergyLogs([]);
    setWaterLogs([]);
    setMethaneLogs([]);
    setCompletedQuizzes([]);
    setBookmarkedSchemes([]);
  };

  return (
    <EcoContext.Provider
      value={{
        user,
        setUser,
        dailyTasks,
        energyLogs,
        waterLogs,
        methaneLogs,
        completedQuizzes,
        bookmarkedSchemes,
        badges,
        levelUpMessage,
        setLevelUpMessage,
        DEFAULT_SCHEMES,
        INITIAL_QUIZZES,
        addXp,
        addEnergyLog,
        addWaterLog,
        addMethaneLog,
        completeQuiz,
        claimStreakBonus,
        changeOutfit,
        toggleBookmarkScheme,
        resetAllData,
      }}
    >
      {children}
    </EcoContext.Provider>
  );
};
