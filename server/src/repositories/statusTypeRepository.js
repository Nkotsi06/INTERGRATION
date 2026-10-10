const { query } = require('../config/database');

async function findAll() {
  const result = await query(
    'SELECT * FROM status_types WHERE is_active = true ORDER BY display_order'
  );
  return result.rows;
}

module.exports = { findAll };