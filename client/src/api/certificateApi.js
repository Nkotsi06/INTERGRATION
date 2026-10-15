import apiClient from './apiClient';

export const getMyCertificates = () => apiClient.get('/certificates/mine');

export const listCertificates = (params) =>
  apiClient.get('/certificates', { params });

export const getCertificate = (type, id) =>
  apiClient.get(`/certificates/${type}/${id}`);

export const updateCertificate = (type, id, data) =>
  apiClient.put(`/certificates/${type}/${id}`, data);

export const issueCertificate = (type, id) =>
  apiClient.post(`/certificates/${type}/${id}/issue`);

export const rejectCertificate = (type, id, reason) =>
  apiClient.post(`/certificates/${type}/${id}/reject`, { reason });

export const downloadCertificate = (type, id) =>
  apiClient.get(`/certificates/${type}/${id}/download`, {
    responseType: 'blob',
  });