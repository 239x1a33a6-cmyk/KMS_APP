import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

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
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const AuthProvider = ({ children }) => {
  // Initialise from localStorage → no flicker on reload
  const [user, setUserState] = useState(getStoredUser);
  // If we already have a cached user, don't block render while we verify
  const [loading, setLoading] = useState(!getStoredUser());

  const setUser = (u) => {
    storeUser(u);
    setUserState(u);
  };

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data?.data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data?.data || null);
    return response;
  };

  const register = async (credentials) => {
    const response = await authService.register(credentials);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  useEffect(() => {
    // Always verify session with server in background (don't block render)
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      login,
      register,
      logout,
      checkAuth,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
