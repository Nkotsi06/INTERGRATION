import apiClient from './apiClient';

export const getPublicServices = (ministry) => {
  const q = ministry
    ? `?ministry=${encodeURIComponent(ministry)}`
    : '';
  return apiClient.get(`/services/public${q}`);
};

export const listAllServices = (params) =>
  apiClient.get('/services', { params });

export const getServiceById = (id) => apiClient.get(`/services/${id}`);

export const updateService = (id, data) =>
  apiClient.put(`/services/${id}`, data);

export const applyForService = (serviceId, formData) =>
  apiClient.post(`/services/${serviceId}/apply`, { formData });