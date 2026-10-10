import apiClient from './apiClient';

export const getAuditLogs = (params) =>
  apiClient.get('/audit', { params });

export const exportAuditLogs = (params) =>
  apiClient.get('/audit/export', { params, responseType: 'blob' });