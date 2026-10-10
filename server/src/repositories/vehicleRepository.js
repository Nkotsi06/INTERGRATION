const { query } = require('../config/database');

async function findByCitizen(citizenId) {
  const result = await query('SELECT * FROM vehicles WHERE citizen_id = $1', [citizenId]);
  return result.rows;
}

module.exports = { findByCitizen };