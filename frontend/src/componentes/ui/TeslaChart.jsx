import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TeslaChart = ({ type = "energy", dataLogs = [] }) => {
  // Sort logs by date ascending to render chronologically
  const sortedLogs = [...dataLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sortedLogs.map((log) => {
    const d = new Date(log.date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const getChartData = () => {
    if (type === "energy") {
      const gridData = sortedLogs.map((log) => log.gridEnergy || 0);
      const solarData = sortedLogs.map((log) => log.solarEnergy || 0);

      return {
        labels,
        datasets: [
          {
            label: "Solar Generation (kWh)",
            data: solarData,
            borderColor: "#10b981", // Emerald Green
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
              gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
              return gradient;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: "#10b981",
            pointHoverRadius: 7,
            shadowColor: "rgba(16, 185, 129, 0.5)",
            shadowBlur: 10,
          },
          {
            label: "Grid Consumption (kWh)",
            data: gridData,
            borderColor: "#eab308", // Energy Yellow
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(234, 179, 8, 0.2)");
              gradient.addColorStop(1, "rgba(234, 179, 8, 0.0)");
              return gradient;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: "#eab308",
            pointHoverRadius: 5,
          },
        ],
      };
    } else {
      // Water
      const usedData = sortedLogs.map((log) => log.waterUsed || 0);
      const savedData = sortedLogs.map((log) => log.waterSaved || 0);

      return {
        labels,
        datasets: [
          {
            label: "Water Saved (Liters)",
            data: savedData,
            borderColor: "#3b82f6", // Water Blue
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
              gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
              return gradient;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: "#3b82f6",
            pointHoverRadius: 7,
          },
          {
            label: "Water Used (Liters)",
            data: usedData,
            borderColor: "#9ca3af", // Slate Gray
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(156, 163, 175, 0.2)");
              gradient.addColorStop(1, "rgba(156, 163, 175, 0.0)");
              return gradient;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: "#9ca3af",
            pointHoverRadius: 5,
          },
        ],
      };
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#f3f4f6", // Light Gray text
          font: {
            family: "Inter, sans-serif",
            weight: "600",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(75, 85, 99, 0.15)",
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "Inter, sans-serif",
          },
        },
      },
      y: {
        grid: {
          color: "rgba(75, 85, 99, 0.15)",
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "Inter, sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px] p-4 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 shadow-2xl">
      {sortedLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[260px] text-gray-500 font-medium">
          <svg className="w-12 h-12 mb-3 text-gray-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          No logged history yet. Complete tasks below to see your chart grow!
        </div>
      ) : (
        <Line data={getChartData()} options={options} />
      )}
    </div>
  );
};

export default TeslaChart;
