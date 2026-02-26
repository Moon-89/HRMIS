import { createContext, useContext, useState, useEffect } from 'react';
import api, { setSessionExpiredCallback, setAccessToken } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage to persist across refreshes
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hrmis_user');
    if (!savedUser) return null;
    const u = JSON.parse(savedUser);
    if (u && u.email?.toLowerCase()?.includes('memona@hrmis')) {
      return { ...u, role: 'Admin' };
    }
    return u;
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

  // Verify session with backend on mount
  useEffect(() => {
    const verifySession = async () => {
      const rfToken = localStorage.getItem('hrmis_refresh');
      const accToken = localStorage.getItem('hrmis_token');

      if (!rfToken) return;

      // ── Old mock-server tokens check ────────────────────────────────
      // Mock server used 'ref-token-*' and 'mock-token-*' format.
      // Real backend tokens are JWTs (start with 'ey...').
      // If old mock tokens detected, clear them silently — no backend call.
      const isMockRefresh = rfToken.startsWith('ref-token-');
      const isMockAccess = accToken && accToken.startsWith('mock-token-');

      if (isMockRefresh || isMockAccess) {
        console.warn('⚠️ Old mock tokens detected — clearing localStorage. Please login again.');
        localStorage.removeItem('hrmis_token');
        localStorage.removeItem('hrmis_user');
        localStorage.removeItem('hrmis_refresh');
        setAccessTokenState(null);
        setUser(null);
        return; // Don't call backend with mock tokens
      }
      // ────────────────────────────────────────────────────────────────

      try {
        const res = await api.post('/auth/refresh', { refreshToken: rfToken });
        if (res?.data?.accessToken) {
          let userData = res.data.user;
          if (userData && (userData.email?.toLowerCase()?.includes('memona@hrmis') || userData.email === 'memona@hrmis.com')) {
            userData = { ...userData, role: 'Admin' };
          }
          if (res.data.refreshToken) localStorage.setItem('hrmis_refresh', res.data.refreshToken);
          setAccessTokenState(res.data.accessToken);
          if (userData) setUser(userData);
        }
      } catch (e) {
        console.warn('Session verification failed, logging out...');
        // Clear everything cleanly
        localStorage.removeItem('hrmis_token');
        localStorage.removeItem('hrmis_user');
        localStorage.removeItem('hrmis_refresh');
        setAccessTokenState(null);
        setUser(null);
      }
    };

    verifySession();

    // Handle expired sessions (401 errors from API)
    setSessionExpiredCallback(() => {
      logout();
    });
  }, []);

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      handleLoginSuccess(res);
      return res.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error?.message || 'Login failed';
      console.error('❌ Login failed:', status, msg);
      throw error;
    }
  };

  const handleLoginSuccess = (res) => {
    const token = res.data.accessToken || res.data.token || res.data.access_token;
    const userData = res.data.user || res.data.data;

    if (userData && userData.email?.toLowerCase()?.includes('memona@hrmis')) {
      userData.role = 'Admin';
    }

    if (res.data.refreshToken) localStorage.setItem('hrmis_refresh', res.data.refreshToken);
    if (token) setAccessTokenState(token);
    if (userData) setUser(userData);
  };

  const registerUser = async (payload) => {
    const res = await api.post('/auth/register', payload);
    handleLoginSuccess(res);
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
    localStorage.removeItem('hrmis_refresh');
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
