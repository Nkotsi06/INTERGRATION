import apiClient from './apiClient';

export const searchCitizen = (params) =>
  apiClient.get('/home-affairs/search', { params });

export const getCitizenById = (id) =>
  apiClient.get(`/home-affairs/citizen/${id}`);

export const getRegistrations = (params) =>
  apiClient.get('/home-affairs/registrations', { params });

export const getRegistrationById = (id) =>
  apiClient.get(`/home-affairs/registrations/${id}`);

export const completeRecord = (id, data) =>
  apiClient.put(`/home-affairs/registrations/${id}/complete`, data);

export const updateCitizen = (id, data) =>
  apiClient.put(`/home-affairs/citizen/${id}`, data);

export const verifyCitizen = (id, data) =>
  apiClient.post(`/home-affairs/citizen/${id}/verify`, data);

export const getCitizenDocuments = (id) =>
  apiClient.get(`/home-affairs/citizen/${id}/documents`);

export const getCitizenBiometrics = (id) =>
  apiClient.get(`/home-affairs/citizen/${id}/biometrics`);

export const getCitizenPhotoBlob = (id) =>
  apiClient.get(`/home-affairs/citizens/${id}/photo`, { responseType: 'blob' });

export const getDashboardStats = () =>
  apiClient.get('/home-affairs/stats');

export const getReports = (params) =>
  apiClient.get('/home-affairs/reports', { params });