import { createContext, useContext, useState, useEffect } from 'react';
import api, { setSessionExpiredCallback, setAccessToken, raw } from './api';
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
          setAccessTokenState(token);
          setAccessToken(token);
          localStorage.setItem('hrmis_token', token);

          if (d.refreshToken || d.refresh_token) {
            localStorage.setItem('hrmis_refresh', d.refreshToken || d.refresh_token);
          }

          let userData = d.user || d.data;
          const effectiveEmail = (userData?.email || d?.email || '').toLowerCase();



          // Reconstruct if still missing
          if (!userData && effectiveEmail) {
            userData = {
              id: d._id || d.id || d.userId || d.sub || null,
              name: d.name || effectiveEmail.split('@')[0],
              email: effectiveEmail,
              role: 'Employee'
            };
          }

          if (userData) {
            userData.id = extractId(userData) || extractId(d) || d.sub || userData.id;

            let role = userData.role || 'Employee';
            role = role.trim().charAt(0).toUpperCase() + role.slice(1).toLowerCase();

            if (userData.email?.toLowerCase() === 'memona@hrmis.com' || effectiveEmail === 'memona@hrmis.com') {
              userData.role = 'Admin';
            } else {
              userData.role = role;
            }
            setUser(userData);
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

  // Helper: extract user ID from any possible field in a response object
  const extractId = (obj) => {
    if (!obj) return null;
    return obj.id || obj._id || obj.userId || obj.user_id || obj.sub || null;
  };



  const handleLoginSuccess = async (res, loginEmail = null) => {
    const d = res.data;
    console.log('[AUTH] Login response data:', JSON.stringify(d, null, 2));

    const token = d.accessToken || d.token || d.access_token;
    let userData = d.user || d.data;
    const effectiveEmail = (userData?.email || d?.email || loginEmail || '').toLowerCase();

    // Save token first so subsequent API calls work
    if (token) {
      setAccessTokenState(token);
      setAccessToken(token);
      localStorage.setItem('hrmis_token', token);
    }

    if (d.refreshToken || d.refresh_token) {
      localStorage.setItem('hrmis_refresh', d.refreshToken || d.refresh_token);
    }



    // Reconstruct user if still missing — but extract ID from ALL possible fields
    if (!userData && effectiveEmail) {
      const userId = extractId(d) || d.sub || null;
      userData = {
        id: userId,
        name: d.name || effectiveEmail.split('@')[0],
        email: effectiveEmail,
        role: 'Employee'
      };
      console.log('[AUTH] Reconstructed user:', JSON.stringify(userData, null, 2));
    }

    if (userData) {
      // Ensure ID is properly set, checking both the user object and the top level response
      userData.id = extractId(userData) || extractId(d) || d.sub || userData.id;
      userData.email = userData.email || effectiveEmail;
      userData.name = userData.name || effectiveEmail.split('@')[0];

      // Role assignment: memona = Admin, everyone else = Employee (unless they already have a role)
      let role = userData.role || 'Employee';
      // Normalize case for consistency in UI checks
      role = role.trim().charAt(0).toUpperCase() + role.slice(1).toLowerCase();

      if (effectiveEmail === 'memona@hrmis.com' || userData.email?.toLowerCase() === 'memona@hrmis.com') {
        userData.role = 'Admin';
      } else {
        userData.role = role;
      }

      console.log('[AUTH] Final user set:', JSON.stringify(userData, null, 2));
      setUser(userData);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('[AUTH] Logging in with:', credentials.email);
      // Use raw client to avoid interceptor interference (like old tokens)
      const res = await raw.post('/auth/login', credentials);
      await handleLoginSuccess(res, credentials.email);
      return res.data;
    } catch (error) {
      console.error('[AUTH] Login failed:', error?.response?.status, error?.response?.data || error.message);
      throw error;
    }
  };

  const registerUser = async (payload) => {
    console.log('[AUTH] Registering user:', payload.email);
    // Use raw client to avoid interceptor interference
    const res = await raw.post('/auth/register', payload);
    await handleLoginSuccess(res, payload.email);
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
