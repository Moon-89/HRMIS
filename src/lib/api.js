import axios from 'axios';

// Token storage
let accessToken = typeof window !== 'undefined' ? localStorage.getItem('hrmis_token') : null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (t) => { accessToken = t; };

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

console.log('--------------------------------------');
console.log('🔌 HRMIS API CONFIGURATION');
console.log('🔗 API URL:', apiUrl);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('--------------------------------------');

export async function fetchActivities() {
  const res = await fetch(`${apiUrl}/api/activities`); // Use strict URL
  return res.json();
}



const api = axios.create({
  baseURL: apiUrl, // Hardcoded strict URL
  withCredentials: true,
});

// Attach Authorization header if access token exists
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    // 1. Don't try to refresh if the request itself was an auth attempt or refresh
    const isAuthRequest = original.url.includes('/auth/login') ||
      original.url.includes('/auth/register') ||
      original.url.includes('/auth/refresh');

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
        const res = await api.post('/auth/refresh');
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
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
