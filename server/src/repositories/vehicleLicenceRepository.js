const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO vehicle_licences
      (citizen_id, vehicle_id, reference_number, licence_number, issue_date, expiry_date, fee_amount, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING') RETURNING *`,
    [
      data.citizenId,
      data.vehicleId,
      data.referenceNumber,
      data.licenceNumber || null,
      data.issueDate || null,
      data.expiryDate || null,
      data.feeAmount || 0,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM vehicle_licences WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findByVehicle(vehicleId) {
  const result = await query(
    'SELECT * FROM vehicle_licences WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT 1',
    [vehicleId]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM vehicle_licences WHERE id = $1', [id]);
  return result.rows[0];
}

async function issue(id, { licenceNumber, expiryDate }) {
  const result = await query(
    `UPDATE vehicle_licences
     SET status = 'ISSUED',
         is_paid = TRUE,
         licence_number = $2,
         expiry_date = $3,
         issue_date = NOW(),
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, licenceNumber, expiryDate]
  );
  return result.rows[0];
}

module.exports = { create, findByCitizen, findByVehicle, findById, issue };