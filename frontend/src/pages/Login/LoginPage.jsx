import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEco } from "../../context/EcoContext";
import Mascot from "../../componentes/common/Mascot";
import { motion } from "framer-motion";
import AnimatedPage from "../../componentes/common/AnimatedPage";
import { authApi } from "../../services/api";
import "../Auth/AuthPage.css";

const LoginPage = () => {
  const { setUser } = useEco();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Eco Champion");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setUser(data.user);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="auth-motion-page">
    <div className="auth-page auth-scene auth-scene--login min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="auth-orb auth-orb--mint"></div>
      <div className="auth-orb auth-orb--blue"></div>
      <div className="auth-starfield" aria-hidden="true"></div>
      <div className="auth-light-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="auth-floor-grid" aria-hidden="true"></div>
      <div className="auth-brand-mark"><span>✦</span> GREENPLUS <small>ENVIRONMENTAL CONTROL</small></div>
      <Link to="/" className="auth-home-link">← Return to home</Link>
      <div className="auth-leafy auth-leafy--login">
        <Mascot mood="happy" speechText="Welcome back! Ready to grow your eco-streak?" />
      </div>
      <div className="auth-form-panel auth-card">
          <div className="auth-form-heading mb-8">
            <span className="auth-card__eyebrow">WELCOME BACK</span>
            <h2>Sign in</h2>
            <p>Continue your journey toward a lighter footprint.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form space-y-6">
            <div className="auth-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Eco Name (Display Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-gray-800"
                placeholder="e.g. Eco Champion"
              />
            </div>

            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

            <div className="auth-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-gray-800"
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-gray-800"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 mr-2"
                />
                Remember me
              </label>
              <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-700 transition">
                Forgot password?
              </a>
            </div>

            {/* Apple style slick button with Duolingo shadow touch */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99, y: 1 }}
              type="submit"
              className="auth-submit w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:shadow-none active:translate-y-1 transition-all text-center tracking-wide"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default LoginPage;
