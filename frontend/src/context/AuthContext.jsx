import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import { getTokenPayload, isTokenValid } from "../utils/authSession";

const AuthContext = createContext();

const USER_KEY = "careerpilot_user";

function getPersistedValidToken() {
  const savedToken = localStorage.getItem("token");
  if (isTokenValid(savedToken)) return savedToken;
  if (savedToken) localStorage.removeItem("token");
  return null;
}

// The cached user is only reused when it belongs to the account inside the JWT,
// so a cached profile can never be shown to a different signed-in user.
function readCachedUserFor(activeToken) {
  const tokenUserId = getTokenPayload(activeToken)?.id;
  if (!tokenUserId) return null;

  try {
    const stored = localStorage.getItem(USER_KEY);
    const cachedUser = stored ? JSON.parse(stored) : null;
    const cachedUserId = cachedUser?.id || cachedUser?._id;
    if (cachedUser && String(cachedUserId) === String(tokenUserId)) return cachedUser;
  } catch {
    return null;
  }

  localStorage.removeItem(USER_KEY);
  return null;
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getPersistedValidToken);
  const [user, setUser] = useState(() => readCachedUserFor(getPersistedValidToken()));
  // Only block the UI when a locally valid JWT has no cached user to render with.
  // With a cached user the shell renders immediately and /profile refreshes in the background.
  const [isRestoring, setIsRestoring] = useState(() => {
    const persistedToken = getPersistedValidToken();
    return Boolean(persistedToken) && !readCachedUserFor(persistedToken);
  });

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

  const login = useCallback((jwtToken, userData = null) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setIsRestoring(false);
    setUser(userData || readCachedUserFor(jwtToken));
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      setUser,
      updateUser,
      isRestoring,
      isAuthenticated: Boolean(token && isTokenValid(token)),
    }),
    [token, user, login, logout, updateUser, isRestoring]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Context hooks intentionally live beside their provider for this small app boundary.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
