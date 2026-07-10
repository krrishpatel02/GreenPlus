import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEco } from "../../context/EcoContext";
import Mascot from "../../componentes/common/Mascot";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background design accents */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/50 filter blur-3xl -z-10"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-100/40 filter blur-3xl -z-10"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Friendly Mascot Interaction */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Mascot
              mood="thinking"
              speechText="Awesome decision! Creating an account unlocks custom badges, solar rebates, and daily carbon metrics. Let's grow together! 🌱📈"
            />
          </motion.div>
        </div>

        {/* Right Side: Elegant Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
              Create Your Eco Account
            </h2>
            <p className="text-gray-500 mt-2">
              Join thousands of people reducing their energy and water footprint.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
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
                placeholder="green@earth.com"
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
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:shadow-none active:translate-y-1 transition-all text-center tracking-wide"
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
    </div>
  );
};

export default RegisterPage;
