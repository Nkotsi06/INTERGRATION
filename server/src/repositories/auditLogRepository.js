const { query } = require('../config/database');

async function create(log) {
  const result = await query(
    `INSERT INTO audit_logs
       (user_id, username, action, record_type, record_id, result, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      log.userId || null,
      log.username || null,
      log.action,
      log.recordType || null,
      log.recordId || null,
      log.result || null,
      log.ipAddress || null,
      log.userAgent || null,
    ]
  );
  return result.rows[0];
}

function buildFilters({ user, action, from, to }) {
  const conditions = [];
  const params = [];

  if (user) {
    params.push(`%${user}%`);
    conditions.push(`username ILIKE $${params.length}`);
  }
  if (action) {
    params.push(`%${action}%`);
    conditions.push(`action ILIKE $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}::date`);
  }
  if (to) {
    params.push(to);
    conditions.push(`created_at <= ($${params.length}::date + INTERVAL '1 day')`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

async function findAll({ user, action, from, to, page = 1, pageSize = 20 } = {}) {
  const { whereClause, params } = buildFilters({ user, action, from, to });
  const offset = (page - 1) * pageSize;

  const countSql = `SELECT COUNT(*)::int AS total FROM audit_logs ${whereClause}`;
  const dataSql = `
    SELECT id, user_id, username, action, record_type, record_id,
           result, ip_address, user_agent, created_at
    FROM audit_logs
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const [countResult, dataResult] = await Promise.all([
    query(countSql, params),
    query(dataSql, [...params, pageSize, offset]),
  ]);

  return {
    rows: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    pageSize,
  };
}

async function findForExport({ user, action, from, to } = {}) {
  const { whereClause, params } = buildFilters({ user, action, from, to });
  const result = await query(
    `SELECT created_at, username, action, record_type, record_id, result
     FROM audit_logs
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT 10000`,
    params
  );
  return result.rows;
}

async function findRecent(limit = 5) {
  const result = await query(
    `SELECT id, username, action, created_at
     FROM audit_logs
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = { create, findAll, findForExport, findRecent };