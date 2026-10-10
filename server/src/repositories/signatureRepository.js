const { query } = require('../config/database');

async function create(sig) {
  const result = await query(
    `INSERT INTO signatures (citizen_id, document_type_code, signature_data, signed_at)
     VALUES ($1, $2, $3, NOW()) RETURNING *`,
    [sig.citizenId, sig.documentTypeCode, sig.signatureData]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM signatures WHERE citizen_id = $1 ORDER BY signed_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findLatestByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM signatures WHERE citizen_id = $1 ORDER BY signed_at DESC LIMIT 1',
    [citizenId]
  );
  return result.rows[0];
}

module.exports = { create, findByCitizen, findLatestByCitizen };