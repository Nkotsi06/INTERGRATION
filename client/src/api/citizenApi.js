import apiClient from './apiClient';

export const getProfile = () => apiClient.get('/citizen/profile');
export const updateContact = (data) => apiClient.put('/citizen/contact', data);

export const getApplications = () => apiClient.get('/citizen/applications');
export const getApplicationByRef = (ref) =>
  apiClient.get(`/citizen/applications/${ref}`);

export const getDocuments = () => apiClient.get('/citizen/documents');
export const getBiometrics = () => apiClient.get('/citizen/biometrics');

export const getPhotoBlob = () =>
  apiClient.get('/citizen/photo', { responseType: 'blob' });

export const getNotifications = () => apiClient.get('/citizen/notifications');
export const deleteNotification = (id) =>
  apiClient.delete(`/citizen/notifications/${id}`);
export const markNotificationRead = (id) =>
  apiClient.put(`/citizen/notifications/${id}/read`);

export const changePassword = (data) =>
  apiClient.put('/citizen/change-password', data);