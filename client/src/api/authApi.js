import apiClient from './apiClient';

export const register = (data) => apiClient.post('/auth/register', data);
export const login = (data, role) => apiClient.post(`/auth/login`, { ...data, role });
export const staffLogin = (data) => apiClient.post('/auth/staff/login', data);
export const adminLogin = (data) => apiClient.post('/auth/admin/login', data);
export const logout = () => apiClient.post('/auth/logout');
export const getSession = () => apiClient.get('/auth/session');
export const forgotPassword = (email) => apiClient.post('/auth/forgot-password', { email });