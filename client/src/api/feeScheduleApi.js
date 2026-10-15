import apiClient from './apiClient';

export const listFees = (params) =>
  apiClient.get('/fee-schedule', { params });

export const updateFee = (id, data) =>
  apiClient.put(`/fee-schedule/${id}`, data);