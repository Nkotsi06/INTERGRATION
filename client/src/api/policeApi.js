import apiClient from './apiClient';

// Citizen
export const reportCase = (data) => apiClient.post('/police/cases', data);
export const getMyCases = (params) => apiClient.get('/police/cases', { params });
export const getCaseByNumber = (caseNumber) =>
  apiClient.get(`/police/cases/${caseNumber}`);
export const requestClearance = (data) =>
  apiClient.post('/police/clearance', data);

// Staff
export const getStaffCases = (params) =>
  apiClient.get('/police/staff/cases', { params });
export const updateCase = (id, data) =>
  apiClient.put(`/police/staff/cases/${id}`, data);
export const addCaseUpdate = (id, data) =>
  apiClient.post(`/police/staff/cases/${id}/updates`, data);
export const getStaffStats = () => apiClient.get('/police/staff/stats');