const { query } = require('../config/database');

async function findByCitizen(citizenId) {
  const result = await query(
    `SELECT *
     FROM citizen_employment_history
     WHERE citizen_id = $1
     ORDER BY start_date DESC NULLS LAST, created_at DESC`,
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query(
    'SELECT * FROM citizen_employment_history WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function create(data) {
  const result = await query(
    `INSERT INTO citizen_employment_history (
       citizen_id,
       employer_name,
       employer_type,
       position_title,
       start_date,
       end_date,
       is_current,
       recorded_by,
       notes
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.citizenId || data.citizen_id,
      data.employerName || data.employer_name,
      data.employerType || data.employer_type || 'PRIVATE',
      data.positionTitle || data.position_title || null,
      data.startDate || data.start_date || data.employmentStartDate,
      data.endDate || data.end_date || data.employmentEndDate || null,
      data.isCurrent === true || data.is_current === true,
      data.recordedBy || data.recorded_by || null,
      data.notes || null,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const allowed = [
    'employer_name',
    'employer_type',
    'position_title',
    'start_date',
    'end_date',
    'is_current',
    'notes',
  ];
  const fields = [];
  const params = [];
  for (const key of Object.keys(data)) {
    if (!allowed.includes(key)) continue;
    params.push(data[key]);
    fields.push(`${key} = $${params.length}`);
  }
  if (fields.length === 0) return findById(id);
  params.push(id);
  const result = await query(
    `UPDATE citizen_employment_history
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING *`,
    params
  );
  return result.rows[0];
}

async function remove(id) {
  await query('DELETE FROM citizen_employment_history WHERE id = $1', [id]);
}

// Total years of GOVERNMENT service for a citizen.
// Counts overlapping jobs only once by taking the earliest start
// and the latest end across government employers.
async function totalGovernmentServiceYears(citizenId) {
  const result = await query(
    `SELECT
       MIN(start_date) AS first_start,
       MAX(COALESCE(end_date, CURRENT_DATE)) AS last_end
     FROM citizen_employment_history
     WHERE citizen_id = $1 AND employer_type = 'GOVERNMENT'`,
    [citizenId]
  );
  const row = result.rows[0];
  if (!row || !row.first_start || !row.last_end) return 0;
  const start = new Date(row.first_start);
  const end = new Date(row.last_end);
  if (end <= start) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
}

module.exports = {
  findByCitizen,
  findById,
  create,
  update,
  remove,
  totalGovernmentServiceYears,
};
