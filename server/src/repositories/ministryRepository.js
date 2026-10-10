const { query } = require('../config/database');

async function findAll() {
  const result = await query(
    'SELECT * FROM ministries WHERE is_active = true ORDER BY display_order'
  );
  return result.rows;
}

async function findByCode(code) {
  const result = await query('SELECT * FROM ministries WHERE code = $1', [code]);
  return result.rows[0];
}

module.exports = { findAll, findByCode };