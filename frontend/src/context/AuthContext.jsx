import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("greenplus_user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("greenplus_user", JSON.stringify(user));
    else localStorage.removeItem("greenplus_user");
  }, [user]);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("greenplus_token");
      setUser(null);
    };
    window.addEventListener("greenplus:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("greenplus:unauthorized", handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const session = await authApi.login(credentials);
    localStorage.setItem("greenplus_token", session.access_token);
    setUser(session.user);
    return session;
  };

  const register = async (details) => {
    const session = await authApi.register(details);
    localStorage.setItem("greenplus_token", session.access_token);
    setUser(session.user);
    return session;
  };

  const registerAdmin = async (details) => {
    const session = await authApi.registerAdmin(details);
    localStorage.setItem("greenplus_token", session.access_token);
    setUser(session.user);
    return session;
  };

  const logout = () => {
    localStorage.removeItem("greenplus_token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, login, register, registerAdmin, logout, isAuthenticated: Boolean(user && localStorage.getItem("greenplus_token")) }}>{children}</AuthContext.Provider>;
}