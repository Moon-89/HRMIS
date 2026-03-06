import axios from 'axios';

// Token handling
let accessToken = typeof window !== 'undefined' ? localStorage.getItem('hrmis_token') : null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (t) => { accessToken = t; };

// Base URL: always talk directly to the live backend
// Works on localhost AND Vercel (CORS is enabled on the API)
// Base URL: fixed to include /api prefix for consistency
// Base URL: In development, we use the local proxy bridge (/api)
// In production, we use the absolute URL via Vercel rewrites
const BASE_URL = 'https://hrmis-api.devfamz.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Raw client WITHOUT interceptors
const raw = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor for Auth Header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrmis_token');
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
    // URLs here are relative to baseURL, so no /api/ prefix needed
    if (['/auth/login', '/auth/register', '/auth/refresh'].includes(original?.url)) {
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

        const res = await raw.post('/auth/refresh', { refreshToken: rfToken });
        const newToken = res.data.accessToken || res.data.token || res.data.access_token;

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
