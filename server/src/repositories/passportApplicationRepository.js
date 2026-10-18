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
     SET status = $2,
         issue_date = CASE WHEN $2 = 'APPROVED' THEN CURRENT_DATE ELSE issue_date END,
         expiry_date = CASE
           WHEN $2 = 'APPROVED' THEN CURRENT_DATE + INTERVAL '10 years'
           ELSE expiry_date
         END
     WHERE application_id = $1
     RETURNING *`,
    [applicationId, status]
  );
  return result.rows[0];
}

async function findCurrentByCitizen(citizenId) {
  const result = await query(
    `SELECT pa.passport_number, pa.passport_type, pa.collection_office,
            pa.created_at, pa.is_renewal, pa.issue_date, pa.expiry_date, a.status
     FROM passport_applications pa
     JOIN applications a ON a.id = pa.application_id
     WHERE pa.citizen_id = $1
       AND pa.passport_number IS NOT NULL
       AND a.status IN ('APPROVED', 'COMPLETED')
     ORDER BY pa.created_at DESC
     LIMIT 1`,
    [citizenId]
  );
  return result.rows[0] || null;
}

module.exports = { create, findByApplicationId, updateStatus, findCurrentByCitizen };