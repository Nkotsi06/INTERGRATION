const { query } = require('../config/database');

async function findByCitizen(citizenId) {
  const result = await query(
    `SELECT * FROM vehicles
     WHERE citizen_id = $1
     ORDER BY registered_at DESC NULLS LAST, created_at DESC`,
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM vehicles WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByRegistrationNumber(reg) {
  const result = await query(
    'SELECT * FROM vehicles WHERE registration_number = $1',
    [reg]
  );
  return result.rows[0];
}

async function create(data) {
  const result = await query(
    `INSERT INTO vehicles
       (citizen_id, registration_number, make, model, year, colour, vin, engine_number, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE')
     RETURNING *`,
    [
      data.citizenId,
      data.registrationNumber,
      data.make || null,
      data.model || null,
      data.year ? parseInt(data.year, 10) : null,
      data.colour || null,
      data.vin || null,
      data.engineNumber || null,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const allowed = ['make', 'model', 'year', 'colour', 'vin', 'engine_number', 'status'];
  const fields = [];
  const params = [];
  for (const key of Object.keys(data)) {
    if (allowed.includes(key)) {
      params.push(data[key]);
      fields.push(`${key} = $${params.length}`);
    }
  }
  if (fields.length === 0) return findById(id);
  params.push(id);
  const result = await query(
    `UPDATE vehicles SET ${fields.join(', ')}
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function remove(id) {
  await query('DELETE FROM vehicles WHERE id = $1', [id]);
}

module.exports = {
  findByCitizen,
  findById,
  findByRegistrationNumber,
  create,
  update,
  remove,
};