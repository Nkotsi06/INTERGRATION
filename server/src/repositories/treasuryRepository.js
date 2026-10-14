const { query } = require('../config/database');

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM treasury_payments WHERE 1=1';
  const params = [];
  if (filters.status)   { params.push(filters.status);   sql += ` AND status = $${params.length}`; }
  if (filters.ministry) { params.push(filters.ministry); sql += ` AND paying_ministry = $${params.length}`; }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function getStats() {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING')::int  AS pending,
      COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS approved,
      COALESCE(SUM(amount) FILTER (WHERE status = 'APPROVED'), 0)::numeric AS total_paid
    FROM treasury_payments
  `);
  return result.rows[0];
}

module.exports = { findAll, getStats };