const { query } = require('../config/database');

async function create(app) {
  const result = await query(
    `INSERT INTO passport_applications (application_id, citizen_id, passport_type, reason, status)
     VALUES ($1, $2, $3, $4, 'SUBMITTED') RETURNING *`,
    [app.applicationId, app.citizenId, app.passportType, app.reason]
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

module.exports = { create, findByApplicationId };