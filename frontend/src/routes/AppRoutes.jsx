import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import RouteLoading from "../componentes/common/RouteLoading";
import Navbar from "../componentes/Navbar/Navbar";

const LandingPage = lazy(() => import("../pages/Landing/LandingPage"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const ProfilePage = lazy(() => import("../pages/Profile/ProfilePage"));
const LoginPage = lazy(() => import("../pages/Login/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Register/RegisterPage"));

const AppContent = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
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
