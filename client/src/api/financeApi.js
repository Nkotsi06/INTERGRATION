import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────────────
// Citizen — tax core
// ─────────────────────────────────────────────────────────────────────
export const getTaxProfile        = () => apiClient.get('/finance/tax/profile');
export const registerTax          = (data) => apiClient.post('/finance/tax/register', data);
export const makePayment          = (data) => apiClient.post('/finance/payment', data);
export const getPayments          = (params) => apiClient.get('/finance/payments', { params });
export const getTaxClearance      = () => apiClient.get('/finance/tax/clearance');
export const downloadTaxClearance = () => apiClient.get('/finance/tax/clearance/download', { responseType: 'blob' });

// ─────────────────────────────────────────────────────────────────────
// Citizen — VAT
// ─────────────────────────────────────────────────────────────────────
export const applyForVat = (data) => apiClient.post('/finance/vat', data);
export const getMyVat    = () => apiClient.get('/finance/vat');

// ─────────────────────────────────────────────────────────────────────
// Citizen — tax returns
// ─────────────────────────────────────────────────────────────────────
export const submitTaxReturn = (data) => apiClient.post('/finance/returns', data);
export const getMyTaxReturns = () => apiClient.get('/finance/returns');

// ─────────────────────────────────────────────────────────────────────
// Citizen — payment plans
// ─────────────────────────────────────────────────────────────────────
export const requestPaymentPlan = (data) => apiClient.post('/finance/payment-plans', data);
export const getMyPaymentPlans  = () => apiClient.get('/finance/payment-plans');

// ─────────────────────────────────────────────────────────────────────
// Citizen — business
// ─────────────────────────────────────────────────────────────────────
export const registerBusiness = (data) => apiClient.post('/finance/businesses', data);
export const getMyBusinesses  = () => apiClient.get('/finance/businesses');

// ─────────────────────────────────────────────────────────────────────
// Staff — tax registrations
// ─────────────────────────────────────────────────────────────────────
export const getStaffRegistrations = (params) => apiClient.get('/finance/staff/registrations', { params });
export const processRegistration   = (id, data) => apiClient.put(`/finance/staff/registrations/${id}`, data);

// ─────────────────────────────────────────────────────────────────────
// Staff — VAT applications
// ─────────────────────────────────────────────────────────────────────
export const getStaffVat = (params) => apiClient.get('/finance/staff/vat', { params });
export const processVat  = (id, data) => apiClient.put(`/finance/staff/vat/${id}`, data);

// ─────────────────────────────────────────────────────────────────────
// Staff — tax returns
// ─────────────────────────────────────────────────────────────────────
export const getStaffTaxReturns = (params) => apiClient.get('/finance/staff/returns', { params });
export const reviewTaxReturn    = (id, data) => apiClient.put(`/finance/staff/returns/${id}`, data);

// ─────────────────────────────────────────────────────────────────────
// Staff — payment plans
// ─────────────────────────────────────────────────────────────────────
export const getStaffPaymentPlans = (params) => apiClient.get('/finance/staff/payment-plans', { params });
export const processPaymentPlan   = (id, data) => apiClient.put(`/finance/staff/payment-plans/${id}`, data);

// ─────────────────────────────────────────────────────────────────────
// Staff — business registrations
// ─────────────────────────────────────────────────────────────────────
export const getStaffBusinesses = (params) => apiClient.get('/finance/staff/businesses', { params });
export const approveBusiness    = (id) => apiClient.put(`/finance/staff/businesses/${id}/approve`, {});

// ─────────────────────────────────────────────────────────────────────
// Staff — stats
// ─────────────────────────────────────────────────────────────────────
export const getStaffStats = () => apiClient.get('/finance/staff/stats');

// ─────────────────────────────────────────────────────────────────────
// Staff — Treasury
// ─────────────────────────────────────────────────────────────────────
export const getTreasury      = (params) => apiClient.get('/finance/staff/treasury', { params });
export const getTreasuryStats = ()       => apiClient.get('/finance/staff/treasury/stats');

// ─────────────────────────────────────────────────────────────────────
// Staff — Budget
// ─────────────────────────────────────────────────────────────────────
export const getBudget      = (params) => apiClient.get('/finance/staff/budget', { params });
export const getBudgetStats = (fy)     => apiClient.get('/finance/staff/budget/stats', { params: { fiscalYear: fy } });

// ─────────────────────────────────────────────────────────────────────
// Staff — Debt & Aid
// ─────────────────────────────────────────────────────────────────────
export const getDebt      = (params) => apiClient.get('/finance/staff/debt', { params });
export const getDebtStats = ()       => apiClient.get('/finance/staff/debt/stats');

// ─────────────────────────────────────────────────────────────────────
// Staff — Procurement
// ─────────────────────────────────────────────────────────────────────
export const getProcurement      = (params) => apiClient.get('/finance/staff/procurement', { params });
export const getProcurementStats = ()       => apiClient.get('/finance/staff/procurement/stats');

// ─────────────────────────────────────────────────────────────────────
// Staff — Tax policy notes
// ─────────────────────────────────────────────────────────────────────
export const getTaxPolicy = () => apiClient.get('/finance/staff/tax-policy');

// ─────────────────────────────────────────────────────────────────────
// Staff — Internal audit findings
// ─────────────────────────────────────────────────────────────────────
export const getAuditFindings = (params) => apiClient.get('/finance/staff/audit-findings', { params });
export const getAuditStats    = ()       => apiClient.get('/finance/staff/audit-findings/stats');