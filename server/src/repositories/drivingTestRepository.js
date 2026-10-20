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

async function findPassedByCitizen(citizenId) {
  const result = await query(
    `SELECT id, test_type, test_date, location, test_reference
     FROM driving_tests
     WHERE citizen_id = $1
       AND status = 'PASSED'
       AND test_reference IS NOT NULL
     ORDER BY test_date DESC`,
    [citizenId]
  );
  return result.rows;
}

async function findByReference(citizenId, reference) {
  const result = await query(
    `SELECT id
     FROM driving_tests
     WHERE citizen_id = $1
       AND test_reference = $2
       AND status = 'PASSED'
     LIMIT 1`,
    [citizenId, reference]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query('SELECT * FROM driving_tests WHERE id = $1', [id]);
  return result.rows[0];
}

async function findForStaff() {
  const result = await query(
    `SELECT test.*,
            citizen.first_name,
            citizen.last_name,
            citizen.national_id
     FROM driving_tests test
     JOIN citizens citizen ON citizen.id = test.citizen_id
     WHERE test.status = 'BOOKED'
     ORDER BY test.test_date ASC, test.time_slot ASC`
  );
  return result.rows;
}

async function recordResult(id, result, testReference, score, notes) {
  const status = result;
  const updated = await query(
    `UPDATE driving_tests
     SET status = $2, result = $2, test_reference = $3, score = $4, notes = $5
     WHERE id = $1 AND status = 'BOOKED'
     RETURNING *`,
    [id, status, testReference, score || null, notes || null]
  );
  return updated.rows[0];
}

async function cancel(id) {
  await query("UPDATE driving_tests SET status = 'CANCELLED' WHERE id = $1", [id]);
}

module.exports = {
  create,
  findByCitizen,
  findPassedByCitizen,
  findByReference,
  findById,
  findForStaff,
  recordResult,
  cancel,
};