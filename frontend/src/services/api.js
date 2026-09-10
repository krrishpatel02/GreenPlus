const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const authApi = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
};

export const predictionApi = {
  carbon: (payload) => request("/predict/carbon", { method: "POST", body: JSON.stringify(payload) }),
  energy: (payload) => request("/predict/energy", { method: "POST", body: JSON.stringify(payload) }),
  analyzeEnergy: (payload) => request("/analyze/energy", { method: "POST", body: JSON.stringify(payload) }),
};
