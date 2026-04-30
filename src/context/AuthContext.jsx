import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY, USER_STORAGE_KEY, api } from '../services/api.js';

const AuthContext = createContext(null);

function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const savedToken = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!savedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await api.getCurrentUser(savedToken);

        if (!isMounted) {
          return;
        }

        setToken(savedToken);
        setUser(currentUser);
        setSessionExpired(false);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } catch (error) {
        clearStoredSession();

        if (isMounted) {
          setToken(null);
          setUser(null);
          setSessionExpired(Boolean(savedToken));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    const response = await api.login(credentials);
    setToken(response.token);
    setUser(response.user);
    setSessionExpired(false);
    localStorage.setItem(AUTH_STORAGE_KEY, response.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    return response.user;
  }

  async function signup(payload) {
    const response = await api.signup(payload);
    setToken(response.token);
    setUser(response.user);
    setSessionExpired(false);
    localStorage.setItem(AUTH_STORAGE_KEY, response.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    return response.user;
  }

  function logout() {
    api.logout?.(token);
    clearStoredSession();
    setToken(null);
    setUser(null);
    setSessionExpired(false);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      sessionExpired,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [token, user, isLoading, sessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
