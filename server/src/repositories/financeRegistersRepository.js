const crypto = require('crypto');
const { query } = require('../config/database');

function pagination(filters) {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const pageSize = Math.min(200, Math.max(1, Number.parseInt(filters.pageSize, 10) || 50));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function addFilter(conditions, params, value, sql) {
  if (!value) return;
  params.push(value);
  conditions.push(sql.replace('?', `$${params.length}`));
}

async function listEmployers(activeOnly = false) {
  const result = await query(
    `SELECT id, code, name, is_active AS "isActive"
     FROM government_employers
     ${activeOnly ? 'WHERE is_active = TRUE' : ''}
     ORDER BY name`
  );
  return result.rows;
}

async function syncHomeAffairsEmployers() {
  const [homeAffairsEmployers, existingEmployers] = await Promise.all([
    query(
      `SELECT DISTINCT ON (LOWER(BTRIM(employer_name)))
         BTRIM(employer_name) AS name
       FROM citizen_employment_history
       WHERE UPPER(BTRIM(employer_type)) = 'GOVERNMENT'
         AND NULLIF(BTRIM(employer_name), '') IS NOT NULL
       ORDER BY LOWER(BTRIM(employer_name)), BTRIM(employer_name)`
    ),
    query('SELECT LOWER(BTRIM(name)) AS normalized_name FROM government_employers'),
  ]);
  const knownNames = new Set(existingEmployers.rows.map((row) => row.normalized_name));
  const synced = [];

  for (const { name } of homeAffairsEmployers.rows) {
    const normalizedName = name.toLocaleLowerCase('en');
    if (knownNames.has(normalizedName)) continue;

    const code = `HA_${crypto.createHash('sha256').update(normalizedName).digest('hex').slice(0, 32)}`;
    const result = await query(
      `INSERT INTO government_employers (code, name)
       VALUES ($1, $2)
       ON CONFLICT (code) DO UPDATE
         SET name = EXCLUDED.name, updated_at = NOW()
         WHERE government_employers.name IS DISTINCT FROM EXCLUDED.name
       RETURNING id, code, name, is_active AS "isActive"`,
      [code, name]
    );
    if (result.rows[0]) synced.push(result.rows[0]);
    knownNames.add(normalizedName);
  }

  return synced;
}

async function saveEmployer(data, id) {
  if (id) {
    const result = await query(
      `UPDATE government_employers
       SET code = $1, name = $2, is_active = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, code, name, is_active AS "isActive"`,
      [data.code, data.name, data.isActive, id]
    );
    return result.rows[0];
  }
  const result = await query(
    `INSERT INTO government_employers (code, name, is_active)
     VALUES ($1, $2, $3)
     RETURNING id, code, name, is_active AS "isActive"`,
    [data.code, data.name, data.isActive]
  );
  return result.rows[0];
}

async function listEmployees(filters = {}) {
  const conditions = [];
  const params = [];
  addFilter(conditions, params, filters.status?.toUpperCase(), 'e.status = ?');
  addFilter(conditions, params, filters.employerId, 'e.employer_id = ?');
  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    conditions.push(`(e.national_id ILIKE $${params.length}
      OR e.employee_number ILIKE $${params.length}
      OR em.name ILIKE $${params.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { page, pageSize, offset } = pagination(filters);
  const [count, rows] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total
       FROM government_employees e
       JOIN government_employers em ON em.id = e.employer_id ${where}`,
      params
    ),
    query(
      `SELECT e.id, e.national_id AS "nationalId",
        e.employer_id AS "employerId", em.name AS "employerName",
        e.employee_number AS "employeeNumber", e.start_date AS "startDate",
        e.status, e.end_date AS "endDate"
       FROM government_employees e
       JOIN government_employers em ON em.id = e.employer_id
       ${where}
       ORDER BY e.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    ),
  ]);
  return { rows: rows.rows, total: count.rows[0].total, page, pageSize };
}

async function saveEmployee(data, actorId, id) {
  if (id) {
    const result = await query(
      `UPDATE government_employees
       SET national_id = $1, employer_id = $2, employee_number = $3,
         start_date = $4, status = $5, end_date = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, national_id AS "nationalId", employer_id AS "employerId",
         employee_number AS "employeeNumber", start_date AS "startDate",
         status, end_date AS "endDate"`,
      [data.nationalId, data.employerId, data.employeeNumber, data.startDate, data.status, data.endDate, id]
    );
    return result.rows[0];
  }
  const result = await query(
    `INSERT INTO government_employees
      (national_id, employer_id, employee_number, start_date, status, end_date, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, national_id AS "nationalId", employer_id AS "employerId",
       employee_number AS "employeeNumber", start_date AS "startDate",
       status, end_date AS "endDate"`,
    [data.nationalId, data.employerId, data.employeeNumber, data.startDate, data.status, data.endDate, actorId]
  );
  return result.rows[0];
}

async function listGovernmentDebts(filters = {}) {
  const conditions = [];
  const params = [];
  addFilter(conditions, params, filters.status?.toUpperCase(), 'd.status = ?');
  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    conditions.push(`(d.national_id ILIKE $${params.length} OR d.debt_type ILIKE $${params.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { page, pageSize, offset } = pagination(filters);
  const [count, rows] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total FROM government_debts d ${where}`, params),
    query(
      `SELECT d.id, d.national_id AS "nationalId", d.debt_type AS "debtType",
        d.amount, d.status, d.recorded_by AS "recordedBy",
        d.date_cleared AS "dateCleared", d.created_at AS "createdAt"
       FROM government_debts d ${where}
       ORDER BY d.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    ),
  ]);
  return { rows: rows.rows, total: count.rows[0].total, page, pageSize };
}

async function createGovernmentDebt(data, actorId) {
  const result = await query(
    `INSERT INTO government_debts (national_id, debt_type, amount, recorded_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, national_id AS "nationalId", debt_type AS "debtType",
       amount, status, recorded_by AS "recordedBy", date_cleared AS "dateCleared",
       created_at AS "createdAt"`,
    [data.nationalId, data.debtType, data.amount, actorId]
  );
  return result.rows[0];
}

async function clearGovernmentDebt(id) {
  const result = await query(
    `UPDATE government_debts SET status = 'CLEARED', date_cleared = NOW()
     WHERE id = $1 AND status = 'OUTSTANDING'
     RETURNING id, national_id AS "nationalId", debt_type AS "debtType",
       amount, status, recorded_by AS "recordedBy", date_cleared AS "dateCleared",
       created_at AS "createdAt"`,
    [id]
  );
  return result.rows[0];
}

async function getOutstandingDebtTotal() {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0)::numeric(14,2) AS total
     FROM government_debts WHERE status = 'OUTSTANDING'`
  );
  return result.rows[0].total;
}

async function findCitizenByNationalId(nationalId) {
  const result = await query(
    'SELECT id FROM citizens WHERE national_id = $1',
    [nationalId]
  );
  return result.rows[0];
}

module.exports = {
  listEmployers,
  syncHomeAffairsEmployers,
  saveEmployer,
  listEmployees,
  saveEmployee,
  listGovernmentDebts,
  createGovernmentDebt,
  clearGovernmentDebt,
  getOutstandingDebtTotal,
  findCitizenByNationalId,
};
