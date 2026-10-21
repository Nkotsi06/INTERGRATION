import apiClient from './apiClient';

export const submitBirthApplication = (data) =>
  apiClient.post('/birth-applications', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getBirthApplications = (params) =>
  apiClient.get('/birth-applications', { params });
export const getBirthApplication = (id) =>
  apiClient.get(`/birth-applications/${id}`);
export const reviewBirthApplication = (id, decision, reason) =>
  apiClient.put(`/birth-applications/${id}/review`, { decision, reason });
export const getBirthApplicationDocumentUrl = (id, type, index = 0) =>
  `${apiClient.defaults.baseURL.replace(/\/+$/, '')}/birth-applications/${id}/documents/${type}/${index}`;
export const getBirthCertificatePdfUrl = (certificateNumber) =>
  `${apiClient.defaults.baseURL.replace(/\/+$/, '')}/birth-applications/certificate/${encodeURIComponent(certificateNumber)}`;
