const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO vehicle_inspections
      (citizen_id, vehicle_id, reference_number, inspection_type,
       inspection_date, time_slot, location, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'BOOKED') RETURNING *`,
    [
      data.citizenId,
      data.vehicleId || null,
      data.referenceNumber,
      data.inspectionType,
      data.inspectionDate || null,
      data.timeSlot || null,
      data.location || null,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM vehicle_inspections WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM vehicle_inspections WHERE id = $1', [id]);
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM vehicle_inspections WHERE 1=1';
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function complete(id, { result: outcome, notes, certificateNumber, certificateExpiry }) {
  const result = await query(
    `UPDATE vehicle_inspections
     SET status = 'COMPLETED',
         result = $2,
         notes = $3,
         certificate_number = $4,
         certificate_expiry = $5,
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, outcome || 'PASSED', notes || null, certificateNumber || null, certificateExpiry || null]
  );
  return result.rows[0];
}

async function cancel(id) {
  await query(
    "UPDATE vehicle_inspections SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1",
    [id]
  );
}

module.exports = { create, findByCitizen, findById, findAll, complete, cancel };