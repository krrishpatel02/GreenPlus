import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEco } from "../../context/EcoContext";
import Mascot from "../../componentes/common/Mascot";
import { motion } from "framer-motion";

const LoginPage = () => {
  const { setUser } = useEco();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Eco Champion");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate auth & update profile name
    setUser((prev) => ({
      ...prev,
      name: name || "Eco Champion",
      streakClaimed: false, // let them claim it again
    }));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background design accents - clean but modern */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/50 filter blur-3xl -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/40 filter blur-3xl -z-10"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Friendly Mascot Interaction (Duolingo Style) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Mascot
              mood="happy"
              speechText="Welcome back, champion! Log in to feed my roots and extend your eco-streak today! 🌿⚡"
            />
          </motion.div>
        </div>

        {/* Right Side: Elegant Form (Apple Style) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
              Sign In to GreenPlus
            </h2>
            <p className="text-gray-500 mt-2">
              Track carbon credits, earn badges, and join local schemes.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
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

            <div>
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

            <div>
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
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:shadow-none active:translate-y-1 transition-all text-center tracking-wide"
            >
              Sign In
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
    </div>
  );
};

export default LoginPage;
