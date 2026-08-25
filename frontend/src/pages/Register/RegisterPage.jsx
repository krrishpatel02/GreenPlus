import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEco } from "../../context/EcoContext";
import Mascot from "../../componentes/common/Mascot";
import { motion } from "framer-motion";
import AnimatedPage from "../../componentes/common/AnimatedPage";
import "../Auth/AuthPage.css";

const RegisterPage = () => {
  const { setUser } = useEco();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name: name || "Eco Champion",
      streakClaimed: false,
    }));
    navigate("/dashboard");
  };

  return (
    <AnimatedPage className="auth-motion-page">
    <div className="auth-page auth-scene auth-scene--register min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="auth-orb auth-orb--mint"></div>
      <div className="auth-orb auth-orb--blue"></div>
      <div className="auth-starfield" aria-hidden="true"></div>
      <div className="auth-light-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="auth-floor-grid" aria-hidden="true"></div>
      <div className="auth-brand-mark"><span>✦</span> GREENPLUS <small>ENVIRONMENTAL CONTROL</small></div>
      <Link to="/" className="auth-home-link">← Return to home</Link>
      <div className="auth-leafy auth-leafy--register">
        <Mascot mood="thinking" speechText="Let&apos;s build your greener daily routine!" />
      </div>
      <div className="auth-form-panel auth-card">
          <div className="auth-form-heading mb-8">
            <span className="auth-card__eyebrow">NEW ECO PROFILE</span>
            <h2>Create account</h2>
            <p>Build your personal control room for everyday impact.</p>
          </div>

          <form onSubmit={handleRegister} className="auth-form space-y-5">
            <div className="auth-field">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans text-gray-800"
                placeholder="e.g. Flora, EcoWarrior"
              />
            </div>

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
                placeholder="green@earth.com"
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
                placeholder="•••••••• (Min 8 characters)"
              />
            </div>

            <div className="flex items-start text-sm text-gray-600">
              <input
                type="checkbox"
                required
                className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 mt-1 mr-2 cursor-pointer"
              />
              <span>
                I agree to the GreenPlus terms, privacy policy, and to plant a virtual tree upon leveling up. 🌳
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99, y: 1 }}
              type="submit"
              className="auth-submit w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:shadow-none active:translate-y-1 transition-all text-center tracking-wide"
            >
              Join the Green Movement
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition">
              Sign In instead
            </Link>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default RegisterPage;
