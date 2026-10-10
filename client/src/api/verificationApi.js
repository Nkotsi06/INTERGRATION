import apiClient from './apiClient';

/**
 * Confirms the citizen's session by matching the password against their
 * account and checking their Home Affairs record.
 *
 * Response:
 *   { success: true, citizenId: '...' }              // verified
 *   { success: false, reason: 'not_verified' }        // pending
 *   { success: false, reason: 'wrong_password' }      // wrong password
 */
export const confirmIdentity = (password) =>
  apiClient.post('/verification/confirm', { password });

export const getVerificationStatus = () =>
  apiClient.get('/verification/status');