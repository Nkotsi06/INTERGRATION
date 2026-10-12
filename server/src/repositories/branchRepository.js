const { query } = require('../config/database');

async function findAll(filters = {}) {
  let sql = `SELECT * FROM branches WHERE 1=1`;
  const params = [];
  if (filters.ministryCode) {
    params.push(filters.ministryCode);
    sql += ` AND ministry_code = $${params.length}`;
  }
  if (filters.district) {
    params.push(filters.district);
    sql += ` AND district = $${params.length}`;
  }
  if (filters.activeOnly) {
    sql += ` AND is_active = true`;
  }
  sql += ' ORDER BY ministry_code, display_order, name';
  const result = await query(sql, params);
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM branches WHERE id = $1', [id]);
  return result.rows[0];
}

async function create(data) {
  const result = await query(
    `INSERT INTO branches
      (ministry_code, name, district, address, phone, email, opening_hours, is_active, display_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      data.ministryCode,
      data.name,
      data.district,
      data.address || null,
      data.phone || null,
      data.email || null,
      data.openingHours || null,
      data.isActive !== false,
      data.displayOrder || 0,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const allowed = ['ministry_code', 'name', 'district', 'address', 'phone',
                   'email', 'opening_hours', 'is_active', 'display_order'];
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
    `UPDATE branches SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function remove(id) {
  await query('DELETE FROM branches WHERE id = $1', [id]);
}

module.exports = { findAll, findById, create, update, remove };