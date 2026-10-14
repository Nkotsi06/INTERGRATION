const { query } = require('../config/database');

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM budget_allocations WHERE 1=1';
  const params = [];
  if (filters.fiscalYear) { params.push(filters.fiscalYear); sql += ` AND fiscal_year = $${params.length}`; }
  sql += ' ORDER BY fiscal_year DESC, ministry_code';
  const result = await query(sql, params);
  return result.rows;
}

async function getStats(fiscalYear) {
  const result = await query(`
    SELECT      COALESCE(SUM(total_budget), 0)::numeric AS total_budget,
      COALESCE(SUM(expenditure_to_date), 0)::numeric AS total_spent,
      COALESCE(SUM(total_budget - expenditure_to_date), 0)::numeric AS remaining
    FROM budget_allocations
    WHERE fiscal_year = $1
  `, [fiscalYear]);
  return result.rows[0];
}

module.exports = { findAll, getStats };