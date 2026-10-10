import apiClient from './apiClient';

export const enrollFingerprint = (data) => apiClient.post('/biometrics/fingerprint', data);
export const enrollFacial = (data) => apiClient.post('/biometrics/facial', data);
export const getBiometrics = (citizenId) => apiClient.get(`/biometrics/${citizenId}`);
export const verifyFingerprint = (citizenId, data) =>
  apiClient.post(`/biometrics/${citizenId}/verify-fingerprint`, data);
export const verifyFacial = (citizenId, data) =>
  apiClient.post(`/biometrics/${citizenId}/verify-facial`, data);