import axios from "axios";

const TOKEN_KEY = "kms_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:10000/api",
  withCredentials: true,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect to /login on any 401 Unauthorized response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setToken(null);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
