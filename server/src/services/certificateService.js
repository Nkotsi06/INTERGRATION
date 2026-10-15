const certificateRepository = require('../repositories/certificateRepository');
const applicationRepository = require('../repositories/applicationRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const { generateReference } = require('../utils/referenceGenerator');
const { generateCertificateBuffer } = require('../utils/certificatePdfGenerator');
const auditService = require('./auditService');
const { query } = require('../config/database');

const SERVICE_TO_TYPE = {
  BIRTH_CERTIFICATE_APPLY: 'BIRTH',
  DEATH_CERTIFICATE_APPLY: 'DEATH',
  MARRIAGE_CERTIFICATE_APPLY: 'MARRIAGE',
  DIVORCE_CERTIFICATE_APPLY: 'DIVORCE',
};

function notFound(msg) { const e = new Error(msg); e.statusCode = 404; return e; }
function badRequest(msg) { const e = new Error(msg); e.statusCode = 400; return e; }

async function recordCertificateApplication({ application, formData, citizenId }) {
  const serviceCode = application.data?.serviceCode;
  const type = SERVICE_TO_TYPE[serviceCode];
  if (!type) return null;

  const certificateNumber = await generateReference(`${type}_CERTIFICATE`);

  return certificateRepository.create(type, {
    applicationId: application.id,
    citizenId,
    certificateNumber,
    formData,
  });
}

async function listForCitizen(citizenId) {
  const results = await Promise.all(
    ['BIRTH', 'DEATH', 'MARRIAGE', 'DIVORCE'].map((type) =>
      certificateRepository.findByCitizen(type, citizenId).then((rows) =>
        rows.map((r) => ({ ...r, certificate_type: type }))
      )
    )
  );
  return results.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function listAll(filters = {}) {
  const types = filters.type ? [filters.type] : ['BIRTH', 'DEATH', 'MARRIAGE', 'DIVORCE'];
  const results = await Promise.all(
    types.map((type) =>
      certificateRepository.findAll(type, filters).then((rows) =>
        rows.map((r) => ({ ...r, certificate_type: type }))
      )
    )
  );
  return results.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function getById(type, id) {
  const cert = await certificateRepository.findById(type, id);
  if (!cert) throw notFound('Certificate not found');
  return { ...cert, certificate_type: type };
}

// ─── Edit before issue ────────────────────────────────────────────────────
async function updateCertificate(type, id, data, staffUser) {
  const cert = await certificateRepository.findById(type, id);
  if (!cert) throw notFound('Certificate not found');
  if (cert.status === 'ISSUED') {
    throw badRequest(
      'Issued certificates cannot be edited. Contact an administrator to void and reissue.'
    );
  }
  if (cert.status === 'REJECTED') {
    throw badRequest('Rejected certificates cannot be edited.');
  }

  const updated = await certificateRepository.updateFields(type, id, data);

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `${type}_CERTIFICATE_UPDATED`,
    recordType: 'CERTIFICATE',
    recordId: id,
    result: 'SUCCESS',
  });

  return updated;
}

async function issue(type, id, staffUser) {
  const cert = await certificateRepository.findById(type, id);
  if (!cert) throw notFound('Certificate not found');
  if (cert.status === 'ISSUED') throw badRequest('Already issued.');
  if (cert.status === 'REJECTED') throw badRequest('This certificate was rejected.');

  const updated = await certificateRepository.markIssued(type, id, staffUser.userId);

  const owner = await userRepository.findByCitizenId(cert.citizen_id);
  if (owner) {
    await notificationService.notify(
      owner.id,
      `${type.toLowerCase()} certificate issued`,
      `Certificate ${cert.certificate_number} is ready. Open My Certificates to download it.`
    );
  }

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `${type}_CERTIFICATE_ISSUED`,
    recordType: 'CERTIFICATE',
    recordId: id,
    result: 'SUCCESS',
  });

  return updated;
}

async function reject(type, id, reason, staffUser) {
  const cert = await certificateRepository.findById(type, id);
  if (!cert) throw notFound('Certificate not found');
  if (cert.status === 'ISSUED') throw badRequest('Already issued.');

  const updated = await certificateRepository.markRejected(
    type,
    id,
    reason,
    staffUser.userId
  );

  const owner = await userRepository.findByCitizenId(cert.citizen_id);
  if (owner) {
    await notificationService.notify(
      owner.id,
      `${type.toLowerCase()} certificate rejected`,
      reason ? `Reason: ${reason}` : 'Please contact Home Affairs for details.'
    );
  }

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `${type}_CERTIFICATE_REJECTED`,
    recordType: 'CERTIFICATE',
    recordId: id,
    result: 'SUCCESS',
  });

  return updated;
}

async function downloadPdf(type, id, user) {
  const cert = await certificateRepository.findById(type, id);
  if (!cert) throw notFound('Certificate not found');
  if (cert.status !== 'ISSUED') throw badRequest('Certificate has not been issued yet.');

  if (user.role === 'CITIZEN') {
    const owner = await userRepository.findByCitizenId(cert.citizen_id);
    if (!owner || owner.id !== user.userId) {
      const e = new Error('You cannot download this certificate.');
      e.statusCode = 403;
      throw e;
    }
  }

  const buffer = await generateCertificateBuffer(type, cert);
  return { buffer, fileName: `${cert.certificate_number}.pdf` };
}

// ─── NEW: count all pending certificates across the four tables ───────────
async function getPendingCount() {
  const result = await query(`
    SELECT
      (SELECT COUNT(*) FROM birth_certificates        WHERE status = 'PENDING')::int
      + (SELECT COUNT(*) FROM death_certificates_new  WHERE status = 'PENDING')::int
      + (SELECT COUNT(*) FROM marriage_certificates   WHERE status = 'PENDING')::int
      + (SELECT COUNT(*) FROM divorce_certificates    WHERE status = 'PENDING')::int
      AS pending
  `);
  return result.rows[0].pending || 0;
}
// ─────────────────────────────────────────────────────────────────────────

module.exports = {
  recordCertificateApplication,
  listForCitizen,
  listAll,
  getById,
  updateCertificate,
  issue,
  reject,
  downloadPdf,
  getPendingCount,
  SERVICE_TO_TYPE,
};