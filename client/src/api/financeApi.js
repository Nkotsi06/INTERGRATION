import apiClient from './apiClient';

export const getTreasury = (params) => apiClient.get('/finance/staff/treasury', { params });
export const getTreasuryStats = () => apiClient.get('/finance/staff/treasury/stats');
export const getBudget = (params) => apiClient.get('/finance/staff/budget', { params });
export const getBudgetStats = (fiscalYear) =>
  apiClient.get('/finance/staff/budget/stats', { params: { fiscalYear } });
export const getDebt = (params) => apiClient.get('/finance/staff/debt', { params });
export const getDebtStats = () => apiClient.get('/finance/staff/debt/stats');
export const getProcurement = (params) =>
  apiClient.get('/finance/staff/procurement', { params });
export const getProcurementStats = () =>
  apiClient.get('/finance/staff/procurement/stats');
export const getAuditFindings = (params) =>
  apiClient.get('/finance/staff/audit-findings', { params });
export const getAuditStats = () => apiClient.get('/finance/staff/audit-findings/stats');
