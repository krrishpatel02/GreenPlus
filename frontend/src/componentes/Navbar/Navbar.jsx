import { Link, useNavigate } from "react-router-dom";
import { useEco } from "../../context/EcoContext";
import "./Navbar.css";
import { FaLeaf, FaBars } from "react-icons/fa";

function Navbar() {
  const { user } = useEco();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        <FaLeaf className="logo-icon" />
        <span>GreenPlus</span>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>

      <div className="nav-buttons flex items-center gap-4">
        {/* Flame streak */}
        <div className="flex items-center gap-1 text-sm font-extrabold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
          <span>🔥</span> {user.streak}d
        </div>
        
        {/* Level badge */}
        <div className="flex items-center gap-1 text-sm font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mr-2">
          <span>⭐</span> Lvl {user.level}
        </div>

        <Link to="/login" className="login-btn no-underline">Login</Link>
        <Link to="/register" className="start-btn no-underline">Get Started</Link>
      </div>

      <div className="menu-icon">
        <FaBars />
      </div>
    </nav>
  );
}

export default Navbar;