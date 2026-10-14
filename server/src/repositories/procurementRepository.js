const { query } = require('../config/database');

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM procurement_records WHERE 1=1';
  const params = [];
  if (filters.status)   { params.push(filters.status);   sql += ` AND status = $${params.length}`; }
  if (filters.ministry) { params.push(filters.ministry); sql += ` AND ministry_code = $${params.length}`; }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function getStats() {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'OPEN')::int    AS open_tenders,
      COUNT(*) FILTER (WHERE status = 'AWARDED')::int AS awarded_tenders,
      COALESCE(SUM(awarded_value) FILTER (WHERE status = 'AWARDED'), 0)::numeric AS total_awarded
    FROM procurement_records
  `);
  return result.rows[0];
}

module.exports = { findAll, getStats };