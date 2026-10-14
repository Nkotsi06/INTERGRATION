const { query } = require('../config/database');

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM tax_policy_notes WHERE 1=1';
  const params = [];
  if (filters.activeOnly) sql += ' AND is_active = TRUE';
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

module.exports = { findAll };