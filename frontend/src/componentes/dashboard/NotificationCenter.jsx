import { useMemo, useState } from "react";
import { FaBell, FaCheck, FaRegBell } from "react-icons/fa";
import { useNotifications } from "../../context/NotificationContext";

const ICONS = {
  RAIN_EXPECTED: "🌧️",
  SOLAR_WINDOW_AVAILABLE: "☀️",
  SOLAR_GENERATION_DROPPING: "🌥️",
  HIGH_CLOUD_COVER: "🌥️",
  EV_CHARGING_RECOMMENDATION: "🔋",
  EXTREME_HEAT: "🌡️",
  AIR_QUALITY_WARNING: "🌿",
};

const CHANNELS = ["in_app", "web_push", "email", "mobile", "wearable"];

const NotificationCenter = () => {
  const { notifications, unread, preferences, markRead, markAllRead, dismiss, updatePreferences } = useNotifications();
  const [category, setCategory] = useState("ALL");
  const [channel, setChannel] = useState("ALL");
  const allowedCategories = useMemo(() => preferences.categories || [], [preferences.categories]);
  const filteredNotifications = useMemo(() => notifications.filter((item) => {
    const categoryMatch = category === "ALL" || item.type === category;
    const channelMatch = channel === "ALL" || (item.channels || []).includes(channel);
    const preferenceMatch = !allowedCategories.length || allowedCategories.includes(item.type);
    return categoryMatch && channelMatch && preferenceMatch;
  }), [allowedCategories, category, channel, notifications]);

  const toggleChannel = (value) => {
    const channels = preferences.channels || [];
    updatePreferences({ channels: channels.includes(value) ? channels.filter((item) => item !== value) : [...channels, value] }).catch(() => undefined);
  };

  const toggleCategoryPreference = (value) => {
    const categories = preferences.categories || [];
    updatePreferences({ categories: categories.includes(value) ? categories.filter((item) => item !== value) : [...categories, value] }).catch(() => undefined);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-600">Right when it matters</p>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><FaBell className="text-amber-400" /> Eco notifications {unread > 0 && <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-1">{unread} new</span>}</h3>
        </div>
        <div className="flex items-center gap-2">
          <select aria-label="Notification category" value={category} onChange={(event) => setCategory(event.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1">
            <option value="ALL">All</option>
            {[...new Set(notifications.map((item) => item.type))].map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
          </select>
          <select aria-label="Notification channel" value={channel} onChange={(event) => setChannel(event.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1">
            <option value="ALL">All channels</option>
            {CHANNELS.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
          </select>
          {unread > 0 && <button type="button" onClick={markAllRead} className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"><FaCheck /> Mark read</button>}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <label className="flex items-center gap-2"><input type="checkbox" checked={preferences.enabled !== false} onChange={(event) => updatePreferences({ enabled: event.target.checked })} /> Notifications enabled</label>
        <label className="flex items-center gap-1">Quiet from <input aria-label="Quiet hours start" type="number" min="0" max="23" value={preferences.quietStart ?? 22} onChange={(event) => updatePreferences({ quietStart: Number(event.target.value) })} className="w-12 border border-slate-200 rounded px-1 py-0.5" />:00</label>
        <label className="flex items-center gap-1">until <input aria-label="Quiet hours end" type="number" min="0" max="23" value={preferences.quietEnd ?? 7} onChange={(event) => updatePreferences({ quietEnd: Number(event.target.value) })} className="w-12 border border-slate-200 rounded px-1 py-0.5" />:00</label>
      </div>
      <div className="mb-4 space-y-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">Delivery channels</span>
        <div className="flex flex-wrap gap-3">
          {CHANNELS.map((value) => <label key={value} className="flex items-center gap-1"><input type="checkbox" checked={(preferences.channels || []).includes(value)} onChange={() => toggleChannel(value)} /> {value.replaceAll("_", " ")}</label>)}
        </div>
      </div>
      {notifications.length > 0 && <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">Allowed categories</span>
        {[...new Set(notifications.map((item) => item.type))].map((value) => <label key={value} className="flex items-center gap-1"><input type="checkbox" checked={!allowedCategories.length || allowedCategories.includes(value)} onChange={() => toggleCategoryPreference(value)} /> {value.replaceAll("_", " ")}</label>)}
      </div>}
      {!preferences.enabled && <p className="text-xs text-amber-700 mb-3">Notifications are paused in your preferences.</p>}
      {filteredNotifications.length === 0 && <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 flex gap-3 items-start"><FaRegBell className="mt-0.5 text-emerald-500" /><span>No alerts right now. Leafy will only nudge you when there is something useful to act on.</span></div>}
      <div className="space-y-3">
        {filteredNotifications.map((item) => (
          <article key={item.id} className={`rounded-2xl border p-4 transition ${item.read ? "border-slate-100 bg-white" : "border-emerald-200 bg-emerald-50/60"}`}>
            <div className="flex gap-3">
              <span className="text-2xl" aria-hidden="true">{ICONS[item.type] || "🌱"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3"><h4 className="font-bold text-slate-900 text-sm">{item.title}</h4><span className="text-[10px] uppercase font-bold text-slate-400">{item.priority}</span></div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.message}</p>
                <div className="mt-3 flex items-center justify-between gap-2"><time className="text-[11px] text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}</time><div className="flex gap-2">{!item.read && <button type="button" onClick={() => markRead(item.id)} className="text-xs font-bold text-emerald-700 hover:text-emerald-900">Mark as read</button>}<button type="button" onClick={() => dismiss(item.id)} className="text-xs font-bold text-slate-500 hover:text-slate-800">Dismiss</button></div></div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default NotificationCenter;
