import { createContext, useContext, useState, useEffect } from 'react';
import api, { setSessionExpiredCallback, setAccessToken } from './api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage to persist across refreshes
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hrmis_user');
    if (!savedUser) return null;
    try {
      const u = JSON.parse(savedUser);
      const email = (u.email || '').toLowerCase();
      // Force Admin for Memona
      if (email === 'memona@hrmis.com') {
        return { ...u, role: 'Admin' };
      }
      return { ...u, role: u.role || 'Employee' };
    } catch (e) {
      return null;
    }
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
      if (!rfToken) return;

      try {
        const res = await api.post('/auth/refresh', { refreshToken: rfToken });
        const d = res.data;
        const token = d.accessToken || d.token || d.access_token;
        if (token) {
          let userData = d.user || d.data;
          const effectiveEmail = (userData?.email || d?.email || '').toLowerCase();

          // Reconstruct user if missing from refresh response
          if (!userData && effectiveEmail) {
            userData = {
              id: d.id || 'unknown',
              name: effectiveEmail === 'memona@hrmis.com' ? 'Memona' : 'User',
              email: effectiveEmail,
              role: (effectiveEmail === 'memona@hrmis.com') ? 'Admin' : 'Employee'
            };
          }

          if (userData) {
            if (userData.email?.toLowerCase() === 'memona@hrmis.com' || effectiveEmail === 'memona@hrmis.com') {
              userData.role = 'Admin';
            } else {
              userData.role = userData.role || 'Employee';
            }
            setUser(userData);
          }

          setAccessTokenState(token);
          if (d.refreshToken || d.refresh_token) {
            localStorage.setItem('hrmis_refresh', d.refreshToken || d.refresh_token);
          }
        }
      } catch (e) {
        logout();
      }
    };

    verifySession();
    setSessionExpiredCallback(() => logout());

    // Auto-refresh token every 10 minutes (600 seconds)
    const refreshInterval = setInterval(() => {
      verifySession();
    }, 600000);

    return () => clearInterval(refreshInterval);
  }, []);

  const handleLoginSuccess = (res, loginEmail = null) => {
    const d = res.data;
    const token = d.accessToken || d.token || d.access_token;
    let userData = d.user || d.data;
    const effectiveEmail = (userData?.email || d?.email || loginEmail || '').toLowerCase();

    // Reconstruct user if backend response is empty (very common in this project)
    if (!userData && effectiveEmail) {
      userData = {
        id: d.id || 'unknown',
        name: effectiveEmail === 'memona@hrmis.com' ? 'Memona' : 'User',
        email: effectiveEmail,
        role: (effectiveEmail === 'memona@hrmis.com') ? 'Admin' : 'Employee'
      };
    }

    if (userData) {
      if (userData.email?.toLowerCase() === 'memona@hrmis.com' || effectiveEmail === 'memona@hrmis.com') {
        userData.role = 'Admin';
      } else {
        userData.role = userData.role || 'Employee';
      }
      setUser(userData);
    }

    if (token) {
      setAccessTokenState(token);
      setAccessToken(token); // Sync with API immediately
    }

    if (d.refreshToken || d.refresh_token) {
      localStorage.setItem('hrmis_refresh', d.refreshToken || d.refresh_token);
    }
  };

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      handleLoginSuccess(res, credentials.email);
      return res.data;
    } catch (error) {
      console.error('Login error:', error);
      // No guest mode - throw error directly
      throw error;
    }
  };

  const registerUser = async (payload) => {
    const res = await api.post('/auth/register', payload);
    handleLoginSuccess(res, payload.email);
    return res.data;
  };

  const logout = () => {
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
