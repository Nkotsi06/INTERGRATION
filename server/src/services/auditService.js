const auditLogRepository = require('../repositories/auditLogRepository');
const logger = require('../utils/logger');

async function log(entry) {
  try {
    return await auditLogRepository.create(entry);
  } catch (err) {
    logger.error('Failed to write audit log:', err);
  }
}

async function list(filters) {
  const result = await auditLogRepository.findAll(filters);
  return {
    rows: result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      username: r.username || '—',
      action: r.action,
      recordType: r.record_type,
      recordId: r.record_id,
      result: r.result,
      ipAddress: r.ip_address,
      userAgent: r.user_agent,
      createdAt: r.created_at,
    })),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

async function getRecent(limit) {
  return auditLogRepository.findRecent(limit);
}

// Builds the CSV from the repository's chunked fetch. Returns both
// the CSV text and whether the export was truncated, so callers that
// care can tell the user; callers that do not care can call the thin
// wrapper below.
async function exportCsvWithMeta(filters) {
  const { rows, truncated } = await auditLogRepository.findForExport(filters);

  const header = ['Timestamp', 'User', 'Action', 'Record Type', 'Record ID', 'Result'];
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [header.join(',')];
  rows.forEach((r) => {
    lines.push([
      escape(new Date(r.created_at).toISOString()),
      escape(r.username),
      escape(r.action),
      escape(r.record_type),
      escape(r.record_id),
      escape(r.result),
    ].join(','));
  });

  if (truncated) {
    lines.push('');
    lines.push([
      escape('NOTE'),
      escape(''),
      escape('This export was truncated at 500,000 rows.'),
      escape(''),
      escape(''),
      escape('Narrow the date range to obtain the complete set.'),
    ].join(','));
  }

  return { csv: lines.join('\n'), truncated };
}

// Backward-compatible: callers that only want the CSV text.
async function exportCsv(filters) {
  const { csv } = await exportCsvWithMeta(filters);
  return csv;
}

module.exports = { log, list, getRecent, exportCsv, exportCsvWithMeta };