import axios from 'axios';

// Token storage (moved here to avoid circular dependency with auth.js)
let accessToken = null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (t) => { accessToken = t; };

const fallback = 'http://localhost:4000';
if (!process.env.REACT_APP_API_URL) {
  console.warn('REACT_APP_API_URL not set — falling back to', fallback);
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || fallback,
  withCredentials: true,
});

// Attach Authorization header if access token exists
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
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
    // Prevent infinite loop if the refresh endpoint itself fails
    if (original.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    if (status === 401 && !original.__retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              original.__retry = true;
              if (token) original.headers.Authorization = `Bearer ${token}`;
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
        onSessionExpired(); // Log out if refresh fails
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
