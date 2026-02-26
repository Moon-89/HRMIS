import axios from 'axios';

// ─── Token Storage ───────────────────────────────────────────────────────────
let accessToken = typeof window !== 'undefined' ? localStorage.getItem('hrmis_token') : null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (t) => { accessToken = t; };

// ─── API Configuration ───────────────────────────────────────────────────────
// Both development and production use the /api relative path.
// • Development  → setupProxy.js rewrites /api/* → https://hrmis-api.devfamz.com/api/*
// • Production   → vercel.json  rewrites /api/* → https://hrmis-api.devfamz.com/api/*
// This eliminates all CORS issues because requests go to the same origin.
const BASE_URL = '/api';

console.log('🔗 API Base URL:', BASE_URL, '| env:', process.env.NODE_ENV);

// ─── Axios Instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ─── Response Interceptor (token refresh on 401) ─────────────────────────────
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
  (res) => {
    console.log('✅ API Response:', res.status, res.config.url);
    return res;
  },
  async (error) => {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.config?.url, error.response.data);
    } else if (error.request) {
      console.error('🌐 Network Error (no response):', error.config?.url, error.message);
    } else {
      console.error('⚠️ Request Setup Error:', error.message);
    }

    const original = error.config;
    const status = error?.response?.status;

    // Do not refresh on auth endpoints
    const isAuthRequest =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh');

    if (isAuthRequest) return Promise.reject(error);

    // Auto-refresh on 401
    const token = getAccessToken();
    if (status === 401 && token && !original.__retry) {
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
        const res = await api.post('/auth/refresh', { refreshToken: rfToken });
        const newToken = res.data.accessToken;
        const newRefToken = res.data.refreshToken;

        setAccessToken(newToken);
        if (newRefToken) localStorage.setItem('hrmis_refresh', newRefToken);

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
