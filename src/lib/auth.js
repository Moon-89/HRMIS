import { createContext, useContext, useState, useEffect } from 'react';
import api, { setSessionExpiredCallback, setAccessToken, getAccessToken } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessTokenState, setAccessTokenState] = useState(null);

  // keep both the state and the module-level token in sync
  useEffect(() => {
    setAccessToken(accessTokenState);
    // Expose current auth to window for quick debugging in dev
    try {
      // eslint-disable-next-line no-undef
      if (typeof window !== 'undefined') window.__auth = { user: user ?? null, accessToken: accessTokenState };
    } catch (e) {
      // ignore
    }
  }, [accessTokenState]);

  // try rehydrate using refresh endpoint on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api.post('/auth/refresh');
        if (res?.data?.accessToken) {
          setAccessTokenState(res.data.accessToken);
          setUser(res.data.user ?? null);
        }
      } catch (e) {
        // ignore
      }
    })();

    // Register callback for when api interceptor fails to refresh
    setSessionExpiredCallback(() => {
      setAccessTokenState(null);
      setUser(null);
    });
  }, []);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const token = res.data.accessToken ?? null;
    setAccessTokenState(token);
    setUser(res.data.user ?? null);
    return res.data;
  };

  const registerUser = async (payload) => {
    const res = await api.post('/auth/register', payload);
    // may return token+user or just a message
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
  };

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken: accessTokenState, setAccessToken: setAccessTokenState, login, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
//           <LoginForm />
