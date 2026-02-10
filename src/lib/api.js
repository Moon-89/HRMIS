import axios from 'axios';

// Token storage
let accessToken = typeof window !== 'undefined' ? localStorage.getItem('hrmis_token') : null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (t) => { accessToken = t; };

// API Configuration
// In development: use relative /api path (proxied to external backend via setupProxy.js)
// In production: use environment variable or fallback to relative path
// API Configuration
// Development: /api (proxied via setupProxy.js) -> https://hrmis-api.devfamz.com/api/auth/*
// Production: https://hrmis-api.devfamz.com/api -> https://hrmis-api.devfamz.com/api/auth/*
const isDevelopment = process.env.NODE_ENV === 'development';
const apiUrl = isDevelopment ? '/api' : 'https://hrmis-api.devfamz.com/api';

// Log API configuration
console.log('🔗 API Base URL:', apiUrl);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔧 Using Proxy:', isDevelopment);

export async function fetchActivities() {
  const res = await fetch('/api/activities');
  return res.json();
}

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: false, // Proxy handles CORS in development
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header if access token exists
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log outgoing requests for debugging
  console.log('🚀 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    hasToken: !!token
  });

  return config;
}, (error) => {
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
});

// Auto-refresh on 401 and retry once
let refreshing = false;
let pendingQueue = [];
let onSessionExpired = () => { };

export const setSessionExpiredCallback = (cb) => {
  onSessionExpired = cb;
};

const processQueue = (error, token = null) => {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => {
    // Log successful responses
    console.log('✅ API Response:', {
      status: res.status,
      url: res.config.url,
      data: res.data
    });
    return res;
  },
  async (error) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        message: error.response.data?.message || error.message,
        data: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received (Network error)
      console.error('🌐 Network Error:', {
        message: 'No response from server',
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        error: error.message
      });
    } else {
      console.error('⚠️ Request Setup Error:', error.message);
    }

    const original = error.config;
    const status = error?.response?.status;

    // 1. Don't try to refresh if the request itself was an auth attempt or refresh
    const isAuthRequest = original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh');

    if (isAuthRequest) {
      return Promise.reject(error);
    }

    // 2. Only try to refresh if we actually have a token and get a 401
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
