import axios from 'axios';

// Token handling
let accessToken = typeof window !== 'undefined' ? localStorage.getItem('hrmis_token') : null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (t) => { accessToken = t; };

// Sab calls '/api' se start hongi.
// Local dev mein setupProxy.js piche jaye ga.
// Vercel pe vercel.json ya api/index.js proxy kare ga.
const api = axios.create({
  baseURL: '/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor for Auth Header
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for Errors & Refresh
let refreshing = false;
let pendingQueue = [];
let onSessionExpired = () => { };
export const setSessionExpiredCallback = (cb) => { onSessionExpired = cb; };

const processQueue = (error, token = null) => {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // Don't refresh on login/register/refresh itself
    if (original?.url?.includes('/auth/') && original?.url !== '/auth/refresh') {
      return Promise.reject(error);
    }

    if (error?.response?.status === 401 && !original.__retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken) => {
              original.__retry = true;
              original.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(original));
            },
            reject: (err) => reject(err),
          });
        });
      }

      original.__retry = true;
      refreshing = true;

      try {
        const rfToken = localStorage.getItem('hrmis_refresh');
        if (!rfToken) throw new Error('No refresh token');

        const res = await axios.post('/api/auth/refresh', { refreshToken: rfToken });
        const newToken = res.data.accessToken;

        setAccessToken(newToken);
        localStorage.setItem('hrmis_token', newToken);
        if (res.data.refreshToken) localStorage.setItem('hrmis_refresh', res.data.refreshToken);

        refreshing = false;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        refreshing = false;
        processQueue(err, null);
        onSessionExpired();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
