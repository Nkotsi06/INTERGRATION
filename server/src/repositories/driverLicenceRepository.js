const { query } = require('../config/database');

async function findByCitizen(citizenId) {
  const result = await query(
    `SELECT * FROM driver_licences
     WHERE citizen_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [citizenId]
  );
  return result.rows[0] || null;
}

async function findByApplicationId(applicationId) {
  const result = await query(
    'SELECT * FROM driver_licences WHERE application_id = $1 LIMIT 1',
    [applicationId]
  );
  return result.rows[0];
}

async function create(licence) {
  const result = await query(
    `INSERT INTO driver_licences
      (citizen_id, licence_number, licence_type, issue_date, expiry_date,
       is_valid, application_id, issued_by, issued_at, status, is_public_transport)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),'ACTIVE',$9) RETURNING *`,
    [
      licence.citizenId,
      licence.licenceNumber,
      licence.licenceType,
      licence.issueDate,
      licence.expiryDate,
      true,
      licence.applicationId || null,
      licence.issuedBy || null,
      licence.isPublicTransport || false,
    ]
  );
  return result.rows[0];
}

async function attachSignature(licenceId, signatureId) {
  const result = await query(
    'UPDATE driver_licences SET signature_id = $1 WHERE id = $2 RETURNING *',
    [signatureId, licenceId]
  );
  return result.rows[0];
}

module.exports = {
  findByCitizen,
  findByApplicationId,
  create,
  attachSignature,
};