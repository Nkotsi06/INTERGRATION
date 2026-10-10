import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Public endpoints that are expected to return 401 when not logged in.
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

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Only redirect on 401 if the request was NOT a public endpoint.
    // Use location.replace to avoid stacking history entries.
    if (status === 401 && !isPublicEndpoint(url)) {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;