import apiClient from './apiClient';

// Citizen
export const getLicence = () => apiClient.get('/traffic/licence');
export const renewLicence = (data) => apiClient.post('/traffic/licence/renew', data);
export const bookDrivingTest = (data) => apiClient.post('/traffic/test/book', data);
export const getAppointments = () => apiClient.get('/traffic/appointments');
export const cancelAppointment = (id) => apiClient.delete(`/traffic/appointments/${id}`);

// Staff
export const getStaffApplications = (params) =>
  apiClient.get('/traffic/staff/applications', { params });
export const processApplication = (id, data) =>
  apiClient.put(`/traffic/staff/applications/${id}`, data);
export const issueLicence = (id, data) =>
  apiClient.post(`/traffic/issue-licence/${id}`, data);
export const getStaffStats = () => apiClient.get('/traffic/staff/stats');