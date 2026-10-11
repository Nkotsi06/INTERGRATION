import axios from 'axios';

// Vite replaces import.meta.env.VITE_* at BUILD time.
// Changing the value on Vercel requires a redeploy to take effect.
const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // Render's free tier can take ~50s to wake from sleep.
  // A shorter timeout makes cold starts look like failures.
  timeout: 60000,
});

// Public endpoints that legitimately return 401 when not logged in.
// We do NOT redirect the browser for these.
const PUBLIC_ENDPOINTS = [
  '/auth/session',
  '/auth/login',
  '/auth/register',
  '/auth/staff/login',
  '/auth/admin/login',
  '/auth/logout',
  '/settings/public',
  '/settings/languages',
  '/settings/translations',
];

function isPublicEndpoint(url = '') {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// Attach Authorization header if a token is stored.
// Your app uses httpOnly cookies, so this is a no-op unless you
// later switch to storing a token in localStorage under 'token'.
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage can throw in private mode; ignore.
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Network error (no response) — most commonly a cold start on Render.
    if (!error.response) {
      const friendly = new Error(
        'Cannot reach the server. It may be starting up. Wait a moment and try again.'
      );
      friendly.isNetworkError = true;
      friendly.originalError = error;
      return Promise.reject(friendly);
    }

    // Redirect on 401 for non-public endpoints only.
    if (status === 401 && !isPublicEndpoint(url)) {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    // Prefer the server's message field when present.
    const serverMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      error.message;

    const wrapped = new Error(serverMessage);
    wrapped.status = status;
    wrapped.data = error.response.data;
    return Promise.reject(wrapped);
  }
);

export default apiClient;