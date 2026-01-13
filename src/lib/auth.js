import { createContext, useContext, useState, useEffect } from 'react';
import api, { setSessionExpiredCallback, setAccessToken } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage to persist across refreshes
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hrmis_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessTokenState, setAccessTokenState] = useState(() => {
    return localStorage.getItem('hrmis_token') || null;
  });

  // Sync with API module and localStorage whenever auth state changes
  useEffect(() => {
    setAccessToken(accessTokenState);
    if (accessTokenState) {
      localStorage.setItem('hrmis_token', accessTokenState);
    } else {
      localStorage.removeItem('hrmis_token');
    }
  }, [accessTokenState]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hrmis_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hrmis_user');
    }
  }, [user]);

  // Optional: Verify session with backend on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!accessTokenState) return;
      try {
        // Try refreshing or getting profile to ensure token is still valid
        const res = await api.post('/auth/refresh');
        if (res?.data?.accessToken) {
          setAccessTokenState(res.data.accessToken);
          if (res.data.user) setUser(res.data.user);
        }
      } catch (e) {
        console.warn('Session verification failed, logging out...');
        logout();
      }
    };

    verifySession();

    // Handle expired sessions (401 errors from API)
    setSessionExpiredCallback(() => {
      logout();
    });
  }, []);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const token = res.data.accessToken ?? null;
    const userData = res.data.user ?? null;

    setAccessTokenState(token);
    setUser(userData);
    return res.data;
  };

  const registerUser = async (payload) => {
    const res = await api.post('/auth/register', payload);
    if (res.data.accessToken) {
      setAccessTokenState(res.data.accessToken);
      setUser(res.data.user ?? null);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    setAccessTokenState(null);
    setUser(null);
    localStorage.removeItem('hrmis_token');
    localStorage.removeItem('hrmis_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      accessToken: accessTokenState,
      setAccessToken: setAccessTokenState,
      login,
      registerUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
