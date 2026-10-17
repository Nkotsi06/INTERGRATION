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

// Group D — guarded delete.
// Calls the stored function delete_vehicle(), which locks the row,
// checks for pending licences and inspections, writes an audit
// entry, and deletes in one transaction. On any error, throws
// an Error whose .statusCode is set so the controller can map to
// a 409 (business rule) or 404 (not found).
async function removeWithGuard(id, actorId) {
  try {
    const result = await query(
      'SELECT delete_vehicle($1::uuid, $2::uuid) AS deleted_id',
      [id, actorId]
    );
    return result.rows[0].deleted_id;
  } catch (err) {
    // Map Postgres SQLSTATE codes to HTTP-level signals the
    // service and controller understand.
    if (err.code === 'P0002') {
      const e = new Error('Vehicle not found.');
      e.statusCode = 404;
      throw e;
    }
    if (err.code === '23514') {
      // check_violation — our guarded function raises this for
      // business rules (pending licences/inspections).
      const e = new Error(err.message);
      e.statusCode = 409;
      throw e;
    }
    throw err;
  }
}

// Kept for backward compatibility. Nothing in the app should call
// this directly any more; use removeWithGuard instead.
async function remove(id) {
  await query('DELETE FROM vehicles WHERE id = $1', [id]);
}

module.exports = {
  findByCitizen,
  findById,
  findByRegistrationNumber,
  create,
  update,
  removeWithGuard,
  remove,
};