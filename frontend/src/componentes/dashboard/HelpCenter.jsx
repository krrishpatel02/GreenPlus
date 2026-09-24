import { useMemo, useState } from "react";
import { FaBookOpen, FaChevronDown, FaSearch } from "react-icons/fa";

const ARTICLES = [
  { category: "Getting started", title: "How do I use GreenPlus?", body: "Start with the Overview tab, then log energy, water, or methane activity. Your completed quizzes, XP, streak, badges, and bookmarks are saved to your account when you are signed in." },
  { category: "Account", title: "Why was I sent back to login?", body: "GreenPlus signs you out when an access token expires or is rejected. Sign in again to continue; unsaved requests are not treated as completed." },
  { category: "Assistant", title: "What can I ask Leafy?", body: "Ask about weather, rain, solar timing, EV charging, energy, water, waste, transport, food, carbon, air quality, or environmental explanations. Leafy supports English, Gujarati, Hindi, Hinglish, Gujlish, and mixed-script follow-ups." },
  { category: "Voice", title: "How does voice assistance work?", body: "Use the microphone button in the AI Nudge Assistant. Your browser must support Speech Recognition and microphone permission must be allowed. Use the speaker button to hear Leafy's latest reply." },
  { category: "Predictions", title: "Are all model results equally reliable?", body: "No. Results are labelled by source and some weak or leakage-prone models are gated. UV and wind use external Open-Meteo fallbacks when their local artifacts are rejected." },
  { category: "Notifications", title: "How do I control notifications?", body: "Use the notification controls in the AI tab to pause alerts, set quiet hours, choose channels, filter categories, mark alerts read, or dismiss them. These preferences are saved per account." },
  { category: "Quizzes", title: "Why did a retake not award XP?", body: "Each quiz awards XP only once after a passing score. Retakes still show your score, but duplicate completion cannot increase your account XP." },
  { category: "Government schemes", title: "Are the Indian schemes real?", body: "The scheme catalog contains named Indian government programmes with official government or implementation-portal links. Eligibility, dates, subsidy amounts, and state availability can change, so confirm details on the linked official portal before applying." },
  { category: "Privacy and safety", title: "How is my data separated?", body: "Protected API records are keyed to your authenticated account. Do not enter passwords, payment details, or other secrets into assistant messages." },
];

const HelpCenter = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openTitle, setOpenTitle] = useState("");
  const categories = ["All", ...new Set(ARTICLES.map((article) => article.category))];
  const articles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ARTICLES.filter((article) => {
      const matchesCategory = category === "All" || article.category === category;
      const searchable = `${article.category} ${article.title} ${article.body}`.toLowerCase();
      return matchesCategory && (!normalized || searchable.includes(normalized));
    });
  }, [category, query]);

  return (
    <div className="dashboard-tab-stage space-y-8 max-w-5xl mx-auto animate-fadeIn">
      <section className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-3xl p-8 shadow-lg">
        <div className="flex items-start gap-4">
          <span className="text-3xl"><FaBookOpen /></span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-bold">GreenPlus support</p>
            <h2 className="text-3xl font-extrabold mt-2">Help Center</h2>
            <p className="text-sm text-emerald-100 mt-2 max-w-2xl">Find practical answers about your account, assistant, predictions, quizzes, notifications, and official Indian schemes.</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Search help articles</span>
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search help articles..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-emerald-500" />
          </label>
          <label>
            <span className="sr-only">Help category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full md:w-52 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-500">
              {categories.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-3">
        {articles.map((article) => {
          const expanded = openTitle === article.title;
          return (
            <article key={article.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button type="button" onClick={() => setOpenTitle(expanded ? "" : article.title)} className="w-full flex items-center justify-between gap-4 text-left p-5 hover:bg-slate-50 transition">
                <span><span className="block text-[10px] uppercase tracking-wider font-bold text-emerald-600">{article.category}</span><span className="block mt-1 font-bold text-slate-900">{article.title}</span></span>
                <FaChevronDown className={`shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{article.body}</p>}
            </article>
          );
        })}
        {!articles.length && <p className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-sm text-slate-500">No help article matches that search.</p>}
      </section>
    </div>
  );
};

export default HelpCenter;
