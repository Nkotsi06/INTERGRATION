const { query } = require('../config/database');

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.ministry) {
    params.push(filters.ministry);
    conditions.push(`ministry = $${params.length}`);
  }
  if (filters.is_active !== undefined) {
    params.push(filters.is_active);
    conditions.push(`is_active = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `SELECT * FROM fee_schedule ${where} ORDER BY ministry, service_name`,
    params
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM fee_schedule WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByCode(ministry, serviceCode) {
  const result = await query(
    'SELECT * FROM fee_schedule WHERE ministry = $1 AND service_code = $2',
    [ministry, serviceCode]
  );
  return result.rows[0];
}

async function serviceExists(ministry, serviceCode) {
  const result = await query(
    `SELECT EXISTS (
       SELECT 1 FROM services WHERE ministry = $1 AND code = $2
     ) AS service_exists`,
    [ministry, serviceCode]
  );
  return result.rows[0].service_exists;
}

async function upsert(data) {
  const result = await query(
    `INSERT INTO fee_schedule (ministry, service_code, service_name, amount, currency, is_active, notes, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (ministry, service_code) DO UPDATE SET
       service_name = EXCLUDED.service_name,
       amount = EXCLUDED.amount,
       currency = EXCLUDED.currency,
       is_active = EXCLUDED.is_active,
       notes = EXCLUDED.notes,
       updated_at = NOW()
     RETURNING *`,
    [
      data.ministry,
      data.service_code,
      data.service_name,
      data.amount,
      data.currency || 'LSL',
      data.is_active !== false,
      data.notes || null,
    ]
  );
  return result.rows[0];
}

async function create(data) {
  const result = await query(
    `INSERT INTO fee_schedule (ministry, service_code, service_name, amount, currency, is_active, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.ministry,
      data.service_code,
      data.service_name,
      data.amount,
      data.currency || 'LSL',
      data.is_active !== false,
      data.notes || null,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const allowed = ['service_name', 'amount', 'currency', 'is_active', 'notes'];
  const fields = [];
  const params = [];

  Object.keys(data).forEach((key) => {
    if (!allowed.includes(key)) return;
    params.push(data[key]);
    fields.push(`${key} = $${params.length}`);
  });

  if (fields.length === 0) return findById(id);

  params.push(id);
  const result = await query(
    `UPDATE fee_schedule SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

module.exports = { findAll, findById, findByCode, serviceExists, create, upsert, update };