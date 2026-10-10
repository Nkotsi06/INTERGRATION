import apiClient from './apiClient';

export const getPublicSettings = () => apiClient.get('/settings/public');
export const getLanguages = () => apiClient.get('/settings/languages');
export const getTranslations = (langCode) =>
  apiClient.get(`/settings/translations/${langCode}`);
export const getMinistries = () => apiClient.get('/settings/ministries');
export const getDocumentTypes = () => apiClient.get('/settings/document-types');
export const getStatusTypes = () => apiClient.get('/settings/status-types');
export const getReferenceFormats = () => apiClient.get('/settings/reference-formats');