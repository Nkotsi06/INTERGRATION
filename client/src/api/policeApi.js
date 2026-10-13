import apiClient from './apiClient';

// Cases — citizen
export const reportCase = (data) => apiClient.post('/police/cases', data);
export const getMyCases = (params) => apiClient.get('/police/cases', { params });
export const getCaseByNumber = (caseNumber) => apiClient.get(`/police/cases/${caseNumber}`);

// Clearance certificate — citizen
export const requestClearance = (data) => apiClient.post('/police/clearance', data);

// Criminal record — citizen
export const requestCriminalRecord = (data) => apiClient.post('/police/criminal-records', data);
export const getMyCriminalRecords = () => apiClient.get('/police/criminal-records');

// Staff
export const getStaffCases = (params) => apiClient.get('/police/staff/cases', { params });
export const updateCase = (id, data) => apiClient.put(`/police/staff/cases/${id}`, data);
export const addCaseUpdate = (id, data) => apiClient.post(`/police/staff/cases/${id}/updates`, data);
export const getStaffCriminalRecords = (params) => apiClient.get('/police/staff/criminal-records', { params });
export const processCriminalRecord = (id, data) => apiClient.put(`/police/staff/criminal-records/${id}`, data);
export const getStaffStats = () => apiClient.get('/police/staff/stats');