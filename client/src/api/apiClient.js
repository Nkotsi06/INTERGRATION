import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 60000,
});

// ── Progress hooks ──────────────────────────────────────────────────────
// App.jsx registers callbacks here once. Every request bumps the counter.
let onRequestStart = () => {};
let onRequestEnd = () => {};

export function registerProgressHandlers({ start, stop }) {
  onRequestStart = start || (() => {});
  onRequestEnd = stop || (() => {});
}
// ────────────────────────────────────────────────────────────────────────

const NEVER_REDIRECT_ENDPOINTS = [
  '/auth/session',
  '/auth/login',
  '/auth/register',
  '/auth/staff/login',
  '/auth/admin/login',
  '/auth/logout',
  '/auth/forgot-password',
  '/settings/',
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
  '/notifications/',
];

function shouldNeverRedirect(url = '') {
  return NEVER_REDIRECT_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

apiClient.interceptors.request.use((config) => {
  onRequestStart();
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    onRequestEnd();
    return response.data;
  },
  (error) => {
    onRequestEnd();

    const status = error.response?.status;
    const url = error.config?.url || '';

    if (!error.response) {
      const friendly = new Error(
        'Cannot reach the server. It may be starting up. Wait a moment and try again.'
      );
      friendly.isNetworkError = true;
      friendly.originalError = error;
      return Promise.reject(friendly);
    }

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