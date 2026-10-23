import axios from 'axios';
import { normalize } from './normalize';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 60000,
});

let onRequestStart = () => {};
let onRequestEnd = () => {};

export function registerProgressHandlers({ start, stop }) {
  onRequestStart = start || (() => {});
  onRequestEnd = stop || (() => {});
}

apiClient.interceptors.request.use((config) => {
  onRequestStart();
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Cookie authentication remains available when browser storage is disabled.
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    onRequestEnd();

    // Blobs are downloads (PDF, CSV, photos) — never touch them.
    const responseType = response.config?.responseType;
    if (responseType === 'blob' || responseType === 'arraybuffer') {
      return response.data;
    }

    // Everything else is normalised from snake_case → camelCase so
    // every page can rely on a single shape.
    return normalize(response.data);
  },
  (error) => {
    onRequestEnd();

    if (!error.response) {
      const friendly = new Error(
        'Cannot reach the server. It may be starting up. Wait a moment and try again.'
      );
      friendly.isNetworkError = true;
      friendly.originalError = error;
      return Promise.reject(friendly);
    }

    const responseData = error.response.data;
    const wrapped = new Error(
      responseData?.message || responseData?.error || error.message
    );
    wrapped.status = error.response.status;
    wrapped.data = responseData;
    wrapped.originalError = error;
    return Promise.reject(wrapped);
  }
);

export default apiClient;