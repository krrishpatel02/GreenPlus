const sum = (items, key) => items.reduce((total, item) => total + (Number(item[key]) || 0), 0);

self.onmessage = ({ data }) => {
  const {
    energyLogs = [],
    waterLogs = [],
    methaneLogs = [],
    completedQuizzes = [],
    bookmarkedSchemes = [],
    quizCount = 0,
  } = data;

  self.postMessage({
    energyOffset: sum(energyLogs, "offset"),
    waterSaved: sum(waterLogs, "waterSaved"),
    methaneAvoided: sum(methaneLogs, "ch4AvoidedKg"),
    energyCount: energyLogs.length,
    waterCount: waterLogs.length,
    methaneCount: methaneLogs.length,
    completedQuizCount: completedQuizzes.length,
    bookmarkedSchemeCount: bookmarkedSchemes.length,
    quizCount,
  });
};
