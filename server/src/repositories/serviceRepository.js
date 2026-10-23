const { query } = require('../config/database');

async function findPublic(ministry) {
  const params = [];
  const ministryFilter = ministry
    ? `AND s.ministry = $${params.push(ministry)}`
    : '';
  const result = await query(
    `SELECT s.*,
       COALESCE(fs.amount, s.fee) AS fee,
       COALESCE(fs.currency, s.currency) AS fee_currency,
       COALESCE(fs.is_active, TRUE) AS fee_active
     FROM services s
     LEFT JOIN fee_schedule fs
       ON fs.ministry = s.ministry AND fs.service_code = s.code
     WHERE s.is_enabled = TRUE ${ministryFilter}
     ORDER BY s.ministry, s.display_order, s.name`,
    params
  );
  return result.rows.map((row) => ({
    ...row,
    fee: Number(row.fee),
    fee_active: Boolean(row.fee_active),
  }));
}

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.ministry) {
    params.push(filters.ministry);
    conditions.push(`ministry = $${params.length}`);
  }
  if (filters.service_type) {
    params.push(filters.service_type);
    conditions.push(`service_type = $${params.length}`);
  }
  if (filters.is_enabled !== undefined) {
    params.push(filters.is_enabled);
    conditions.push(`is_enabled = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `SELECT * FROM services ${where} ORDER BY ministry, display_order, name`,
    params
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM services WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByCode(ministry, code) {
  const result = await query(
    'SELECT * FROM services WHERE ministry = $1 AND code = $2',
    [ministry, code]
  );
  return result.rows[0];
}

async function create(data) {
  const result = await query(
    `INSERT INTO services (
       ministry, code, name, description, service_type,
       is_enabled, form_fields, required_documents,
       fee, currency, display_order, unavailable_message
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      data.ministry,
      data.code,
      data.name,
      data.description || null,
      data.service_type || 'APPLICATION',
      data.is_enabled !== false,
      JSON.stringify(data.form_fields || []),
      JSON.stringify(data.required_documents || []),
      data.fee || 0,
      data.currency || 'LSL',
      data.display_order || 0,
      data.unavailable_message || null,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const allowed = [
    'name', 'description', 'service_type', 'is_enabled',
    'form_fields', 'required_documents', 'fee', 'currency',
    'display_order', 'unavailable_message',
  ];
  const fields = [];
  const params = [];

  Object.keys(data).forEach((key) => {
    if (!allowed.includes(key)) return;
    let value = data[key];
    if (key === 'form_fields' || key === 'required_documents') {
      value = JSON.stringify(value);
    }
    params.push(value);
    fields.push(`${key} = $${params.length}`);
  });

  if (fields.length === 0) return findById(id);

  params.push(id);
  const result = await query(
    `UPDATE services SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function remove(id) {
  await query('DELETE FROM services WHERE id = $1', [id]);
}

module.exports = { findAll, findPublic, findById, findByCode, create, update, remove };