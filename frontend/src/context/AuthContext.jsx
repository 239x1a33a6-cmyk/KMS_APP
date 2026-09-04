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
  const [user, setUserState] = useState(getStoredUser);
  // If cached user exists, skip the loading spinner entirely
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
      // Only invalidate the session on an explicit 401 from the server.
      // Network errors (server cold-start, CORS hiccup) should NOT log the user out.
      const status = error?.response?.status;
      if (status === 401) {
        setUser(null);
      }
      // For any other error (network, 5xx, CORS) keep the cached user alive
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
