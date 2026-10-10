const { query } = require('../config/database');

async function getByName(name) {
  const result = await query('SELECT * FROM reference_formats WHERE name = $1', [name]);
  return result.rows[0];
}

async function getAll() {
  const result = await query('SELECT * FROM reference_formats ORDER BY name');
  return result.rows;
}

async function update(id, data) {
  const result = await query(
    'UPDATE reference_formats SET prefix = $1, year_format = $2, sequence_length = $3 WHERE id = $4 RETURNING *',
    [data.prefix, data.year_format, data.sequence_length, id]
  );
  return result.rows[0];
}

module.exports = { getByName, getAll, update };