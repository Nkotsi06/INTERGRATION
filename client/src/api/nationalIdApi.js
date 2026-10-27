import apiClient from './apiClient';

export const getNationalIdApplicationData = () =>
  apiClient.get('/national-id/auto-fill');

export const submitNationalIdApplication = (data) =>
  apiClient.post('/national-id/apply', data);
