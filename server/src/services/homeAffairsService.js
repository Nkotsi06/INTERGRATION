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

const EDITABLE_FIELDS = [
  'first_name',
  'last_name',
  'place_of_birth',
  'address',
  'phone',
  'email',
];

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

async function searchByQuery({ query }) {
  if (!query) return null;
  const citizen = await citizenRepository.findByAny(query);
  return citizen || null;
}

async function getById(id) {
  const citizen = await citizenRepository.findById(id);
  if (!citizen) return null;
  const owner = await userRepository.findByCitizenId(citizen.id);
  return { ...citizen, registrationId: owner ? owner.id : null };
}

async function getRegistrations(filters = {}) {
  return citizenRepository.findRegistrations(filters);
}

async function getRegistrationById(id) {
  return citizenRepository.findRegistrationById(id);
}

async function completeRecord(registrationId, data, staffUser) {
  const registration = await citizenRepository.findRegistrationById(registrationId);
  if (!registration) throw notFoundError('Registration not found');

  if (registration.citizen_id) {
    const err = new Error('This registration already has a citizen record.');
    err.statusCode = 409;
    throw err;
  }

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

  const fullName = (data.fullName || '').trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const addressParts = [data.village, data.district, data.postalAddress].filter(Boolean);
  const address = addressParts.join(', ');

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

  await userRepository.linkCitizen(registration.id, citizen.id);

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
    childFullName:
      data.childFullName ||
      `${citizen.first_name} ${citizen.last_name}`.trim(),
    childDateOfBirth: data.childDateOfBirth || citizen.date_of_birth,
    childGender: data.childGender || citizen.gender,
    placeOfBirth: data.placeOfBirth || citizen.place_of_birth,
    fatherFullName: data.fatherFullName || null,
    fatherNationalId: data.fatherNationalId || null,
    motherFullName: data.motherFullName || null,
    motherNationalId: data.motherNationalId || null,
    requestType: data.requestType || 'NEW',
    status: 'ISSUED',
    issuedBy: staffUser.userId,
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
    deceasedFullName:
      data.deceasedFullName ||
      `${citizen.first_name} ${citizen.last_name}`.trim(),
    deceasedNationalId: data.deceasedNationalId || citizen.national_id,
    dateOfDeath: data.dateOfDeath,
    placeOfDeath: data.placeOfDeath || null,
    causeOfDeath: data.causeOfDeath || null,
    informantFullName: data.informantFullName || null,
    informantRelationship: data.informantRelationship || null,
    status: 'ISSUED',
    issuedBy: staffUser.userId,
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
  if (!data.spouse2FullName && !data.spouse2NationalId) {
    throw badRequestError('Provide spouse 2 name or National ID.');
  }

  const certificateNumber = await generateReference('MARRIAGE_CERTIFICATE');

  const created = await marriageCertificateRepository.create({
    citizenId,
    certificateNumber,
    spouse1FullName:
      data.spouse1FullName ||
      `${citizen.first_name} ${citizen.last_name}`.trim(),
    spouse1NationalId: data.spouse1NationalId || citizen.national_id,
    spouse2FullName: data.spouse2FullName || null,
    spouse2NationalId: data.spouse2NationalId || null,
    marriageDate: data.marriageDate,
    marriagePlace: data.marriagePlace || null,
    marriageOfficiant: data.marriageOfficiant || null,
    requestType: data.requestType || 'NEW',
    status: 'ISSUED',
    issuedBy: staffUser.userId,
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