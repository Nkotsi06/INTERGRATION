const citizenRepository = require('../repositories/citizenRepository');
const userRepository = require('../repositories/userRepository');
const documentRepository = require('../repositories/documentRepository');
const auditService = require('./auditService');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');

// ─────────────────────────────────────────────────────────────────────
// getProfile — returns isVerified, nationality, updatedAt, photoUrl.
// ─────────────────────────────────────────────────────────────────────
async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user || !user.citizen_id) {
    const err = new Error('No citizen profile associated with this account');
    err.statusCode = 404;
    throw err;
  }
  const citizen = await citizenRepository.findById(user.citizen_id);
  if (!citizen) throw new Error('Citizen not found');

  const passportPhoto = await documentRepository.findLatestByType(
    citizen.id,
    'PASSPORT_PHOTO'
  );

  const base = formatCitizen(citizen);
  return {
    ...base,
    photoUrl: passportPhoto
      ? `/api/citizen/photo?v=${passportPhoto.uploaded_at}`
      : null,
  };
}

// ─────────────────────────────────────────────────────────────────────
// updateContact — accepts only phone and email. Every other field in
// the request body is dropped. Server-side validation matches the
// client-side rules.
// ─────────────────────────────────────────────────────────────────────
async function updateContact(userId, body) {
  const user = await userRepository.findById(userId);
  if (!user || !user.citizen_id) {
    const err = new Error('No citizen profile');
    err.statusCode = 404;
    throw err;
  }

  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
  const email = typeof body.email === 'string' ? body.email.trim() : undefined;

  if (phone !== undefined && phone !== '' && !/^[0-9+\-\s()]{6,30}$/.test(phone)) {
    const err = new Error('Please enter a valid phone number.');
    err.statusCode = 400;
    throw err;
  }
  if (email !== undefined && email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const err = new Error('Please enter a valid email address.');
    err.statusCode = 400;
    throw err;
  }

  const patch = {};
  if (phone !== undefined) patch.phone = phone;
  if (email !== undefined) patch.email = email;

  const updated = await citizenRepository.update(user.citizen_id, patch);

  await auditService.log({
    userId,
    username: user.username,
    action: 'CITIZEN_CONTACT_UPDATED',
    recordType: 'CITIZEN',
    recordId: user.citizen_id,
    result: 'SUCCESS',
  });

  return formatCitizen(updated);
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

// ─────────────────────────────────────────────────────────────────────
// Locate a photo for a citizen. Prefers PASSPORT_PHOTO document, falls
// back to the biometrics facial image.
// ─────────────────────────────────────────────────────────────────────
async function findPhotoForCitizen(citizenId) {
  const passportPhoto = await documentRepository.findLatestByType(
    citizenId,
    'PASSPORT_PHOTO'
  );
  if (passportPhoto) {
    return {
      kind: 'document',
      filePath: passportPhoto.file_path,
      fileName: passportPhoto.file_name,
      fileType: passportPhoto.file_type || 'image/jpeg',
    };
  }

  const biometricRepository = require('../repositories/biometricRepository');
  const bio = await biometricRepository.findByCitizen(citizenId);
  if (bio?.facial_image) {
    return { kind: 'dataurl', dataUrl: bio.facial_image };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// formatCitizen — the single shape the client sees.
// nationality is null when the citizen record has none. The client
// shows a placeholder, not a hard-coded 'Mosotho'.
// ─────────────────────────────────────────────────────────────────────
function formatCitizen(citizen) {
  return {
    id: citizen.id,
    fullName: `${citizen.first_name} ${citizen.last_name}`.trim(),
    firstName: citizen.first_name,
    lastName: citizen.last_name,
    nationalId: citizen.national_id,
    dateOfBirth: citizen.date_of_birth,
    gender: citizen.gender,
    placeOfBirth: citizen.place_of_birth,
    nationality: citizen.nationality || null,
    address: citizen.address,
    phone: citizen.phone,
    email: citizen.email,
    isVerified: !!citizen.is_verified,
    verifiedAt: citizen.verified_at,
    createdAt: citizen.created_at,
    updatedAt: citizen.updated_at,
  };
}

module.exports = {
  getProfile,
  updateContact,
  changePassword,
  formatCitizen,
  findPhotoForCitizen,
};