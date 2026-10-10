import apiClient from './apiClient';

// -------------------------------------------------------------
// Dashboard
// -------------------------------------------------------------
export const getDashboardStats = () => apiClient.get('/admin/stats');
export const getHealth = () => apiClient.get('/admin/health');
export const getRecentActivity = (limit = 5) =>
  apiClient.get('/admin/activity', { params: { limit } });

// -------------------------------------------------------------
// Options (roles, ministries, statuses)
// -------------------------------------------------------------
export const getOptions = () => apiClient.get('/admin/options');

// -------------------------------------------------------------
// Users — paginated, filtered
// -------------------------------------------------------------
export const getUsers = (params) =>
  apiClient.get('/admin/users', { params });

export const getUserById = (id) => apiClient.get(`/admin/users/${id}`);
export const createUser = (data) => apiClient.post('/admin/users', data);
export const updateUser = (id, data) => apiClient.put(`/admin/users/${id}`, data);

export const activateUser = (id) =>
  apiClient.patch(`/admin/users/${id}/activate`);

export const deactivateUser = (id) =>
  apiClient.patch(`/admin/users/${id}/deactivate`);

export const deleteUser = (id) =>
  apiClient.delete(`/admin/users/${id}`);

// -------------------------------------------------------------
// System settings
// -------------------------------------------------------------
export const getSystemSettings = () => apiClient.get('/admin/settings');
export const updateSystemSettings = (data) =>
  apiClient.put('/admin/settings', data);

// -------------------------------------------------------------
// Ministry, document type, status, reference, language config
// -------------------------------------------------------------
export const updateMinistry = (id, data) =>
  apiClient.put(`/admin/settings/ministries/${id}`, data);

export const updateDocumentType = (id, data) =>
  apiClient.put(`/admin/settings/document-types/${id}`, data);

export const updateStatusType = (id, data) =>
  apiClient.put(`/admin/settings/status-types/${id}`, data);

export const updateReferenceFormat = (id, data) =>
  apiClient.put(`/admin/settings/reference-formats/${id}`, data);

export const updateLanguage = (id, data) =>
  apiClient.put(`/admin/settings/languages/${id}`, data);

export const uploadLogo = (formData) =>
  apiClient.post('/admin/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getBiometricSettings = () =>
  apiClient.get('/admin/settings/biometrics');

export const updateBiometricSettings = (data) =>
  apiClient.put('/admin/settings/biometrics', data);