import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";
import { getTokenPayload, isTokenValid } from "../utils/authSession";

const AuthContext = createContext();

const USER_KEY = "careerpilot_user";

function getPersistedSession() {
  const savedToken = localStorage.getItem("token");

  if (!isTokenValid(savedToken)) {
    if (savedToken) {
      localStorage.removeItem("token");
    }

    localStorage.removeItem(USER_KEY);

    return {
      token: null,
      user: null,
    };
  }

  try {
    const savedUser = JSON.parse(
      localStorage.getItem(USER_KEY) || "null"
    );

    const tokenUserId = getTokenPayload(savedToken)?.id;
    const savedUserId = savedUser?._id || savedUser?.id;

    return {
      token: savedToken,
      user:
        tokenUserId &&
        savedUserId &&
        String(tokenUserId) === String(savedUserId)
          ? savedUser
          : null,
    };
  } catch {
    localStorage.removeItem(USER_KEY);

    return {
      token: savedToken,
      user: null,
    };
  }
}

export const AuthProvider = ({ children }) => {
  const [persistedSession] = useState(getPersistedSession);

  const [token, setToken] = useState(
    persistedSession.token
  );

  const [user, setUser] = useState(
    persistedSession.user
  );

  const [isRestoring, setIsRestoring] = useState(
    () =>
      Boolean(
        persistedSession.token &&
          !persistedSession.user
      )
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
    setIsRestoring(false);
  }, []);

  // Verify the current token against the server.
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    api
      .get("/profile")
      .then((response) => {
        if (cancelled) return;

        if (response.data?.user) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        // Keep the locally valid session on network errors.
      })
      .finally(() => {
        if (!cancelled) {
          setIsRestoring(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Handle global unauthorized events.
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener(
      "careerpilot:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "careerpilot:unauthorized",
        handleUnauthorized
      );
    };
  }, [logout]);

  // Persist the current user.
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // Login
  const login = useCallback(
    (jwtToken, userData = null) => {
      localStorage.setItem("token", jwtToken);

      setToken(jwtToken);
      setIsRestoring(false);

      if (userData) {
        setUser(userData);
      }
    },
    []
  );

  // IMPORTANT:
  // Keep this function stable between AuthContext renders.
  // This prevents Profile.jsx effects depending on updateUser
  // from being triggered again after updateUser() changes the user.
  const updateUser = useCallback((userData) => {
    setUser((prev) => ({
      ...prev,
      ...userData,
    }));
  }, []);

  const contextValue = {
    token,
    user,
    login,
    logout,
    setUser,
    updateUser,
    isRestoring,
    isAuthenticated: Boolean(
      token && isTokenValid(token)
    ),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);