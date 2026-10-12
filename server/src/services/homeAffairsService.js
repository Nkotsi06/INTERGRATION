const citizenRepository = require('../repositories/citizenRepository');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const biometricService = require('./biometricService');
const documentService = require('./documentService');
const { generateNationalId } = require('../utils/referenceGenerator');
const logger = require('../utils/logger');

async function searchByQuery({ query }) {
  if (!query) return null;
  const citizen = await citizenRepository.findByAny(query);
  return citizen || null;
}

async function getById(id) {
  return citizenRepository.findById(id);
}

async function getRegistrations(filters = {}) {
  return citizenRepository.findRegistrations(filters);
}

async function getRegistrationById(id) {
  return citizenRepository.findRegistrationById(id);
}

async function completeRecord(registrationId, data, staffUser) {
  const registration = await citizenRepository.findRegistrationById(registrationId);
  if (!registration) {
    const err = new Error('Registration not found');
    err.statusCode = 404;
    throw err;
  }

  if (registration.citizen_id) {
    const err = new Error('This registration already has a citizen record');
    err.statusCode = 409;
    throw err;
  }

  // Step 1 — Generate a unique National ID
  let nationalId;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    nationalId = await generateNationalId(data.dateOfBirth, data.gender);
    const existing = await citizenRepository.findByNationalId(nationalId);
    if (!existing) break;
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error('Could not generate a unique National ID. Please try again.');
  }

  // Step 2 — Split full name into first and last
  const fullName = (data.fullName || '').trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Step 3 — Compose address
  const addressParts = [data.village, data.district, data.postalAddress].filter(Boolean);
  const address = addressParts.join(', ');

  // Step 4 — Create the citizen
  const citizen = await citizenRepository.create({
    nationalId,
    firstName,
    lastName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    placeOfBirth: data.placeOfBirth,
    address,
    phone: data.phone,
    email: data.email,
    isVerified: false,
  });

  logger.info(
    `Citizen record created for ${registration.username}: National ID ${nationalId}`
  );

  // Step 5 — Link account to citizen
  await userRepository.linkCitizen(registration.id, citizen.id);

  // Step 5.5 — Re-link documents
  try {
    await documentService.relinkRegistrationDocuments(
      registration.id,
      citizen.id
    );
    logger.info(
      `Documents re-linked for registration ${registration.id} → citizen ${citizen.id}`
    );
  } catch (err) {
    logger.error(
      `Could not relink documents for registration ${registration.id}: ${err.message}`
    );
  }

  // Step 6 — Biometrics (facial required, fingerprints optional)
  if (data.biometrics && typeof data.biometrics === 'object') {
    try {
      const fingerprints = data.biometrics.fingerprints || {};
      const facialImage = data.biometrics.facialImage || null;

      if (!facialImage) {
        const err = new Error('Facial photo is required');
        err.statusCode = 400;
        throw err;
      }

      if (Object.keys(fingerprints).length > 0) {
        await biometricService.enrollFingerprints(
          citizen.id,
          fingerprints,
          staffUser
        );
        logger.info(
          `Fingerprints enrolled for citizen ${citizen.id} (${Object.keys(fingerprints).length} prints)`
        );
      }

      await biometricService.enrollFacial(citizen.id, facialImage, staffUser);
      logger.info(`Facial photo enrolled for citizen ${citizen.id}`);
    } catch (err) {
      logger.error(
        `Biometric enrollment failed for citizen ${citizen.id}: ${err.message}`
      );
      // Surface facial-photo requirement errors to the caller.
      if (err.statusCode === 400) throw err;
    }
  }

  // Step 7 — Audit entry
  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'CITIZEN_RECORD_COMPLETED',
    recordType: 'CITIZEN',
    recordId: citizen.id,
    result: 'SUCCESS',
  });

  return {
    citizenId: citizen.id,
    nationalId: citizen.national_id,
    fullName: `${citizen.first_name} ${citizen.last_name}`.trim(),
    dateOfBirth: citizen.date_of_birth,
  };
}

async function verifyCitizen(citizenId, { checks, notes }, staffUser) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) throw new Error('Citizen not found');

  if (!citizen.national_id) {
    const err = new Error('Record must be completed before verification');
    err.statusCode = 400;
    throw err;
  }

  const updated = await citizenRepository.markVerified(citizenId, {
    verifiedBy: staffUser.userId,
    notes,
  });

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'CITIZEN_VERIFIED',
    recordType: 'CITIZEN',
    recordId: citizenId,
    result: 'SUCCESS',
  });

  return updated;
}

async function updateCitizen(citizenId, data, staffUser) {
  const updated = await citizenRepository.updateWithHistory(
    citizenId,
    data,
    staffUser.userId
  );
  return updated;
}

async function getDashboardStats() {
  return citizenRepository.getDashboardStats();
}

async function getReports({ type, fromDate, toDate }) {
  return citizenRepository.getReports({ type, fromDate, toDate });
}

module.exports = {
  searchByQuery,
  getById,
  getRegistrations,
  getRegistrationById,
  completeRecord,
  verifyCitizen,
  updateCitizen,
  getDashboardStats,
  getReports,
};