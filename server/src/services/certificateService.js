const certificateRepository = require('../repositories/certificateRepository');
const birthCertificateRepository = require('../repositories/birthCertificateRepository');
const applicationRepository = require('../repositories/applicationRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const citizenRepository = require('../repositories/citizenRepository');
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

// Services that eventually produce a National ID card. The card row
// is inserted by homeAffairsApplicationService when the application
// reaches the COLLECTED state.
const NATIONAL_ID_SERVICE_CODES = new Set([
  'NATIONAL_ID_APPLY',
  'NATIONAL_ID_REPLACE',
]);

function notFound(msg) { const e = new Error(msg); e.statusCode = 404; return e; }
function badRequest(msg) { const e = new Error(msg); e.statusCode = 400; return e; }

// ─── Record a certificate row from an application ────────────────────
async function recordCertificateApplication({ application, formData, citizenId }) {
  const serviceCode = application.data?.serviceCode;
  const type = SERVICE_TO_TYPE[serviceCode];
  if (!type) return null;

  const certificateNumber = await generateReference(`${type}_CERTIFICATE`);

  // For a birth certificate, copy the applicant's own National ID onto
  // the row so the printed PDF shows the ID Number line.
  let childNationalId = null;
  if (type === 'BIRTH' && citizenId) {
    const citizen = await citizenRepository.findById(citizenId);
    if (citizen?.national_id) {
      childNationalId = citizen.national_id;
    }
  }

  if (type === 'BIRTH') {
    return birthCertificateRepository.create({
      applicationId: application.id,
      citizenId,
      certificateNumber,
      childNationalId,
      childFullName: formData.childFullName || null,
      childDateOfBirth: formData.childDateOfBirth || null,
      childGender: formData.childGender || null,
      placeOfBirth: formData.placeOfBirth || null,
      motherFullName: formData.motherFullName || null,
      motherNationalId: formData.motherNationalId || null,
      fatherFullName: formData.fatherFullName || null,
      fatherNationalId: formData.fatherNationalId || null,
      requestType: formData.requestType || 'NEW',
      status: 'PENDING',
    });
  }

  return certificateRepository.create(type, {
    applicationId: application.id,
    citizenId,
    certificateNumber,
    formData,
  });
}

// ─── List certificates for one citizen (includes ID cards) ───────────
async function listForCitizen(citizenId) {
  const [birth, death, marriage, divorce, cards, passports] = await Promise.all([
    certificateRepository.findByCitizen('BIRTH', citizenId),
    certificateRepository.findByCitizen('DEATH', citizenId),
    certificateRepository.findByCitizen('MARRIAGE', citizenId),
    certificateRepository.findByCitizen('DIVORCE', citizenId),
    query(
      `SELECT card.*,
              signature.signature_data
       FROM national_id_cards card
       LEFT JOIN LATERAL (
         SELECT signature_data
         FROM signatures
         WHERE citizen_id = card.citizen_id
           AND document_type_code = 'NATIONAL_ID'
         ORDER BY signed_at DESC
         LIMIT 1
       ) signature ON TRUE
       WHERE card.citizen_id = $1
       ORDER BY card.created_at DESC`,
      [citizenId]
    ).then((r) => r.rows),
    query(
      `SELECT pa.id,
              pa.citizen_id,
              pa.application_id,
              pa.passport_number,
              pa.passport_type,
              pa.issue_date,
              pa.expiry_date,
              pa.issued_at,
              pa.collected_at,
              pa.collected_by_name,
              pa.collection_office,
              pa.signature_id,
              signature.signature_data,
              pa.created_at,
              a.status,
              b.name AS collection_branch,
              b.address AS collection_address,
              b.district AS collection_district,
              a.data->'formData'->>'childPhoto' AS applicant_photo
       FROM passport_applications pa
       JOIN applications a ON a.id = pa.application_id
       LEFT JOIN branches b ON b.id::text = pa.collection_office
       LEFT JOIN LATERAL (
         SELECT signature_data
         FROM signatures
         WHERE citizen_id = pa.citizen_id
           AND document_type_code = 'PASSPORT_APPLICATION'
         ORDER BY signed_at DESC
         LIMIT 1
       ) signature ON TRUE
       WHERE pa.citizen_id = $1
         AND pa.passport_number IS NOT NULL
         AND a.status IN ('READY_FOR_COLLECTION', 'COLLECTED', 'COMPLETED')
       ORDER BY pa.created_at DESC`,
      [citizenId]
    ).then((r) => r.rows),
  ]);

  const combined = [
    ...birth.map((r) => ({ ...r, certificate_type: 'BIRTH' })),
    ...death.map((r) => ({ ...r, certificate_type: 'DEATH' })),
    ...marriage.map((r) => ({ ...r, certificate_type: 'MARRIAGE' })),
    ...divorce.map((r) => ({ ...r, certificate_type: 'DIVORCE' })),
    ...cards.map((r) => ({
      ...r,
      certificate_type: 'ID_CARD',
      certificate_number: r.card_number,
    })),
    ...passports.map((r) => ({
      ...r,
      certificate_type: 'PASSPORT',
      certificate_number: r.passport_number,
    })),
  ];

  return combined.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

// ─── List all certificates (staff queue) ────────────────────────────
async function listAll(filters = {}) {
  const types = filters.type
    ? [filters.type]
    : ['BIRTH', 'DEATH', 'MARRIAGE', 'DIVORCE'];

  const results = await Promise.all(
    types
      .filter((t) => t !== 'ID_CARD')
      .map((type) =>
        certificateRepository.findAll(type, filters).then((rows) =>
          rows.map((r) => ({ ...r, certificate_type: type }))
        )
      )
  );

  // ID cards are not certificate-table rows; add them separately when
  // the caller asked for them (or asked for everything).
  if (!filters.type || filters.type === 'ID_CARD') {
    const cardFilters = [];
    const params = [];
    if (filters.status) {
      params.push(filters.status);
      cardFilters.push(`status = $${params.length}`);
    }
    if (filters.from) {
      params.push(filters.from);
      cardFilters.push(`created_at >= $${params.length}::date`);
    }
    if (filters.to) {
      params.push(filters.to);
      cardFilters.push(`created_at <= ($${params.length}::date + INTERVAL '1 day')`);
    }
    const where = cardFilters.length ? `WHERE ${cardFilters.join(' AND ')}` : '';
    const cards = await query(
      `SELECT * FROM national_id_cards ${where} ORDER BY created_at DESC`,
      params
    );
    results.push(
      cards.rows.map((r) => ({
        ...r,
        certificate_type: 'ID_CARD',
        certificate_number: r.card_number,
      }))
    );
  }

  return results
    .flat()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ─── Read one certificate ───────────────────────────────────────────
async function getById(type, id) {
  if (type === 'ID_CARD') {
    const result = await query(
      'SELECT * FROM national_id_cards WHERE id = $1',
      [id]
    );
    const row = result.rows[0];
    if (!row) throw notFound('National ID card not found');
    return { ...row, certificate_type: 'ID_CARD', certificate_number: row.card_number };
  }

  const cert = await certificateRepository.findById(type, id);
  if (!cert) throw notFound('Certificate not found');
  return { ...cert, certificate_type: type };
}

// ─── Edit before issue ──────────────────────────────────────────────
async function updateCertificate(type, id, data, staffUser) {
  if (type === 'ID_CARD') {
    throw badRequest('National ID cards cannot be edited.');
  }

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

// ─── Issue ──────────────────────────────────────────────────────────
async function issue(type, id, staffUser) {
  if (type === 'ID_CARD') {
    return issueNationalIdCard(id, staffUser);
  }

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

// ─── Reject ─────────────────────────────────────────────────────────
async function reject(type, id, reason, staffUser) {
  if (type === 'ID_CARD') {
    return rejectNationalIdCard(id, reason, staffUser);
  }

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

// ─── National ID cards ──────────────────────────────────────────────
// Called by homeAffairsApplicationService when the officer marks the
// National ID application as COLLECTED. Creates the persistent card
// row so it appears in My Documents.
async function createNationalIdCardFromApplication({ application, staffUser }) {
  if (!NATIONAL_ID_SERVICE_CODES.has(application.data?.serviceCode)) return null;

  const citizen = await citizenRepository.findById(application.citizen_id);
  if (!citizen?.national_id) return null;

  // Guard against duplicate rows.
  const existing = await query(
    'SELECT id FROM national_id_cards WHERE application_id = $1 LIMIT 1',
    [application.id]
  );
  if (existing.rows[0]) return existing.rows[0];

  const result = await query(
    `INSERT INTO national_id_cards
       (citizen_id, application_id, card_number, issued_at, issued_by, status)
     VALUES ($1, $2, $3, NOW(), $4, 'ISSUED')
     RETURNING *`,
    [citizen.id, application.id, citizen.national_id, staffUser.userId]
  );

  const card = result.rows[0];

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'NATIONAL_ID_CARD_ISSUED',
    recordType: 'NATIONAL_ID_CARD',
    recordId: card.id,
    result: 'SUCCESS',
  });

  const owner = await userRepository.findByCitizenId(citizen.id);
  if (owner) {
    await notificationService.notify(
      owner.id,
      'National ID card issued',
      `Your National ID card (${citizen.national_id}) is ready. Open My Documents to view it.`
    );
  }

  return card;
}

async function issueNationalIdCard(id, staffUser) {
  const result = await query(
    `UPDATE national_id_cards
     SET status = 'ISSUED', issued_at = NOW(), issued_by = $2, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, staffUser.userId]
  );
  if (!result.rows[0]) throw notFound('National ID card not found');
  return { ...result.rows[0], certificate_type: 'ID_CARD' };
}

async function rejectNationalIdCard(id, reason, staffUser) {
  const result = await query(
    `UPDATE national_id_cards
     SET status = 'REJECTED', rejection_reason = $2, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, reason || null]
  );
  if (!result.rows[0]) throw notFound('National ID card not found');

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'NATIONAL_ID_CARD_REJECTED',
    recordType: 'NATIONAL_ID_CARD',
    recordId: id,
    result: 'SUCCESS',
  });

  return { ...result.rows[0], certificate_type: 'ID_CARD' };
}

// ─── Download ───────────────────────────────────────────────────────
async function downloadPdf(type, id, user) {
  if (type === 'ID_CARD') {
    const result = await query(
      `SELECT card.*,
              citizen.first_name,
              citizen.last_name,
              citizen.national_id,
              citizen.date_of_birth,
              citizen.gender,
              signature.signature_data
       FROM national_id_cards card
       JOIN citizens citizen ON citizen.id = card.citizen_id
       LEFT JOIN LATERAL (
         SELECT signature_data
         FROM signatures
         WHERE citizen_id = card.citizen_id
           AND document_type_code = 'NATIONAL_ID'
         ORDER BY signed_at DESC
         LIMIT 1
       ) signature ON TRUE
       WHERE card.id = $1`,
      [id]
    );
    const card = result.rows[0];
    if (!card) throw notFound('National ID card not found');
    if (card.status !== 'ISSUED') throw badRequest('National ID card has not been issued.');
    if (user.role === 'CITIZEN') {
      const owner = await userRepository.findByCitizenId(card.citizen_id);
      if (!owner || owner.id !== user.userId) {
        const e = new Error('You cannot download this National ID card.');
        e.statusCode = 403;
        throw e;
      }
    }
    const buffer = await generateCertificateBuffer('ID_CARD', card);
    return { buffer, fileName: `${card.card_number}.pdf` };
  }

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

// ─── Counts for the staff dashboard ─────────────────────────────────
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
  createNationalIdCardFromApplication,
  issueNationalIdCard,
  rejectNationalIdCard,
  SERVICE_TO_TYPE,
  NATIONAL_ID_SERVICE_CODES,
};