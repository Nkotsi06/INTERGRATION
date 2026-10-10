import apiClient from './apiClient';

// Citizen
export const getTaxProfile = () => apiClient.get('/finance/tax/profile');
export const registerTax = (data) => apiClient.post('/finance/tax/register', data);
export const makePayment = (data) => apiClient.post('/finance/payment', data);
export const getPayments = (params) => apiClient.get('/finance/payments', { params });
export const getTaxClearance = () => apiClient.get('/finance/tax/clearance');
export const downloadTaxClearance = () =>
  apiClient.get('/finance/tax/clearance/download', { responseType: 'blob' });

// Staff
export const getStaffRegistrations = (params) =>
  apiClient.get('/finance/staff/registrations', { params });
export const processRegistration = (id, data) =>
  apiClient.put(`/finance/staff/registrations/${id}`, data);
export const getStaffStats = () => apiClient.get('/finance/staff/stats');