import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedPage from "../../componentes/common/AnimatedPage";
import { useAuth } from "../../context/AuthContext";
import "../Auth/AuthPage.css";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login({ email, password });
      if (response.user.role !== "ADMIN") {
        throw new Error("This account does not have administrator access.");
      }
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="auth-motion-page">
      <main className="auth-page auth-scene min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="auth-orb auth-orb--mint" />
        <div className="auth-orb auth-orb--blue" />
        <div className="auth-starfield" aria-hidden="true" />
        <div className="auth-light-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="auth-floor-grid" aria-hidden="true" />
        <div className="auth-brand-mark"><span>✦</span> GREENPLUS <small>ADMIN CONTROL</small></div>
        <Link to="/" className="auth-home-link">Return to home</Link>
        <section className="auth-form-panel auth-card">
          <div className="auth-form-heading mb-8">
            <span className="auth-card__eyebrow">RESTRICTED ACCESS</span>
            <h2>Admin sign in</h2>
            <p>Enter the control room for GreenPlus operations.</p>
          </div>
          <form onSubmit={handleLogin} className="auth-form space-y-6">
            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            <div className="auth-field">
              <label className="block text-sm font-semibold mb-2" htmlFor="admin-email">Admin email</label>
              <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="admin@greenplus.local" className="w-full" />
            </div>
            <div className="auth-field">
              <label className="block text-sm font-semibold mb-2" htmlFor="admin-password">Password</label>
              <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter admin password" className="w-full" />
            </div>
            <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99, y: 1 }} type="submit" disabled={loading} className="auth-submit w-full text-white font-bold text-center">
              {loading ? "Verifying access..." : "Enter admin panel"}
            </motion.button>
          </form>
          <div className="mt-8 text-center text-sm">
            Need a new administrator account? <Link to="/admin/register" className="font-bold">Register with an invitation key</Link>
          </div>
        </section>
      </main>
    </AnimatedPage>
  );
};

export default AdminLoginPage;
