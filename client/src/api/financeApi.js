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

export const listGovernmentEmployers = (activeOnly = false) =>
  apiClient.get('/finance/staff/employers', { params: { activeOnly } });
export const createGovernmentEmployer = (data) =>
  apiClient.post('/finance/staff/employers', data);
export const updateGovernmentEmployer = (id, data) =>
  apiClient.put(`/finance/staff/employers/${id}`, data);
export const listGovernmentEmployees = (params) =>
  apiClient.get('/finance/staff/government-employees', { params });
export const createGovernmentEmployee = (data) =>
  apiClient.post('/finance/staff/government-employees', data);
export const updateGovernmentEmployee = (id, data) =>
  apiClient.put(`/finance/staff/government-employees/${id}`, data);
export const importGovernmentEmployees = (rows) =>
  apiClient.post('/finance/staff/government-employees/import', { rows });
export const listGovernmentDebts = (params) =>
  apiClient.get('/finance/staff/government-debts', { params });
export const createGovernmentDebt = (data) =>
  apiClient.post('/finance/staff/government-debts', data);
export const clearGovernmentDebt = (id) =>
  apiClient.patch(`/finance/staff/government-debts/${id}/clear`);
