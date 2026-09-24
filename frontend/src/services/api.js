const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

function getAuthToken() {
  return localStorage.getItem("greenplus_token");
}

async function request(path, options = {}) {
  let response;
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(`Cannot reach the GreenPlus API at ${API_BASE_URL}. Start the backend with: .\\.venv1\\Scripts\\python.exe -m backend.app`, { cause: error });
  }

  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem("greenplus_token");
    localStorage.removeItem("greenplus_user");
    window.dispatchEvent(new Event("greenplus:unauthorized"));
  }
  if (!response.ok) {
    const message = data?.error?.message || data?.message || "Request failed";
    throw new Error(message);
  }
  return data?.data !== undefined ? data.data : data;
}

export const authApi = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  registerAdmin: (payload) => request("/auth/admin/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  updateProfile: (payload) => request("/auth/profile", { method: "PATCH", body: JSON.stringify(payload) }),
};

export const predictionApi = {
  status: () => request("/predict/status"),
  carbon: (payload) => request("/predict/carbon", { method: "POST", body: JSON.stringify(payload) }),
  energy: (payload) => request("/predict/energy", { method: "POST", body: JSON.stringify(payload) }),
  water: (payload) => request("/predict/water", { method: "POST", body: JSON.stringify(payload) }),
  actions: (payload) => request("/predict/actions", { method: "POST", body: JSON.stringify(payload) }),
  advice: (payload) => request("/predict/advice", { method: "POST", body: JSON.stringify(payload) }),
  methane: (payload) => request("/predict/methane", { method: "POST", body: JSON.stringify(payload) }),
  rioTrio: (payload) => request("/predict/rio-trio", { method: "POST", body: JSON.stringify(payload) }),
  analyzeEnergy: (payload) => request("/analyze/energy", { method: "POST", body: JSON.stringify(payload) }),
  realtime: (payload = {}) => request("/predict/realtime", { method: "POST", body: JSON.stringify(payload) }),
  airQuality: (payload = {}) => request("/predict/air-quality", { method: "POST", body: JSON.stringify(payload) }),
  rainfall: (payload = {}) => request("/predict/rainfall", { method: "POST", body: JSON.stringify(payload) }),
  temperature: (payload = {}) => request("/predict/temperature", { method: "POST", body: JSON.stringify(payload) }),
  uvIndex: (payload = {}) => request("/predict/uv-index", { method: "POST", body: JSON.stringify(payload) }),
  wind: (payload = {}) => request("/predict/wind", { method: "POST", body: JSON.stringify(payload) }),
};

export const adminApi = {
  overview: () => request("/admin/overview"),
};

export const assistantApi = {
  message: (payload) => request("/assistant/messages", { method: "POST", body: JSON.stringify(payload) }),
};

export const notificationApi = {
  list: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/notifications${query ? `?${query}` : ""}`);
  },
  generate: (payload) => request("/notifications/generate", { method: "POST", body: JSON.stringify(payload) }),
  markRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request("/notifications/read-all", { method: "POST" }),
  dismiss: (id) => request(`/notifications/${id}/dismiss`, { method: "PATCH" }),
  getPreferences: () => request("/notifications/preferences"),
  updatePreferences: (payload) => request("/notifications/preferences", { method: "PATCH", body: JSON.stringify(payload) }),
};

export const progressApi = {
  get: () => request("/progress"),
  updateState: (payload) => request("/progress/state", { method: "PATCH", body: JSON.stringify(payload) }),
  addLog: (type, values) => request("/progress/logs", { method: "POST", body: JSON.stringify({ type, values }) }),
  completeQuiz: (quizId, xp) => request("/progress/quizzes", { method: "POST", body: JSON.stringify({ quizId, xp }) }),
};
