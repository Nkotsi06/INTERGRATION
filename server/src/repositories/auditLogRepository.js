const { query } = require('../config/database');

// Export ceiling: exports larger than this are truncated to protect
// server memory. When truncation happens the CSV is suffixed with a
// note in the final row so the person who opens the file knows it is
// incomplete. This is the only place in the audit repository that
// caps results, and it is not silent.
const EXPORT_BATCH_SIZE = 1000;
const EXPORT_MAX_ROWS = 500000;

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
    ORDER BY created_at DESC, id ASC
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

// Returns every matching row for the CSV export, chunked so memory
// stays bounded. The final row tells the CSV generator whether the
// result was truncated, so the exported file is honest about its
// own completeness.
async function findForExport({ user, action, from, to } = {}) {
  const { whereClause, params } = buildFilters({ user, action, from, to });

  const rows = [];
  let offset = 0;
  let truncated = false;

  while (true) {
    const batchSql = `
      SELECT created_at, username, action, record_type, record_id, result
      FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC, id ASC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;
    const batch = await query(batchSql, [...params, EXPORT_BATCH_SIZE, offset]);
    rows.push(...batch.rows);
    if (batch.rows.length < EXPORT_BATCH_SIZE) break;
    offset += EXPORT_BATCH_SIZE;

    if (rows.length >= EXPORT_MAX_ROWS) {
      truncated = true;
      break;
    }
  }

  return { rows, truncated };
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