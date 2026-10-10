import apiClient from './apiClient';

export const saveSignature = (data) => apiClient.post('/signatures', data);
export const getSignature = (citizenId) => apiClient.get(`/signatures/${citizenId}`);
export const verifySignature = (citizenId, data) =>
  apiClient.post(`/signatures/${citizenId}/verify`, data);