import apiClient from './apiClient';

// Citizen
export const applyForPassport = (data) => apiClient.post('/passport/apply', data);
export const getMyApplications = (params) =>
  apiClient.get('/passport/applications', { params });
export const getApplicationByRef = (ref) =>
  apiClient.get(`/passport/applications/${ref}`);

// Staff
export const getStaffApplications = (params) =>
  apiClient.get('/passport/staff/applications', { params });
export const processApplication = (id, data) =>
  apiClient.put(`/passport/staff/applications/${id}`, data);
export const issuePassport = (id, data) =>
  apiClient.post(`/passport/issue/${id}`, data);
export const getStaffStats = () => apiClient.get('/passport/staff/stats');