const { query } = require('../config/database');

async function create(appointment) {
  const result = await query(
    `INSERT INTO appointments (citizen_id, service, appointment_date, appointment_time, location, status)
     VALUES ($1, $2, $3, $4, $5, 'SCHEDULED') RETURNING *`,
    [
      appointment.citizenId, appointment.service, appointment.date,
      appointment.time, appointment.location,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM appointments WHERE citizen_id = $1 ORDER BY appointment_date DESC',
    [citizenId]
  );
  return result.rows;
}

async function cancel(id) {
  await query("UPDATE appointments SET status = 'CANCELLED' WHERE id = $1", [id]);
}

module.exports = { create, findByCitizen, cancel };