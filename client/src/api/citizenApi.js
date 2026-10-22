import apiClient from './apiClient';

export const getProfile = () => apiClient.get('/citizen/profile');
export const updateContact = (data) => apiClient.put('/citizen/contact', data);

export const getApplications = () => apiClient.get('/citizen/applications');
export const getApplicationByRef = (ref) =>
  apiClient.get(`/citizen/applications/${ref}`);
export const deleteApplication = (id) =>
  apiClient.delete(`/citizen/applications/${id}`);

export const getDocuments = () => apiClient.get('/citizen/documents');
export const getBiometrics = () => apiClient.get('/citizen/biometrics');

export const getPhotoBlob = () =>
  apiClient.get('/citizen/photo', { responseType: 'blob' });

// Notifications now live at the top-level /api/notifications route so
// every role (citizen, staff, admin) can share the same endpoints.
export const getNotifications = () => apiClient.get('/notifications');
export const getUnreadCount = () => apiClient.get('/notifications/unread-count');
export const deleteNotification = (id) =>
  apiClient.delete(`/notifications/${id}`);
export const markNotificationRead = (id) =>
  apiClient.put(`/notifications/${id}/read`);

export const changePassword = (data) =>
  apiClient.put('/citizen/change-password', data);
