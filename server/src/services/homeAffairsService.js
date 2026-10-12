const citizenRepository = require('../repositories/citizenRepository');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const biometricService = require('./biometricService');
const documentService = require('./documentService');
const birthCertificateRepository = require('../repositories/birthCertificateRepository');
const deathCertificateRepository = require('../repositories/deathCertificateRepository');
const marriageCertificateRepository = require('../repositories/marriageCertificateRepository');
const { generateNationalId, generateReference } = require('../utils/referenceGenerator');
const logger = require('../utils/logger');

// Fields the officer may edit after the citizen is created.
const EDITABLE_FIELDS = [
  'first_name',
  'last_name',
  'place_of_birth',
  'address',
  'phone',
  'email',
];

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────
function badRequestError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}
function notFoundError(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

// ─────────────────────────────────────────────────────────────────────
// Read operations
// ─────────────────────────────────────────────────────────────────────
async function searchByQuery({ query }) {
  if (!query) return null;
  const citizen = await citizenRepository.findByAny(query);
  return citizen || null;
}

async function getById(id) {
  const citizen = await citizenRepository.findById(id);
  if (!citizen) return null;

  // Look up the linked user row by citizen_id.
  const owner = await userRepository.findByCitizenId(citizen.id);

  return {
    ...citizen,
    registrationId: owner ? owner.id : null,
  };
}

async function getRegistrations(filters = {}) {
  return citizenRepository.findRegistrations(filters);
}

async function getRegistrationById(id) {
  return citizenRepository.findRegistrationById(id);
}

// ─────────────────────────────────────────────────────────────────────
// Complete a citizen record
// ─────────────────────────────────────────────────────────────────────
async function completeRecord(registrationId, data, staffUser) {
  const registration = await citizenRepository.findRegistrationById(registrationId);
  if (!registration) throw notFoundError('Registration not found');

  if (registration.citizen_id) {
    const err = new Error('This registration already has a citizen record.');
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

  // Step 2 — Split name
  const fullName = (data.fullName || '').trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Step 3 — Compose address
  const addressParts = [data.village, data.district, data.postalAddress].filter(Boolean);
  const address = addressParts.join(', ');

  // Step 4 — Create citizen
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

  // Step 5 — Link user to citizen
  await userRepository.linkCitizen(registration.id, citizen.id);

  // Step 5.5 — Re-link documents
  try {
    await documentService.relinkRegistrationDocuments(registration.id, citizen.id);
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
        throw badRequestError('Facial photo is required');
      }

      if (Object.keys(fingerprints).length > 0) {
        await biometricService.enrollFingerprints(citizen.id, fingerprints, staffUser);
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
      if (err.statusCode === 400) throw err;
    }
  }

  // Step 7 — Audit
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

// ─────────────────────────────────────────────────────────────────────
// Verification
// ─────────────────────────────────────────────────────────────────────
async function verifyCitizen(citizenId, { checks, notes }, staffUser) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) throw new Error('Citizen not found');

  if (!citizen.national_id) {
    throw badRequestError('Record must be completed before verification');
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
  const patch = {};
  for (const key of EDITABLE_FIELDS) {
    if (data[key] !== undefined) patch[key] = data[key];
  }
  if (Object.keys(patch).length === 0) {
    throw badRequestError('No editable fields supplied.');
  }

  const updated = await citizenRepository.updateWithHistory(
    citizenId,
    patch,
    staffUser.userId
  );

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'CITIZEN_UPDATED',
    recordType: 'CITIZEN',
    recordId: citizenId,
    result: 'SUCCESS',
  });

  return updated;
}

// ─────────────────────────────────────────────────────────────────────
// Certificates — Birth, Death, Marriage
// ─────────────────────────────────────────────────────────────────────
async function getCertificatesForCitizen(citizenId) {
  const [birth, death, marriage] = await Promise.all([
    birthCertificateRepository.findByCitizen(citizenId),
    deathCertificateRepository
      .findByCitizen(citizenId)
      .then((r) => (Array.isArray(r) ? r : r ? [r] : [])),
    marriageCertificateRepository.findByCitizen(citizenId),
  ]);
  return { birth, death, marriage };
}

async function issueBirthCertificate(citizenId, data, staffUser) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) throw notFoundError('Citizen not found');

  const certificateNumber = await generateReference('BIRTH_CERTIFICATE');

  const created = await birthCertificateRepository.create({
    citizenId,
    certificateNumber,
    dateOfBirth: data.dateOfBirth || citizen.date_of_birth,
    placeOfBirth: data.placeOfBirth || citizen.place_of_birth,
    fatherName: data.fatherName,
    motherName: data.motherName,
    issuedBy: staffUser.userId,
    notes: data.notes,
  });

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'BIRTH_CERTIFICATE_ISSUED',
    recordType: 'BIRTH_CERTIFICATE',
    recordId: created.id,
    result: 'SUCCESS',
  });

  return created;
}

async function issueDeathCertificate(citizenId, data, staffUser) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) throw notFoundError('Citizen not found');

  if (!data.dateOfDeath) throw badRequestError('Date of death is required.');

  const certificateNumber = await generateReference('DEATH_CERTIFICATE');

  const created = await deathCertificateRepository.create({
    citizenId,
    certificateNumber,
    dateOfDeath: data.dateOfDeath,
    placeOfDeath: data.placeOfDeath,
    causeOfDeath: data.causeOfDeath,
    issuedBy: staffUser.userId,
    notes: data.notes,
  });

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'DEATH_CERTIFICATE_ISSUED',
    recordType: 'DEATH_CERTIFICATE',
    recordId: created.id,
    result: 'SUCCESS',
  });

  return created;
}

async function issueMarriageCertificate(citizenId, data, staffUser) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) throw notFoundError('Citizen not found');

  if (!data.marriageDate) throw badRequestError('Marriage date is required.');
  if (!data.spouse2Name && !data.spouse2CitizenId) {
    throw badRequestError('Provide spouse 2 name or citizen ID.');
  }

  let spouse2CitizenId = null;
  if (data.spouse2CitizenId) {
    const spouse = await citizenRepository.findById(data.spouse2CitizenId);
    if (!spouse) throw notFoundError('Spouse 2 citizen not found');
    spouse2CitizenId = spouse.id;
  }

  const certificateNumber = await generateReference('MARRIAGE_CERTIFICATE');

  const created = await marriageCertificateRepository.create({
    certificateNumber,
    spouse1CitizenId: citizenId,
    spouse2CitizenId,
    spouse2Name: data.spouse2Name,
    marriageDate: data.marriageDate,
    placeOfMarriage: data.placeOfMarriage,
    officiant: data.officiant,
    issuedBy: staffUser.userId,
    notes: data.notes,
  });

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'MARRIAGE_CERTIFICATE_ISSUED',
    recordType: 'MARRIAGE_CERTIFICATE',
    recordId: created.id,
    result: 'SUCCESS',
  });

  return created;
}

// ─────────────────────────────────────────────────────────────────────
// Dashboard and reports
// ─────────────────────────────────────────────────────────────────────
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
  getCertificatesForCitizen,
  issueBirthCertificate,
  issueDeathCertificate,
  issueMarriageCertificate,
  getDashboardStats,
  getReports,
};