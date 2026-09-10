import { useEffect, useState } from "react";

const initialMetrics = {
  energyOffset: 0,
  waterSaved: 0,
  methaneAvoided: 0,
  energyCount: 0,
  waterCount: 0,
  methaneCount: 0,
  completedQuizCount: 0,
  bookmarkedSchemeCount: 0,
  quizCount: 0,
};

const useDashboardMetricsWorker = (payload) => {
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/dashboardMetrics.worker.js", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = ({ data }) => setMetrics(data);
    worker.onerror = () => worker.terminate();
    worker.postMessage(payload);

    return () => worker.terminate();
  }, [payload]);

  return metrics;
};

export default useDashboardMetricsWorker;
