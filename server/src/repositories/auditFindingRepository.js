const { query } = require('../config/database');

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM audit_findings WHERE 1=1';
  const params = [];
  if (filters.status)   { params.push(filters.status);   sql += ` AND status = $${params.length}`; }
  if (filters.severity) { params.push(filters.severity); sql += ` AND severity = $${params.length}`; }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function getStats() {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'OPEN')::int        AS open_findings,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::int AS in_progress,
      COUNT(*) FILTER (WHERE status = 'RESOLVED')::int    AS resolved,
      COUNT(*) FILTER (WHERE severity IN ('HIGH','CRITICAL'))::int AS high_severity
    FROM audit_findings
  `);
  return result.rows[0];
}

module.exports = { findAll, getStats };