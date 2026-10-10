const { query } = require('../config/database');

async function create(record) {
  const result = await query(
    `INSERT INTO home_affairs_records (citizen_id, record_type, record_number, issued_at, data)
     VALUES ($1, $2, $3, NOW(), $4) RETURNING *`,
    [record.citizenId, record.recordType, record.recordNumber, JSON.stringify(record.data)]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM home_affairs_records WHERE citizen_id = $1 ORDER BY issued_at DESC',
    [citizenId]
  );
  return result.rows;
}

module.exports = { create, findByCitizen };