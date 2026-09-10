import { motion } from "framer-motion";
import { FaAngleRight, FaCheckCircle, FaFire, FaRegCircle } from "react-icons/fa";
import Mascot from "../common/Mascot";
import TiltCard from "./TiltCard";
import { dashboardRipple, dashboardStagger } from "./dashboardMotion";

const DashboardOverview = ({
  user,
  dailyTasks,
  overviewPulse,
  overviewModules,
  claimStreakBonus,
  setActiveTab,
  realtimeStatus,
}) => (
  <motion.div
    className="dashboard-tab-stage dashboard-bento grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-fadeIn"
    variants={dashboardStagger}
    initial="hidden"
    animate="show"
  >
    <TiltCard variants={dashboardRipple} className="dashboard-bento-card dashboard-bento-card--streak bg-[#0C0C0D] border-zinc-800/80 rounded-2xl col-span-1 md:col-span-2 xl:col-span-2 border p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-20 h-20 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center text-4xl shadow-inner">
          <FaFire className="text-amber-500 animate-bounce" />
          <span className="absolute bottom-[-5px] right-[-5px] bg-amber-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow">
            {user.streak}d
          </span>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Current Streak: {user.streak} Days!</h2>
          <p className="text-slate-400 text-sm mt-1">Log carbon metrics daily to grow your leaf and level up.</p>
          <button
            disabled={user.streakClaimed}
            onClick={claimStreakBonus}
            className={`mt-4 px-6 py-3 font-bold rounded-2xl text-sm transition-all profile-reset-button dashboard-streak-button ${
              user.streakClaimed
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-white shadow-[0_4px_0_0_#d97706] active:translate-y-1 active:shadow-none cursor-pointer"
            }`}
          >
            {user.streakClaimed ? "Streak Claimed Today ✓" : "Claim Daily Streak Bonus (+25 XP)"}
          </button>
        </div>
      </div>
      <div className="dashboard-bento-inset w-full md:w-[320px] rounded-2xl border p-5">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-600 mb-2">
          <span className="flex items-center gap-1">⭐ Level {user.level}</span>
          <span>{user.xp} / {user.xpToNextLevel} XP</span>
        </div>
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }} />
        </div>
        <span className="text-[10px] text-slate-400 block text-right font-semibold">
          {user.xpToNextLevel - user.xp} XP remaining to Level {user.level + 1}
        </span>
      </div>
    </TiltCard>

    <TiltCard variants={dashboardRipple} className="dashboard-bento-card dashboard-bento-card--nudge bg-[#0C0C0D] border-zinc-800/80 rounded-2xl col-span-1 md:col-span-3 xl:col-span-2 border p-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="space-y-2 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
          🤖 Module 4: Action Prediction & Digital Nudges
        </div>
        <span className="dashboard-realtime-status" data-status={realtimeStatus}>
          {realtimeStatus === "disabled" ? "Local data mode" : `Realtime ${realtimeStatus}`}
        </span>
        <h3 className="text-xl font-extrabold text-white">Predicted Green Action Likelihood: 88%</h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          "Personalized LLM-generated nudges outperform generic nudges for household resource conservation." — *Journal of Computer Information Systems (2025/2026)*
        </p>
      </div>
      <button onClick={() => setActiveTab("ai")} className="profile-reset-button dashboard-nudge-button px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all cursor-pointer shrink-0 text-xs">
        Open Nudge Assistant
      </button>
    </TiltCard>

    <motion.div className="dashboard-overview-pulse col-span-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" variants={dashboardStagger}>
      {overviewPulse.map((metric) => (
        <motion.button key={metric.id} variants={dashboardRipple} onClick={() => setActiveTab(metric.id)} className={`dashboard-pulse-card dashboard-pulse-card--${metric.tone} text-left rounded-2xl border p-5 cursor-pointer`} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <span className="dashboard-pulse-card__topline"><span className="dashboard-pulse-card__icon">{metric.icon}</span><span>OPEN MODULE</span></span>
          <span className="dashboard-pulse-card__label">{metric.label}</span>
          <strong>{metric.value}</strong>
          <span className="dashboard-pulse-card__detail">{metric.detail}</span>
        </motion.button>
      ))}
    </motion.div>

    <motion.div className="dashboard-bento-grid grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 col-span-full" variants={dashboardStagger}>
      <TiltCard variants={dashboardRipple} className="dashboard-bento-card dashboard-bento-card--checklist bg-[#0C0C0D] border-zinc-800/80 rounded-2xl col-span-1 md:col-span-2 xl:col-span-2 border p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><span>📅</span> Daily Eco-Checklist</h3>
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <div key={task.id} onClick={() => {
              if (task.id === "log_energy") setActiveTab("energy");
              if (task.id === "log_water") setActiveTab("water");
              if (task.id === "log_methane") setActiveTab("methane");
              if (task.id === "quiz") setActiveTab("learning");
            }} className={`p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${task.completed ? "bg-emerald-50/30 border-emerald-100 text-slate-400 line-through" : "bg-white border-slate-100 hover:border-emerald-200 text-slate-800 hover:bg-slate-50/30"}`}>
              <div className="flex items-center gap-3">
                {task.completed ? <FaCheckCircle className="text-emerald-500 text-lg" /> : <FaRegCircle className="text-slate-300 text-lg" />}
                <span className="font-semibold text-sm">{task.text}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded ${task.completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>+{task.xp} XP</span>
            </div>
          ))}
        </div>
      </TiltCard>

      <TiltCard variants={dashboardRipple} className="dashboard-bento-card dashboard-bento-card--mascot bg-[#0C0C0D] border-zinc-800/80 rounded-2xl col-span-1 md:col-span-1 xl:col-span-2 border p-6 flex flex-col items-center justify-center text-center">
        <Mascot mood={user.streakClaimed ? "celebrate" : "happy"} outfit={user.leafyOutfit} speechText={user.streakClaimed ? "Fantastic! Our streak is active. Check out my wardrobe outfits in the Profile to dress me up!" : "Welcome back to our control center! Complete the eco checklist items to boost our score."} />
      </TiltCard>
    </motion.div>

    <motion.div className="dashboard-module-launcher col-span-full" variants={dashboardRipple}>
      <div><span className="dashboard-module-launcher__eyebrow">Workspace modules</span><h3>Continue your green work</h3></div>
      <div className="dashboard-module-launcher__actions">
        {overviewModules.map(([id, label, icon]) => (
          <motion.button key={id} onClick={() => setActiveTab(id)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="dashboard-module-launcher__button"><span>{icon}</span>{label}<FaAngleRight /></motion.button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

export default DashboardOverview;
