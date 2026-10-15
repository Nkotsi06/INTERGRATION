import apiClient from './apiClient';

// Accepts an optional second argument with { onUploadProgress, signal }.
// DocumentUpload passes this through so the progress bar and Cancel button work.
export const uploadDocument = (formData, config = {}) =>
  apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });

export const getDocuments = (params) =>
  apiClient.get('/documents', { params });

export const getDocumentById = (id) => apiClient.get(`/documents/${id}`);
export const downloadDocument = (id) =>
  apiClient.get(`/documents/${id}/download`, { responseType: 'blob' });
export const deleteDocument = (id) => apiClient.delete(`/documents/${id}`);
export const verifyDocument = (id, data) =>
  apiClient.put(`/documents/${id}/verify`, data);