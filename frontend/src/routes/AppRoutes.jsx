import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import RouteLoading from "../componentes/common/RouteLoading";
import Navbar from "../componentes/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";

const LandingPage = lazy(() => import("../pages/Landing/LandingPage"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const ProfilePage = lazy(() => import("../pages/Profile/ProfilePage"));
const LoginPage = lazy(() => import("../pages/Login/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Register/RegisterPage"));
const AdminLoginPage = lazy(() => import("../pages/Admin/AdminLoginPage"));
const AdminRegisterPage = lazy(() => import("../pages/Admin/AdminRegisterPage"));
const AdminPage = lazy(() => import("../pages/Admin/AdminPage"));

const getStoredSession = () => {
  const token = localStorage.getItem("greenplus_token");
  const user = localStorage.getItem("greenplus_user");
  return token && user ? { token, user: JSON.parse(user) } : null;
};

const ProtectedRoute = ({ children, adminOnly = false, redirectTo = "/login" }) => {
  const { user, isAuthenticated } = useAuth();
  const session = getStoredSession();
  if (!session || !isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }
  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthRoute = ["/login", "/register", "/admin/login", "/admin/register"].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAuthRoute && !isAdminRoute && <Navbar />}
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly redirectTo="/admin/login"><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default AppRoutes;
