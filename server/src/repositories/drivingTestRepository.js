const { query } = require('../config/database');

async function create(test) {
  const result = await query(
    `INSERT INTO driving_tests (citizen_id, test_type, test_date, time_slot, location, status)
     VALUES ($1, $2, $3, $4, $5, 'BOOKED') RETURNING *`,
    [test.citizenId, test.testType, test.date, test.time, test.location]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM driving_tests WHERE citizen_id = $1 ORDER BY test_date DESC',
    [citizenId]
  );
  return result.rows;
}

async function cancel(id) {
  await query("UPDATE driving_tests SET status = 'CANCELLED' WHERE id = $1", [id]);
}

module.exports = { create, findByCitizen, cancel };