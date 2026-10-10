const citizenRepository = require('../repositories/citizenRepository');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user || !user.citizen_id) {
    throw new Error('No citizen profile associated with this account');
  }
  const citizen = await citizenRepository.findById(user.citizen_id);
  if (!citizen) throw new Error('Citizen not found');
  return formatCitizen(citizen);
}

async function updateContact(userId, { phone, email, address }) {
  const user = await userRepository.findById(userId);
  if (!user || !user.citizen_id) throw new Error('No citizen profile');

  const updated = await citizenRepository.update(user.citizen_id, {
    phone,
    email,
    address,
  });

  await auditService.log({
    userId,
    username: user.username,
    action: 'CITIZEN_CONTACT_UPDATED',
    recordType: 'CITIZEN',
    recordId: user.citizen_id,
    result: 'SUCCESS',
  });

  return updated;
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error('Account not found');

  const ok = await verifyPassword(currentPassword, user.password_hash);
  if (!ok) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    throw error;
  }

  const hash = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, hash);

  await auditService.log({
    userId,
    username: user.username,
    action: 'PASSWORD_CHANGED',
    recordType: 'USER',
    recordId: userId,
    result: 'SUCCESS',
  });

  return { success: true };
}

function formatCitizen(citizen) {
  return {
    id: citizen.id,
    fullName: `${citizen.first_name} ${citizen.last_name}`,
    nationalId: citizen.national_id,
    dateOfBirth: citizen.date_of_birth,
    gender: citizen.gender,
    placeOfBirth: citizen.place_of_birth,
    address: citizen.address,
    phone: citizen.phone,
    email: citizen.email,
    isVerified: citizen.is_verified,
    updatedAt: citizen.updated_at,
  };
}

module.exports = { getProfile, updateContact, changePassword, formatCitizen };