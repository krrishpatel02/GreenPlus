import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedPage from "../../componentes/common/AnimatedPage";
import { useAuth } from "../../context/AuthContext";
import "../Auth/AuthPage.css";

const AdminRegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", setupKey: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerAdmin } = useAuth();

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerAdmin(form);
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
            <span className="auth-card__eyebrow">ADMIN INVITATION</span>
            <h2>Create admin account</h2>
            <p>Administrator registration requires a private invitation key.</p>
          </div>
          <form onSubmit={handleRegister} className="auth-form space-y-5">
            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            <div className="auth-field">
              <label className="block text-sm font-semibold mb-2" htmlFor="admin-name">Full name</label>
              <input id="admin-name" name="name" type="text" value={form.name} onChange={updateField} required placeholder="GreenPlus Administrator" className="w-full" />
            </div>
            <div className="auth-field">
              <label className="block text-sm font-semibold mb-2" htmlFor="register-admin-email">Admin email</label>
              <input id="register-admin-email" name="email" type="email" value={form.email} onChange={updateField} required placeholder="admin@greenplus.local" className="w-full" />
            </div>
            <div className="auth-field">
              <label className="block text-sm font-semibold mb-2" htmlFor="register-admin-password">Password</label>
              <input id="register-admin-password" name="password" type="password" value={form.password} onChange={updateField} required minLength="8" placeholder="At least 8 characters" className="w-full" />
            </div>
            <div className="auth-field">
              <label className="block text-sm font-semibold mb-2" htmlFor="admin-setup-key">Invitation key</label>
              <input id="admin-setup-key" name="setupKey" type="password" value={form.setupKey} onChange={updateField} required placeholder="Enter private setup key" className="w-full" />
            </div>
            <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99, y: 1 }} type="submit" disabled={loading} className="auth-submit w-full text-white font-bold text-center">
              {loading ? "Creating access..." : "Create admin account"}
            </motion.button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have admin access? <Link to="/admin/login" className="font-bold">Sign in to the panel</Link>
          </div>
        </section>
      </main>
    </AnimatedPage>
  );
};

export default AdminRegisterPage;
