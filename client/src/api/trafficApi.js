import apiClient from './apiClient';

// Citizen — licence
export const getLicence = () => apiClient.get('/traffic/licence');
export const renewLicence = (data) => apiClient.post('/traffic/licence/renew', data);
export const bookDrivingTest = (data) => apiClient.post('/traffic/test/book', data);
export const getAppointments = () => apiClient.get('/traffic/appointments');
export const getPassedDrivingTests = () => apiClient.get('/traffic/test/references');
export const cancelAppointment = (id) => apiClient.delete(`/traffic/appointments/${id}`);

// Citizen — licence applications
export const applyForLearnersLicence = (data) => apiClient.post('/traffic/licence/learners', data);
export const applyForDrivingLicence = (data) => apiClient.post('/traffic/licence/driving', data);
export const applyForPublicDrivingPermit = (data) => apiClient.post('/traffic/licence/pdp', data);
export const getMyTrafficApplications = () => apiClient.get('/traffic/applications');
export const getTrafficApplicationByRef = (reference) => apiClient.get(`/traffic/applications/${reference}`);

// Citizen — vehicles
export const getVehicles = () => apiClient.get('/traffic/vehicles');
export const getVehicleById = (id) => apiClient.get(`/traffic/vehicles/${id}`);
export const registerVehicle = (data) => apiClient.post('/traffic/vehicles', data);
export const updateVehicle = (id, data) => apiClient.put(`/traffic/vehicles/${id}`, data);
export const deleteVehicle = (id) => apiClient.delete(`/traffic/vehicles/${id}`);

// Citizen — inspections
export const bookInspection = (data) => apiClient.post('/traffic/inspections', data);
export const getInspections = () => apiClient.get('/traffic/inspections');
export const cancelInspection = (id) => apiClient.delete(`/traffic/inspections/${id}`);

// Citizen — vehicle licences
export const applyVehicleLicence = (data) => apiClient.post('/traffic/vehicle-licences', data);
export const renewVehicleLicence = (id, data) =>
  apiClient.post(`/traffic/vehicle-licences/${id}/renew`, data);
export const getVehicleLicences = () => apiClient.get('/traffic/vehicle-licences');

// Citizen — transport permits
export const applyTransportPermit = (data) => apiClient.post('/traffic/permits', data);
export const getTransportPermits = () => apiClient.get('/traffic/permits');

// Staff
export const getStaffApplications = (params) => apiClient.get('/traffic/staff/applications', { params });
export const processApplication = (id, data) => apiClient.put(`/traffic/staff/applications/${id}`, data);
export const issueLicence = (id, data) => apiClient.post(`/traffic/issue-licence/${id}`, data);
export const getStaffInspections = (params) => apiClient.get('/traffic/staff/inspections', { params });
export const processInspection = (id, data) => apiClient.put(`/traffic/staff/inspections/${id}`, data);
export const getStaffDrivingTests = () => apiClient.get('/traffic/staff/tests');
export const processDrivingTest = (id, data) =>
  apiClient.put(`/traffic/staff/tests/${id}`, data);
export const getStaffTransportPermits = (params) => apiClient.get('/traffic/staff/permits', { params });
export const processTransportPermit = (id, data) => apiClient.put(`/traffic/staff/permits/${id}`, data);
export const getStaffStats = () => apiClient.get('/traffic/staff/stats');