import React, { createContext, useState, useContext, useEffect } from "react";

const EcoContext = createContext();

export const useEco = () => useContext(EcoContext);

const DEFAULT_SCHEMES = [
  {
    id: "scheme-1",
    title: "Residential Solar Rebate Program",
    category: "Solar",
    authority: "Federal Energy Dept",
    reward: "Up to 30% tax credit",
    status: "Open",
    difficulty: "Medium",
    desc: "Get a tax rebate of up to 30% on installations of home solar panels and battery storage equipment.",
    sdgs: ["SDG 7: Clean Energy", "SDG 13: Climate Action"],
  },
  {
    id: "scheme-2",
    title: "EV Home Charger Installation Subsidy",
    category: "Transport",
    authority: "State Power Grid",
    reward: "$500 rebate + low EV rates",
    status: "Open",
    difficulty: "Easy",
    desc: "Subsidize the purchase and installation of level-2 EV smart chargers at your home, plus special overnight electric pricing.",
    sdgs: ["SDG 11: Sustainable Cities", "SDG 13: Climate Action"],
  },
  {
    id: "scheme-3",
    title: "Smart Thermostat & Heat Pump Incentives",
    category: "Energy Efficiency",
    authority: "Municipal Utilities",
    reward: "Free device or $150 credit",
    status: "Open",
    difficulty: "Easy",
    desc: "Provides cash-back rebates for installing smart learning thermostats or energy-efficient electric heat pumps.",
    sdgs: ["SDG 7: Clean Energy", "SDG 12: Responsible Consumption"],
  },
  {
    id: "scheme-4",
    title: "Rainwater Harvesting & Xeriscaping Grant",
    category: "Water Conservation",
    authority: "Water Resource Board",
    reward: "Up to $1,000 reimbursement",
    status: "Closing Soon",
    difficulty: "Hard",
    desc: "Provides funding for homeowners who convert water-intensive turf lawns to drought-tolerant landscaping or build collection tanks.",
    sdgs: ["SDG 6: Clean Water", "SDG 15: Life on Land"],
  },
];

const INITIAL_QUIZZES = [
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
  const [badges, setBadges] = useState(["First Step"]);
  const [levelUpMessage, setLevelUpMessage] = useState(null);

  // Auto unlock research-backed badges based on state
  useEffect(() => {
    const newBadges = [...badges];
    let updated = false;

    // Solar Pioneer
    if (energyLogs.some((log) => log.solarEnergy > 10) && !newBadges.includes("Solar Pioneer")) {
      newBadges.push("Solar Pioneer");
      updated = true;
    }
    // Water Wizard
    if (waterLogs.reduce((acc, curr) => acc + curr.waterSaved, 0) >= 150 && !newBadges.includes("Water Wizard")) {
      newBadges.push("Water Wizard");
      updated = true;
    }
    // Methane Mitigation Master
    if (methaneLogs.reduce((acc, curr) => acc + curr.ch4AvoidedKg, 0) >= 4.0 && !newBadges.includes("Methane Mitigation Master")) {
      newBadges.push("Methane Mitigation Master");
      updated = true;
    }
    // Rio Trio Scholar
    if (
      completedQuizzes.includes("quiz-rio-climate") &&
      completedQuizzes.includes("quiz-rio-biodiversity") &&
      completedQuizzes.includes("quiz-rio-desertification") &&
      !newBadges.includes("Rio Trio Scholar")
    ) {
      newBadges.push("Rio Trio Scholar");
      updated = true;
    }
    // Streak Master
    if (user.streak >= 5 && !newBadges.includes("Streak Master")) {
      newBadges.push("Streak Master");
      updated = true;
    }

    if (updated) {
      setBadges(newBadges);
    }
  }, [energyLogs, waterLogs, methaneLogs, completedQuizzes, user.streak]);

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

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
      };
    });
  };

  const addEnergyLog = (gridEnergy, solarEnergy) => {
    const date = new Date().toISOString().split("T")[0];
    const offset = parseFloat((solarEnergy * 0.4).toFixed(2));
    
    setEnergyLogs((prev) => {
      const filtered = prev.filter((log) => log.date !== date);
      return [...filtered, { date, gridEnergy, solarEnergy, offset }];
    });

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

  const completeQuiz = (quizId, score) => {
    if (score >= 60) {
      if (!completedQuizzes.includes(quizId)) {
        setCompletedQuizzes((prev) => [...prev, quizId]);
        addXp(60);
      }
      
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === "quiz" ? { ...t, completed: true } : t))
      );
      
      const task = dailyTasks.find((t) => t.id === "quiz");
      if (task && !task.completed) {
        addXp(task.xp);
      }
    }
  };

  const claimStreakBonus = () => {
    if (!user.streakClaimed) {
      setUser((prev) => ({
        ...prev,
        streak: prev.streak + 1,
        streakClaimed: true,
      }));
      addXp(25);
    }
  };

  const changeOutfit = (outfit) => {
    setUser((prev) => ({ ...prev, leafyOutfit: outfit }));
  };

  const toggleBookmarkScheme = (schemeId) => {
    setBookmarkedSchemes((prev) =>
      prev.includes(schemeId)
        ? prev.filter((id) => id !== schemeId)
        : [...prev, schemeId]
    );
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
    setBadges(["First Step"]);
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
