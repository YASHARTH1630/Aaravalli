import { createContext, useState, useEffect, useCallback } from "react";
import authService, { getToken } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // Check and hydrate existing user session
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const activeToken = getToken();
      if (!activeToken) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          if (currentUser) {
            setUser(currentUser);
            setToken(activeToken);
          } else {
            setUser(null);
            setToken(null);
          }
        }
      } catch {
        if (mounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      setToken(result.token);
    }
    return result;
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
