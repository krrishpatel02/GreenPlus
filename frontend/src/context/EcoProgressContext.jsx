import { createContext, useContext, useEffect, useState } from "react";
import { progressApi } from "../services/api";
import { useAuth } from "./AuthContext";

const EcoProgressContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useEcoProgress = () => useContext(EcoProgressContext);

export function EcoProgressProvider({ children }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState({ stats: { xp: 0, level: 1, completedQuizzes: [] }, state: {}, logs: [] });

  useEffect(() => {
    setProgress({ stats: { xp: 0, level: 1, completedQuizzes: [] }, state: {}, logs: [] });
    if (!user || !localStorage.getItem("greenplus_token")) return undefined;
    let active = true;
    progressApi.get().then((data) => {
      if (active) setProgress(data);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [user]);

  const addLog = async (type, values) => {
    const result = await progressApi.addLog(type, values);
    setProgress((current) => ({ ...current, logs: [result, ...current.logs] }));
    return result;
  };

  const updateState = async (values) => {
    const state = await progressApi.updateState(values);
    setProgress((current) => ({ ...current, state }));
    return state;
  };

  const completeQuiz = async (quizId, xp) => {
    const result = await progressApi.completeQuiz(quizId, xp);
    if (result.created) {
      setProgress((current) => ({
        ...current,
        stats: { ...current.stats, xp: current.stats.xp + xp, level: Math.floor((current.stats.xp + xp) / 100) + 1, completedQuizzes: [...current.stats.completedQuizzes, quizId] },
      }));
    }
    return result;
  };

  return <EcoProgressContext.Provider value={{ progress, addLog, updateState, completeQuiz }}>{children}</EcoProgressContext.Provider>;
}