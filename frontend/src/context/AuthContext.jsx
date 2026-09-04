import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";
import { setToken } from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "kms_user";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storeUser = (user) => {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getStoredUser);
  const [loading, setLoading] = useState(!getStoredUser());

  const setUser = (u) => {
    storeUser(u);
    setUserState(u);
  };

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data?.data || null);
    } catch (error) {
      // Only invalidate on explicit 401 — not network/CORS errors
      if (error?.response?.status === 401) {
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token, data } = response.data || {};
    if (token) setToken(token);       // store JWT for Authorization header
    setUser(data || null);
    return response;
  };

  const register = async (credentials) => {
    const response = await authService.register(credentials);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ user, loading, setUser, login, register, logout, checkAuth }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
