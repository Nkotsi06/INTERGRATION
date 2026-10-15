const { query } = require('../config/database');

async function create(payment) {
  const result = await query(
    `INSERT INTO payments (
        citizen_id, ministry, service, application_reference,
        amount, currency, method, status, receipt_number,
        reference_number, received_by, notes
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      payment.citizenId || null,
      payment.ministry,
      payment.service || null,
      payment.applicationReference || null,
      payment.amount,
      payment.currency || 'LSL',
      payment.method,
      payment.status || 'COMPLETED',
      payment.receiptNumber,
      payment.referenceNumber || null,
      payment.receivedBy || null,
      payment.notes || null,
    ]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM payments WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM payments WHERE citizen_id = $1 ORDER BY paid_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.ministry) {
    params.push(filters.ministry);
    conditions.push(`ministry = $${params.length}`);
  }
  if (filters.service) {
    params.push(`%${filters.service}%`);
    conditions.push(`service ILIKE $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`paid_at >= $${params.length}::date`);
  }
  if (filters.to) {
    params.push(filters.to);
    conditions.push(`paid_at <= ($${params.length}::date + INTERVAL '1 day')`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(
      `(receipt_number ILIKE $${params.length} OR reference_number ILIKE $${params.length} OR application_reference ILIKE $${params.length})`
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = Math.max(1, parseInt(filters.page || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(filters.pageSize || '50', 10)));
  const offset = (page - 1) * pageSize;

  const countSql = `SELECT COUNT(*)::int AS total FROM payments ${whereClause}`;
  const dataSql = `
    SELECT p.*, c.first_name, c.last_name, c.national_id
    FROM payments p
    LEFT JOIN citizens c ON c.id = p.citizen_id
    ${whereClause}
    ORDER BY p.paid_at DESC
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

async function getMinistrySummary() {
  const result = await query('SELECT * FROM finance_payment_summary ORDER BY ministry');
  return result.rows;
}

async function getTotals() {
  const result = await query(`
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE paid_at::date = CURRENT_DATE), 0)::numeric(14,2) AS today,
      COALESCE(SUM(amount) FILTER (WHERE date_trunc('month', paid_at) = date_trunc('month', CURRENT_DATE)), 0)::numeric(14,2) AS this_month,
      COALESCE(SUM(amount), 0)::numeric(14,2) AS all_time
    FROM payments
    WHERE status = 'COMPLETED'
  `);
  return result.rows[0];
}

module.exports = {
  create,
  findById,
  findByCitizen,
  findAll,
  getMinistrySummary,
  getTotals,
};