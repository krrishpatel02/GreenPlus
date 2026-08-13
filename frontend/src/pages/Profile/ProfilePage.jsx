import { useState } from "react";
import { useEco } from "../../context/EcoContext";
import Mascot from "../../componentes/common/Mascot";
import { FaUser, FaTrophy, FaRedo, FaEdit, FaCheck, FaLock } from "react-icons/fa";

const ALL_BADGES = [
  { name: "First Step", desc: "Created a GreenPlus account to start the green journey.", icon: "🌱" },
  { name: "Solar Pioneer", desc: "Generated over 10 kWh of solar energy in a single day.", icon: "☀️" },
  { name: "Water Wizard", desc: "Cumulative water savings reached 150 liters.", icon: "💧" },
  { name: "Quiz Master", desc: "Completed all 3 core environmental quizzes.", icon: "🧠" },
  { name: "Streak Master", desc: "Maintained a daily tracking streak of 5+ days.", icon: "🔥" },
];

const ProfilePage = () => {
  const { user, setUser, badges, changeOutfit, resetAllData } = useEco();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSaveName = () => {
    setUser((prev) => ({ ...prev, name: tempName }));
    setEditingName(false);
  };

  const getOutfitUnlockCondition = (outfitId) => {
    switch (outfitId) {
      case "solar-cap":
        return user.level >= 2 ? "Unlocked!" : "Requires Level 2";
      case "water-goggles":
        return badges.includes("Water Wizard") ? "Unlocked!" : "Requires 'Water Wizard' badge";
      case "gardener-hat":
        return user.streak >= 3 ? "Unlocked!" : "Requires 3-Day Streak";
      case "default":
      default:
        return "Unlocked!";
    }
  };

  const isOutfitUnlocked = (outfitId) => {
    switch (outfitId) {
      case "solar-cap":
        return user.level >= 2;
      case "water-goggles":
        return badges.includes("Water Wizard");
      case "gardener-hat":
        return user.streak >= 3;
      case "default":
      default:
        return true;
    }
  };

  const outfits = [
    { id: "default", name: "Natural Leafy", outfitName: "default", desc: "Simple, green, and natural." },
    { id: "solar-cap", name: "Solar Energy Cap", outfitName: "solar-cap", desc: "A smart yellow cap with solar panel grids." },
    { id: "water-goggles", name: "Aqua Goggles", outfitName: "water-goggles", desc: "Sleek blue goggles for diving into water conservation." },
    { id: "gardener-hat", name: "Gardener Straw Hat", outfitName: "gardener-hat", desc: "A cozy straw hat decorated with a small flower." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Mascot Avatar & Outfits Customizer (Duolingo Style) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-900 self-start mb-4 flex items-center gap-2">
            <span className="text-emerald-500">👾</span> Leafy's Wardrobe
          </h3>
          
          <div className="w-full flex justify-center bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
            <Mascot mood="happy" outfit={user.leafyOutfit} speechText="Pick an outfit! Unlocking badges gets me cool hats! 🎩" />
          </div>

          <div className="w-full space-y-3">
            {outfits.map((outfit) => {
              const unlocked = isOutfitUnlocked(outfit.id);
              const active = user.leafyOutfit === outfit.outfitName;

              return (
                <button
                  key={outfit.id}
                  disabled={!unlocked}
                  onClick={() => changeOutfit(outfit.outfitName)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                    active
                      ? "border-emerald-500 bg-emerald-50/50"
                      : unlocked
                      ? "border-gray-100 hover:border-emerald-200 cursor-pointer"
                      : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{outfit.name}</span>
                      {!unlocked && <FaLock className="text-xs text-gray-400" />}
                      {active && <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Active</span>}
                    </div>
                    <span className="text-xs text-gray-400 block mt-0.5">{outfit.desc}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${unlocked ? "bg-emerald-50 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                    {getOutfitUnlockCondition(outfit.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Account Statistics & Achievement Badges (Apple + Notion Style) */}
        <div className="lg:col-span-7 space-y-8">
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                  <FaUser />
                </div>
                <div>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-lg font-bold text-gray-800 focus:outline-none focus:border-emerald-500"
                      />
                      <button onClick={handleSaveName} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">
                        <FaCheck />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{user.name}</h2>
                      <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-gray-600 p-1">
                        <FaEdit />
                      </button>
                    </div>
                  )}
                  <span className="text-xs text-gray-400 font-semibold block mt-0.5">Eco Champion Profile</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-1.5">
                  <span className="text-base">🔥</span>
                  <div>
                    <span className="block text-[10px] font-extrabold text-amber-700 leading-none uppercase">Streak</span>
                    <span className="text-sm font-extrabold text-amber-800 leading-none">{user.streak} Days</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-1.5">
                  <span className="text-base">⭐</span>
                  <div>
                    <span className="block text-[10px] font-extrabold text-emerald-700 leading-none uppercase">Level</span>
                    <span className="text-sm font-extrabold text-emerald-800 leading-none">{user.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* XP progress bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-2">
                <span>XP Progress</span>
                <span>{user.xp} / {user.xpToNextLevel} XP</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Badges Showcase */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaTrophy className="text-amber-500" /> Trophies & Badges
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_BADGES.map((badge) => {
                const unlocked = badges.includes(badge.name);

                return (
                  <div
                    key={badge.name}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      unlocked
                        ? "bg-white border-emerald-100 shadow-sm"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl filter drop-shadow-sm ${
                        unlocked ? "bg-emerald-50" : "bg-gray-200 grayscale"
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{badge.name}</span>
                        {unlocked ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">Unlocked</span>
                        ) : (
                          <span className="text-[10px] bg-gray-200 text-gray-600 font-extrabold px-1.5 py-0.2 rounded">Locked</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settings Reset Area */}
          <div className="bg-red-50/40 border border-red-100 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-red-900 text-sm flex items-center gap-1.5">
                <FaRedo className="text-red-500" /> Danger Zone
              </h4>
              <p className="text-xs text-red-700/70 mt-1">
                Resetting deletes all logged water/energy charts and restarts levels at 1.
              </p>
            </div>

            {resetConfirm ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    resetAllData();
                    setResetConfirm(false);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full sm:w-auto px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Reset All Progress
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
