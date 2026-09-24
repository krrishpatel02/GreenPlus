import { useEffect, useState } from "react";
import { FaDatabase, FaUsers, FaServer, FaSyncAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { adminApi } from "../../services/api";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const statusClass = (available) => (available ? "text-emerald-300" : "text-red-300");

const AdminPage = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      setOverview(await adminApi.overview());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    adminApi.overview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const users = overview?.users || [];
  const databaseAvailable = overview?.database?.available;

  return (
    <main className="min-h-screen px-5 pb-16 pt-28 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">GreenPlus control room</p>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Admin overview</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Monitor the database connection and inspect every stored eco profile.</p>
          </div>
          <button onClick={loadOverview} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/20 disabled:opacity-50">
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh data
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200" role="alert">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between text-emerald-300"><FaDatabase /><span className="text-xs font-bold uppercase tracking-wider">Database</span></div>
            <p className={`text-2xl font-black ${statusClass(databaseAvailable)}`}>{databaseAvailable ? "Connected" : loading ? "Checking..." : "Unavailable"}</p>
            <p className="mt-1 text-xs text-slate-400">{overview?.database?.database || "MongoDB"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between text-amber-300"><FaUsers /><span className="text-xs font-bold uppercase tracking-wider">Profiles</span></div>
            <p className="text-3xl font-black text-white">{loading ? "-" : users.length}</p>
            <p className="mt-1 text-xs text-slate-400">Stored user accounts</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between text-sky-300"><FaServer /><span className="text-xs font-bold uppercase tracking-wider">API service</span></div>
            <p className="flex items-center gap-2 text-2xl font-black text-emerald-300"><FaCheckCircle className="text-base" /> Online</p>
            <p className="mt-1 text-xs text-slate-400">Models load when needed</p>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 shadow-xl">
          <div className="border-b border-white/10 px-5 py-5">
            <h2 className="text-xl font-bold">Stored profiles</h2>
            <p className="mt-1 text-sm text-slate-400">Public profile data returned from MongoDB. Passwords are never displayed.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Level</th><th className="px-5 py-4">XP</th><th className="px-5 py-4">Streak</th><th className="px-5 py-4">Created</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-emerald-300/5">
                    <td className="px-5 py-4 font-bold text-white">{user.name}</td>
                    <td className="px-5 py-4 text-slate-300">{user.email}</td>
                    <td className="px-5 py-4 text-emerald-300">{user.level}</td>
                    <td className="px-5 py-4 text-slate-300">{user.xp} / {user.xpToNextLevel}</td>
                    <td className="px-5 py-4 text-amber-300">{user.streak} days</td>
                    <td className="px-5 py-4 text-slate-400">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
                {!loading && users.length === 0 && <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-400">No profiles stored yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminPage;
