const { query } = require('../config/database');

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM driver_licences WHERE citizen_id = $1 ORDER BY created_at DESC LIMIT 1',
    [citizenId]
  );
  return result.rows[0];
}

async function create(licence) {
  const result = await query(
    `INSERT INTO driver_licences (citizen_id, licence_number, licence_type, issue_date, expiry_date, is_valid)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      licence.citizenId, licence.licenceNumber, licence.licenceType,
      licence.issueDate, licence.expiryDate, true,
    ]
  );
  return result.rows[0];
}

module.exports = { findByCitizen, create };