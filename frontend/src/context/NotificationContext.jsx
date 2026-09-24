import { createContext, useContext, useEffect, useState } from "react";
import { notificationApi } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [preferences, setPreferences] = useState({ enabled: true, quietStart: 22, quietEnd: 7, channels: ["in_app"], categories: [] });

  const refresh = async () => {
    const data = await notificationApi.list();
    setNotifications(data.notifications || []);
    setUnread(data.unread || 0);
  };

  useEffect(() => {
    setNotifications([]);
    setUnread(0);
    setPreferences({ enabled: true, quietStart: 22, quietEnd: 7, channels: ["in_app"], categories: [] });
    if (!user || !localStorage.getItem("greenplus_token")) return undefined;
    // This effect synchronizes server state for the authenticated session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().catch(() => undefined);
    notificationApi.getPreferences().then(setPreferences).catch(() => undefined);
    const timer = window.setInterval(() => refresh().catch(() => undefined), 60000);
    return () => window.clearInterval(timer);
  }, [user]);

  const markRead = async (id) => {
    await notificationApi.markRead(id);
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
    setUnread((current) => Math.max(0, current - 1));
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
  };

  const dismiss = async (id) => {
    await notificationApi.dismiss(id);
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  const updatePreferences = async (values) => {
    const next = await notificationApi.updatePreferences(values);
    setPreferences(next);
    return next;
  };

  return <NotificationContext.Provider value={{ notifications, unread, preferences, refresh, markRead, markAllRead, dismiss, updatePreferences }}>{children}</NotificationContext.Provider>;
}