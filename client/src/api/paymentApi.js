import apiClient from './apiClient';

// Citizen
export const getMyPayments = () => apiClient.get('/payments/mine');

// Finance staff
export const getFinanceDashboard = () =>
  apiClient.get('/payments/finance-dashboard');

export const listPayments = (params) =>
  apiClient.get('/payments', { params });

export const recordOfflinePayment = (data) => apiClient.post('/payments/offline', data);