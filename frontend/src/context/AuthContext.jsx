import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { isTokenValid } from "../utils/authSession";

const AuthContext = createContext();

const USER_KEY = "careerpilot_user";

function getPersistedValidToken() {
  const savedToken = localStorage.getItem("token");
  if (isTokenValid(savedToken)) return savedToken;
  if (savedToken) localStorage.removeItem("token");
  return null;
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getPersistedValidToken);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isRestoring, setIsRestoring] = useState(() => Boolean(getPersistedValidToken()));

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsRestoring(false);
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    // Confirms an otherwise valid local JWT against the existing protected API.
    // Network errors keep the local valid session; a 401 is handled centrally below.
    api
      .get("/profile")
      .then((response) => {
        if (response.data?.user) setUser(response.data.user);
      })
      .catch(() => {})
      .finally(() => setIsRestoring(false));
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("careerpilot:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("careerpilot:unauthorized", handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const login = (jwtToken, userData = null) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setIsRestoring(false);
    if (userData) setUser(userData);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        setUser,
        updateUser,
        isRestoring,
        isAuthenticated: Boolean(token && isTokenValid(token)),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Context hooks intentionally live beside their provider for this small app boundary.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
