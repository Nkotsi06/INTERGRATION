const { query } = require('../config/database');

async function create(app) {
  const result = await query(
    `INSERT INTO passport_applications
       (application_id, citizen_id, passport_type, reason, status,
        passport_number, collection_office, is_renewal, previous_passport_number)
     VALUES ($1, $2, $3, $4, 'SUBMITTED', $5, $6, $7, $8) RETURNING *`,
    [
      app.applicationId,
      app.citizenId,
      app.passportType,
      app.reason,
      app.passportNumber,
      app.collectionOffice,
      app.isRenewal,
      app.previousPassportNumber || null,
    ]
  );
  return result.rows[0];
}

async function findByApplicationId(applicationId) {
  const result = await query(
    'SELECT * FROM passport_applications WHERE application_id = $1',
    [applicationId]
  );
  return result.rows[0];
}

async function updateStatus(applicationId, status) {
  const result = await query(
    `UPDATE passport_applications
     SET status = $2
     WHERE application_id = $1
     RETURNING *`,
    [applicationId, status]
  );
  return result.rows[0];
}

async function findForStaff(filters = {}) {
  const params = [];
  let conditions = "a.service = 'PASSPORT'";
  if (filters.status) {
    params.push(filters.status);
    conditions += ` AND a.status = $${params.length}`;
  }
  const result = await query(
    `SELECT a.id,
            a.reference_number AS "referenceNumber",
            a.status,
            a.submitted_at AS "dateSubmitted",
            a.updated_at AS "dateUpdated",
            a.data,
            c.first_name || ' ' || c.last_name AS "citizenName",
            c.national_id AS "nationalId",
            pa.passport_type AS "passportType",
            pa.passport_number AS "passportNumber",
            pa.is_renewal AS "isRenewal",
            pa.collection_office AS "collectionOffice"
     FROM applications a
     LEFT JOIN citizens c ON c.id = a.citizen_id
     LEFT JOIN passport_applications pa ON pa.application_id = a.id
     WHERE ${conditions}
     ORDER BY a.submitted_at DESC`,
    params
  );
  return result.rows;
}

async function findCurrentByCitizen(citizenId) {
  const result = await query(
    `SELECT pa.passport_number, pa.passport_type,
            COALESCE(b.name, pa.collection_office) AS collection_office,
            pa.created_at, pa.is_renewal, a.status
     FROM passport_applications pa
     JOIN applications a ON a.id = pa.application_id
     LEFT JOIN branches b ON b.id::text = pa.collection_office
     WHERE pa.citizen_id = $1
       AND pa.passport_number IS NOT NULL
       AND a.status IN ('APPROVED', 'COMPLETED')
     ORDER BY pa.created_at DESC
     LIMIT 1`,
    [citizenId]
  );
  return result.rows[0] || null;
}

module.exports = {
  create,
  findByApplicationId,
  findForStaff,
  updateStatus,
  findCurrentByCitizen,
};