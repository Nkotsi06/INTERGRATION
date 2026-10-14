const { query } = require('../config/database');

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM debt_records WHERE 1=1';
  const params = [];
  if (filters.type)   { params.push(filters.type);   sql += ` AND record_type = $${params.length}`; }
  if (filters.status) { params.push(filters.status); sql += ` AND status = $${params.length}`; }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function getStats() {
  const result = await query(`
    SELECT
      COALESCE(SUM(principal_amount)   FILTER (WHERE record_type = 'LOAN'),  0)::numeric AS total_loans,
      COALESCE(SUM(outstanding_amount) FILTER (WHERE record_type = 'LOAN'),  0)::numeric AS outstanding_loans,
      COALESCE(SUM(principal_amount)   FILTER (WHERE record_type = 'AID'),   0)::numeric AS total_aid,
      COALESCE(SUM(principal_amount)   FILTER (WHERE record_type = 'GRANT'), 0)::numeric AS total_grants
    FROM debt_records
  `);
  return result.rows[0];
}

module.exports = { findAll, getStats };