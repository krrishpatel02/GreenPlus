import { motion } from "framer-motion";

const NAV_ITEMS = [
  ["overview", "📊", "Overview"],
  ["energy", "⚡", "Energy & XAI"],
  ["water", "💧", "Water & Sensors"],
  ["methane", "🐮", "Methane Model"],
  ["learning", "🌍", "Rio Trio Quizzes"],
  ["schemes", "🏛️", "Green Schemes"],
  ["ai", "🤖", "AI Nudge Assistant"],
  ["research", "📚", "Research Library"],
  ["leaderboard", "🏆", "Leaderboard"],
];

const DashboardSidebar = ({ activeTab, setActiveTab, sidebarOpen }) => (
  <motion.aside
    animate={{ width: sidebarOpen ? 260 : 0 }}
    className="dashboard-sidebar bg-slate-900 text-slate-300 border-r border-slate-800 overflow-hidden flex flex-col shrink-0 z-40"
  >
    <div className="dashboard-sidebar__header p-5 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">🌿</span>
        <span className="font-extrabold text-white text-sm tracking-wide font-sans">GreenPlus Space</span>
      </div>
      <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded">v2.0 Verified</span>
    </div>

    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      <div className="text-[10px] uppercase font-bold text-slate-500 px-3 mb-2 tracking-wider">RESEARCH MODULES</div>
      {NAV_ITEMS.map(([tab, icon, label]) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          aria-current={activeTab === tab ? "page" : undefined}
          className={`dashboard-nav-button w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === tab ? "bg-slate-800 text-white shadow-sm" : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="dashboard-nav-icon">{icon}</span>
          <span className="dashboard-nav-label">{label}</span>
          {activeTab === tab && <span className="dashboard-nav-active" />}
        </button>
      ))}
    </nav>

    <div className="dashboard-sidebar__footer p-4 border-t border-slate-800 bg-slate-900/60">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Research Fact-Checked</span>
      </div>
    </div>
  </motion.aside>
);

export default DashboardSidebar;
