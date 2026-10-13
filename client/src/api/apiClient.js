import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 60000,
});

// Endpoints that must NEVER trigger a redirect to /login.
//
// Two categories:
//   1. Public endpoints that legitimately return 401 when not logged in.
//   2. Ministry endpoints whose data failures should be shown on the page,
//      not turned into a global logout.
//
// This does NOT weaken authentication. It only prevents the SPA from being
// torn down by a single failing background request.
const NEVER_REDIRECT_ENDPOINTS = [
  // Public / session endpoints
  '/auth/session',
  '/auth/login',
  '/auth/register',
  '/auth/staff/login',
  '/auth/admin/login',
  '/auth/logout',
  '/auth/forgot-password',

  // Public settings
  '/settings/',

  // Ministry endpoints — failures here belong on the page, not at /login
  '/citizen/',
  '/home-affairs/',
  '/traffic/',
  '/police/',
  '/finance/',
  '/pensions/',
  '/passport/',
  '/admin/',
  '/documents/',
  '/biometrics/',
  '/signatures/',
  '/verification/',
  '/references/',
  '/audit/',
];

function shouldNeverRedirect(url = '') {
  return NEVER_REDIRECT_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// Attach the bearer token if one exists. Cookie auth works in parallel.
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage can throw in private mode. Ignore.
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Network error or timeout — treat as transient, never as logout.
    if (!error.response) {
      const friendly = new Error(
        'Cannot reach the server. It may be starting up. Wait a moment and try again.'
      );
      friendly.isNetworkError = true;
      friendly.originalError = error;
      return Promise.reject(friendly);
    }

    // A 401 on an endpoint in the exempt list is NOT a logout event.
    // Return the error to the caller so the page can display it.
    if (status === 401 && shouldNeverRedirect(url)) {
      const wrapped = new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Your session is not valid for this action.'
      );
      wrapped.status = status;
      wrapped.data = error.response.data;
      return Promise.reject(wrapped);
    }

    // Only a 401 on a non-exempt endpoint is treated as a genuine
    // auth failure that warrants a redirect. Debounce so a burst of
    // simultaneous 401s only redirects once.
    if (status === 401) {
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