const { query } = require('../config/database');
const citizenRepository = require('../repositories/citizenRepository');
const applicationRepository = require('../repositories/applicationRepository');
const signatureRepository = require('../repositories/signatureRepository');
const notificationService = require('./notificationService');
const { generateReference } = require('../utils/referenceGenerator');

function badRequest(msg) {
  const e = new Error(msg); e.statusCode = 400; return e;
}

async function getAutoFillData(citizenId) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) throw badRequest('Citizen not found.');

  // Check for a verified birth certificate
  const docs = await query(
    'SELECT id FROM citizen_documents WHERE citizen_id = $1 AND document_type_code = $2 AND status = $3',
    [citizenId, 'BIRTH_CERTIFICATE', 'VERIFIED']
  );
  const hasBirthCert = docs.rows.length > 0;

  // Check for active applications
  const apps = await query(
    `SELECT id FROM applications 
     WHERE citizen_id = $1 AND data->>'serviceCode' = 'NATIONAL_ID_APPLY' 
     AND status NOT IN ('REJECTED', 'COMPLETED', 'COLLECTED')`,
    [citizenId]
  );

  return {
    citizen,
    hasBirthCert,
    hasActiveApplication: apps.rows.length > 0,
  };
}

async function submitApplication(citizenId, data, user) {
  const { hasBirthCert, hasActiveApplication } = await getAutoFillData(citizenId);

  if (!hasBirthCert) throw badRequest('You need a birth certificate on record to apply.');
  if (hasActiveApplication) throw badRequest('You already have an active application.');

  const referenceNumber = await generateReference('APPLICATION');

  // 1. Create the application record
  const application = await applicationRepository.create({
    referenceNumber,
    citizenId,
    service: 'HOME_AFFAIRS',
    data: {
      serviceCode: 'NATIONAL_ID_APPLY',
      serviceName: 'Apply for a National ID',
      formData: {
        reason: data.reason,
        phone: data.phone,
        branchId: data.branchId,
      },
      fee: 0,
    },
  });

  // 2. Save the signature
  if (data.signature) {
    await signatureRepository.create({
      citizenId,
      documentTypeCode: 'NATIONAL_ID',
      signatureData: data.signature,
    });
  }

  // 3. Notify the citizen
  await notificationService.notify(
    user.userId,
    'National ID Application Received',
    `Your application ${referenceNumber} has been received and is under review.`
  );

  return { referenceNumber, application };
}

module.exports = { getAutoFillData, submitApplication };