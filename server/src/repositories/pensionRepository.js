const { query } = require('../config/database');

async function getEligibilityFacts(citizenId, executor = query, ignorePendingApplicationId = null) {
  const result = await executor(
    `SELECT
       ge.id AS government_employee_id,
       ge.employee_number,
       ge.status AS employment_status,
       ge.start_date AS employment_start_date,
       ge.end_date AS employment_end_date,
       COALESCE(debt.outstanding_count, 0)::int AS outstanding_debt_count,
       COALESCE(debt.outstanding_amount, 0)::numeric(12,2) AS outstanding_debt_amount,
       pension.payment_status AS pension_status,
       EXISTS (
         SELECT 1
         FROM applications application
         WHERE application.citizen_id = c.id
           AND application.service = 'PENSIONS'
           AND application.data->>'serviceCode' = 'PENSION_APPLICATION'
           AND application.status NOT IN ('REJECTED', 'COMPLETED', 'COLLECTED')
           AND ($2::uuid IS NULL OR application.id <> $2::uuid)
       ) AS has_pending_application
     FROM citizens c
     LEFT JOIN government_employees ge ON ge.national_id = c.national_id
     LEFT JOIN pension_records pension ON pension.citizen_id = c.id
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS outstanding_count, SUM(amount) AS outstanding_amount
       FROM government_debts
       WHERE national_id = c.national_id AND status = 'OUTSTANDING'
     ) debt ON TRUE
     WHERE c.id = $1`,
    [citizenId, ignorePendingApplicationId]
  );
  return result.rows[0] || null;
}

async function findByCitizen(citizenId, executor = query) {
  const result = await executor(
    'SELECT * FROM pension_records WHERE citizen_id = $1 LIMIT 1',
    [citizenId]
  );
  return result.rows[0];
}

async function create(record, executor = query) {
  const result = await executor(
    `INSERT INTO pension_records (citizen_id, pension_type, pension_number, monthly_amount, next_payment_date, payment_status)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE') RETURNING *`,
    [
      record.citizenId, record.pensionType, record.pensionNumber,
      record.monthlyAmount, record.nextPaymentDate,
    ]
  );
  return result.rows[0];
}

async function getStats() {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE payment_status = 'ACTIVE') AS active_pensioners,
      COUNT(*) AS total
    FROM pension_records
  `);
  return result.rows[0];
}

// NEW — one rule by pension type.
async function findRules(pensionType) {
  const result = await query(
    'SELECT * FROM pension_rules WHERE pension_type = $1',
    [pensionType]
  );
  return result.rows[0];
}

// NEW — every active rule. Used by the staff dashboard and by the
// eligibility assessor when it needs to try each category.
async function findRulesForCategory(executor = query) {
  const result = await executor(
    'SELECT * FROM pension_rules WHERE is_active = TRUE ORDER BY minimum_age ASC'
  );
  return result.rows;
}

async function findApplications(filters = {}) {
  const conditions = [
    "application.service = 'PENSIONS'",
    "application.data->>'serviceCode' = 'PENSION_APPLICATION'",
  ];
  const params = [];
  if (filters.status) {
    params.push(String(filters.status).toUpperCase());
    conditions.push(`application.status = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`application.submitted_at >= $${params.length}::date`);
  }
  if (filters.to) {
    params.push(filters.to);
    conditions.push(`application.submitted_at < ($${params.length}::date + INTERVAL '1 day')`);
  }
  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    conditions.push(
      `(application.reference_number ILIKE $${params.length}
        OR citizen.first_name ILIKE $${params.length}
        OR citizen.last_name ILIKE $${params.length}
        OR citizen.national_id ILIKE $${params.length})`
    );
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(filters.pageSize, 10) || 25));
  const offset = (page - 1) * pageSize;
  const [count, rows] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total
       FROM applications application
       JOIN citizens citizen ON citizen.id = application.citizen_id
       ${where}`,
      params
    ),
    query(
      `SELECT application.id, application.reference_number, application.status,
        application.data, application.submitted_at, application.updated_at,
        citizen.id AS citizen_id, citizen.first_name, citizen.last_name,
        citizen.national_id
       FROM applications application
       JOIN citizens citizen ON citizen.id = application.citizen_id
       ${where}
       ORDER BY application.submitted_at ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    ),
  ]);
  return { rows: rows.rows, total: count.rows[0].total, page, pageSize };
}

module.exports = {
  getEligibilityFacts,
  findByCitizen,
  create,
  getStats,
  findRules,
  findRulesForCategory,
  findApplications,
};