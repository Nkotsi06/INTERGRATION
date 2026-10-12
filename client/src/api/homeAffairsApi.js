import apiClient from './apiClient';

// Search and read
export const searchCitizen = (params) =>
  apiClient.get('/home-affairs/search', { params });

export const getCitizenById = (id) =>
  apiClient.get(`/home-affairs/citizen/${id}`);

// Registration queue
export const getRegistrations = (params) =>
  apiClient.get('/home-affairs/registrations', { params });

export const getRegistrationById = (id) =>
  apiClient.get(`/home-affairs/registrations/${id}`);

// Record capture and update
export const completeRecord = (id, data) =>
  apiClient.put(`/home-affairs/registrations/${id}/complete`, data);

export const updateCitizen = (id, data) =>
  apiClient.put(`/home-affairs/citizen/${id}`, data);

// Verification
export const verifyCitizen = (id, data) =>
  apiClient.post(`/home-affairs/citizen/${id}/verify`, data);

// Documents and biometrics
export const getCitizenDocuments = (id) =>
  apiClient.get(`/home-affairs/citizen/${id}/documents`);

export const getCitizenBiometrics = (id) =>
  apiClient.get(`/home-affairs/citizen/${id}/biometrics`);

export const getCitizenPhotoBlob = (id) =>
  apiClient.get(`/home-affairs/citizens/${id}/photo`, { responseType: 'blob' });

// Dashboard and reports
export const getDashboardStats = () =>
  apiClient.get('/home-affairs/stats');

export const getReports = (params) =>
  apiClient.get('/home-affairs/reports', { params });

// Certificates
export const getCertificates = (id) =>
  apiClient.get(`/home-affairs/citizen/${id}/certificates`);

export const issueBirthCertificate = (id, data) =>
  apiClient.post(`/home-affairs/citizen/${id}/certificates/birth`, data);

export const issueDeathCertificate = (id, data) =>
  apiClient.post(`/home-affairs/citizen/${id}/certificates/death`, data);

export const issueMarriageCertificate = (id, data) =>
  apiClient.post(`/home-affairs/citizen/${id}/certificates/marriage`, data);