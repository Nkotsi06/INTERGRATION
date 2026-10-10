import apiClient from './apiClient';

// Citizen
export const getPensionInfo = () => apiClient.get('/pensions/info');
export const verifyExistence = (data) => apiClient.post('/pensions/verify', data);
export const getVerificationHistory = (params) =>
  apiClient.get('/pensions/verifications', { params });

// Staff
export const getStaffVerifications = (params) =>
  apiClient.get('/pensions/staff/verifications', { params });
export const processVerification = (id, data) =>
  apiClient.put(`/pensions/staff/verifications/${id}`, data);
export const checkDeathCertificate = (nationalId) =>
  apiClient.get('/pensions/death-check', { params: { nationalId } });
export const getStaffStats = () => apiClient.get('/pensions/staff/stats');