import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 60000,
});

// Endpoints that legitimately return 401 when not logged in, or that
// should NEVER trigger a redirect (background calls, session checks,
// public endpoints).
const NEVER_REDIRECT_ENDPOINTS = [
  '/auth/session',
  '/auth/login',
  '/auth/register',
  '/auth/staff/login',
  '/auth/admin/login',
  '/auth/logout',
  '/settings/public',
  '/settings/languages',
  '/settings/translations',
  '/home-affairs/stats',
  '/admin/stats',
  '/admin/health',
  '/admin/activity',
];

function shouldNeverRedirect(url = '') {
  return NEVER_REDIRECT_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// Attach Authorization header if a token is stored (defensive).
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage can throw in private mode
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Network error — most commonly a cold start on Render.
    if (!error.response) {
      const friendly = new Error(
        'Cannot reach the server. It may be starting up. Wait a moment and try again.'
      );
      friendly.isNetworkError = true;
      friendly.originalError = error;
      return Promise.reject(friendly);
    }

    // Never redirect for these endpoints — they can return 401 while the
    // user is still legitimately logged in, or they're polling/background
    // calls that shouldn't take the user out of whatever page they're on.
    if (status === 401 && !shouldNeverRedirect(url)) {
      // Only blow away the session if the request was a real user action
      // AND we haven't redirected in the last second (prevents cascading
      // redirects when multiple requests 401 at once).
      const now = Date.now();
      const last = Number(sessionStorage.getItem('lastAuthRedirect') || 0);
      if (now - last > 1500 && window.location.pathname !== '/login') {
        sessionStorage.setItem('lastAuthRedirect', String(now));
        window.location.replace('/login');
      }
    }

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