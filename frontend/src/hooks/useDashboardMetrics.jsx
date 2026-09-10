import { useMemo } from "react";
import { FaBolt, FaDatabase, FaGraduationCap, FaSearch, FaTint, FaTrophy } from "react-icons/fa";
import useDashboardMetricsWorker from "./useDashboardMetricsWorker";

const useDashboardMetrics = ({ energyLogs, waterLogs, methaneLogs, completedQuizzes, bookmarkedSchemes, quizCount }) => {
  const workerPayload = useMemo(() => ({
    energyLogs,
    waterLogs,
    methaneLogs,
    completedQuizzes,
    bookmarkedSchemes,
    quizCount,
  }), [energyLogs, waterLogs, methaneLogs, completedQuizzes, bookmarkedSchemes, quizCount]);
  const metrics = useDashboardMetricsWorker(workerPayload);

  const overviewPulse = useMemo(() => [
    {
      id: "energy",
      label: "Energy offset",
      value: `${metrics.energyOffset.toFixed(1)} kg`,
      detail: `${metrics.energyCount} logged entries`,
      icon: <FaBolt />,
      tone: "mint",
    },
    {
      id: "water",
      label: "Water saved",
      value: `${metrics.waterSaved} L`,
      detail: `${metrics.waterCount} conservation logs`,
      icon: <FaTint />,
      tone: "cyan",
    },
    {
      id: "methane",
      label: "Methane avoided",
      value: `${metrics.methaneAvoided.toFixed(1)} kg`,
      detail: `${metrics.methaneCount} mitigation logs`,
      icon: <span aria-hidden="true">CH₄</span>,
      tone: "purple",
    },
    {
      id: "learning",
      label: "Research progress",
      value: `${metrics.completedQuizCount} / ${metrics.quizCount}`,
      detail: `${metrics.bookmarkedSchemeCount} schemes bookmarked`,
      icon: <FaGraduationCap />,
      tone: "mint",
    },
  ], [metrics]);

  const overviewModules = useMemo(() => [
    ["schemes", "Green Schemes", <FaDatabase />],
    ["ai", "AI Nudge Assistant", <span aria-hidden="true">✦</span>],
    ["research", "Research Library", <FaSearch />],
    ["leaderboard", "Leaderboard", <FaTrophy />],
  ], []);

  return { overviewPulse, overviewModules };
};

export default useDashboardMetrics;
