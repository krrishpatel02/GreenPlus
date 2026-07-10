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
  },
];

const INITIAL_QUIZZES = [
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
    leafyOutfit: "default", // default, solar-cap, water-goggles, gardener-hat
  });

  const [dailyTasks, setDailyTasks] = useState([
    { id: "log_energy", text: "Log electricity & solar stats today", xp: 15, completed: false },
    { id: "log_water", text: "Log water savings today", xp: 15, completed: false },
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

  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState([]);
  const [badges, setBadges] = useState(["First Step"]);
  const [levelUpMessage, setLevelUpMessage] = useState(null);

  // Auto unlock badges based on state
  useEffect(() => {
    const newBadges = [...badges];
    let updated = false;

    // Solar Pioneer Badge
    if (energyLogs.some(log => log.solarEnergy > 10) && !newBadges.includes("Solar Pioneer")) {
      newBadges.push("Solar Pioneer");
      updated = true;
    }
    // Water Wizard Badge
    if (waterLogs.reduce((acc, curr) => acc + curr.waterSaved, 0) >= 150 && !newBadges.includes("Water Wizard")) {
      newBadges.push("Water Wizard");
      updated = true;
    }
    // Quiz Master
    if (completedQuizzes.length >= 3 && !newBadges.includes("Quiz Master")) {
      newBadges.push("Quiz Master");
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
  }, [energyLogs, waterLogs, completedQuizzes, user.streak]);

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
        setLevelUpMessage(`Congratulations! You've reached Level ${newLevel}! Leafy has got some advice for you!`);
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
    const offset = parseFloat((solarEnergy * 0.4).toFixed(2)); // 0.4kg CO2 saved per kWh of solar
    
    // update logs
    setEnergyLogs((prev) => {
      const filtered = prev.filter((log) => log.date !== date);
      return [...filtered, { date, gridEnergy, solarEnergy, offset }];
    });

    // complete task
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === "log_energy" ? { ...t, completed: true } : t))
    );

    // Give XP if task wasn't completed
    const task = dailyTasks.find((t) => t.id === "log_energy");
    if (task && !task.completed) {
      addXp(task.xp);
    } else {
      addXp(5); // minor participation XP
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

  const completeQuiz = (quizId, score) => {
    if (score >= 100) { // Passed
      if (!completedQuizzes.includes(quizId)) {
        setCompletedQuizzes((prev) => [...prev, quizId]);
        addXp(50);
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
      { id: "quiz", text: "Complete an Eco-Quiz to earn knowledge", xp: 30, completed: false },
    ]);
    setEnergyLogs([]);
    setWaterLogs([]);
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
