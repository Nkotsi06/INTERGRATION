const { query } = require('../config/database');

async function findByNationalId(nationalId) {
  const result = await query(
    `SELECT dc.* FROM death_certificates dc
     JOIN citizens c ON c.id = dc.citizen_id
     WHERE c.national_id = $1 LIMIT 1`,
    [nationalId]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM death_certificates WHERE citizen_id = $1 LIMIT 1',
    [citizenId]
  );
  return result.rows[0];
}

module.exports = { findByNationalId, findByCitizen };