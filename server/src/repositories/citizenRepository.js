const { query } = require('../config/database');

async function findByNationalId(nationalId) {
  const result = await query('SELECT * FROM citizens WHERE national_id = $1', [nationalId]);
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM citizens WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByAny(searchTerm) {
  const pattern = `%${searchTerm}%`;
  const result = await query(
    `SELECT c.*, u.username
     FROM citizens c
     LEFT JOIN users u ON u.citizen_id = c.id
     WHERE c.national_id = $1
        OR c.national_id ILIKE $2
        OR (c.first_name || ' ' || c.last_name) ILIKE $2
        OR u.username ILIKE $2
     LIMIT 1`,
    [searchTerm, pattern]
  );
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM citizens WHERE 1=1';
  const params = [];
  if (filters.isVerified !== undefined) {
    params.push(filters.isVerified);
    sql += ` AND is_verified = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function findRegistrations(filters = {}) {
  let sql = `
    SELECT
      u.id,
      u.username,
      u.created_at AS date_registered,
      c.id AS citizen_id,
      c.national_id,
      (c.first_name || ' ' || c.last_name) AS full_name,
      CASE
        WHEN c.is_verified = true THEN 'VERIFIED'
        WHEN c.national_id IS NOT NULL THEN 'CAPTURED'
        ELSE 'AWAITING'
      END AS status
    FROM users u
    LEFT JOIN citizens c ON c.id = u.citizen_id
    WHERE u.role = 'CITIZEN'
  `;
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND (
      CASE
        WHEN c.is_verified = true THEN 'VERIFIED'
        WHEN c.national_id IS NOT NULL THEN 'CAPTURED'
        ELSE 'AWAITING'
      END
    ) = $${params.length}`;
  }
  sql += ' ORDER BY u.created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function findRegistrationById(id) {
  const result = await query(
    `SELECT
       u.id,
       u.username,
       u.created_at AS date_registered,
       u.citizen_id
     FROM users u
     WHERE u.id = $1 AND u.role = 'CITIZEN'`,
    [id]
  );
  return result.rows[0];
}

async function create(citizen) {
  const result = await query(
    `INSERT INTO citizens (national_id, first_name, last_name, date_of_birth, gender,
      place_of_birth, address, phone, email, nationality, is_verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      citizen.nationalId,
      citizen.firstName,
      citizen.lastName,
      citizen.dateOfBirth,
      citizen.gender,
      citizen.placeOfBirth,
      citizen.address,
      citizen.phone,
      citizen.email,
      citizen.nationality || 'Mosotho',
      citizen.isVerified || false,
    ]
  );
  return result.rows[0];
}

async function createFromRegistration(reg) {
  return create({
    nationalId: reg.nationalId,
    firstName: reg.firstName,
    lastName: reg.lastName,
    dateOfBirth: reg.dateOfBirth,
    gender: reg.gender,
    placeOfBirth: reg.placeOfBirth,
    address: reg.address,
    phone: reg.phone,
    email: reg.email,
    nationality: reg.nationality || 'Mosotho',
    isVerified: false,
  });
}

const UPDATEABLE_FIELDS = ['first_name', 'last_name', 'address', 'phone', 'email', 'place_of_birth', 'nationality'];

async function update(id, data) {
  const fields = [];
  const params = [];
  Object.keys(data).forEach((key) => {
    if (UPDATEABLE_FIELDS.includes(key)) {
      params.push(data[key]);
      fields.push(`${key} = $${params.length}`);
    }
  });
  if (fields.length === 0) return findById(id);
  params.push(id);
  const result = await query(
    `UPDATE citizens SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function updateWithHistory(id, data, changedBy) {
  const before = await findById(id);
  if (!before) throw new Error('Citizen not found');

  const fields = [];
  const params = [];
  const changes = [];

  Object.keys(data).forEach((key) => {
    if (UPDATEABLE_FIELDS.includes(key) && data[key] !== before[key]) {
      changes.push({ field: key, from: before[key], to: data[key] });
      params.push(data[key]);
      fields.push(`${key} = $${params.length}`);
    }
  });

  if (fields.length === 0) return before;

  params.push(id);
  const result = await query(
    `UPDATE citizens SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );

  for (const change of changes) {
    await query(
      `INSERT INTO citizen_edit_history
        (citizen_id, field, old_value, new_value, changed_by)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, change.field, change.from, change.to, changedBy]
    );
  }

  return result.rows[0];
}

async function markVerified(id, { verifiedBy, notes }) {
  const result = await query(
    `UPDATE citizens
     SET is_verified = true, verified_at = NOW(), updated_at = NOW(),
         verified_by = $2, verification_notes = $3
     WHERE id = $1 RETURNING *`,
    [id, verifiedBy, notes || null]
  );
  return result.rows[0];
}

async function getStats() {
  const result = await query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE is_verified = true) AS verified,
      COUNT(*) FILTER (WHERE is_verified = false AND national_id IS NOT NULL) AS captured,
      COUNT(*) FILTER (WHERE national_id IS NULL) AS awaiting
    FROM citizens
  `);
  return result.rows[0];
}

async function getDashboardStats() {
  const result = await query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'CITIZEN' AND citizen_id IS NULL) AS awaiting,
      (SELECT COUNT(*) FROM citizens WHERE is_verified = false AND national_id IS NOT NULL) AS captured,
      (SELECT COUNT(*) FROM citizens WHERE is_verified = true) AS verified,
      (SELECT COUNT(*) FROM audit_logs
        WHERE action IN ('CITIZEN_RECORD_COMPLETED','CITIZEN_VERIFIED','CITIZEN_UPDATED')
          AND created_at::date = CURRENT_DATE) AS updated_today
  `);
  const row = result.rows[0];
  return {
    awaiting: parseInt(row.awaiting, 10),
    captured: parseInt(row.captured, 10),
    verified: parseInt(row.verified, 10),
    updatedToday: parseInt(row.updated_today, 10),
  };
}

async function getReports({ type, fromDate, toDate }) {
  // ROOT CAUSE FIX: If dates are blank, fallback to a very wide range (1970 to 2100)
  const start = fromDate || '1970-01-01';
  const end = toDate || '2100-12-31';

  const result = await query(`
    SELECT
      (SELECT COUNT(*) FROM citizens
        WHERE created_at::date >= $1::date
          AND created_at::date <= $2::date) AS citizens_registered,
      (SELECT COUNT(*) FROM citizens
        WHERE is_verified = true
          AND verified_at::date >= $1::date
          AND verified_at::date <= $2::date) AS citizens_verified,
      (SELECT COUNT(*) FROM citizens
        WHERE is_verified = false AND national_id IS NOT NULL) AS pending
  `, [start, end]);

  const row = result.rows[0];
  return {
    type: type || 'verification-summary',
    citizensRegistered: parseInt(row.citizens_registered, 10),
    citizensVerified: parseInt(row.citizens_verified, 10),
    pending: parseInt(row.pending, 10),
  };
}

module.exports = {
  findByNationalId,
  findById,
  findByAny,
  findAll,
  findRegistrations,
  findRegistrationById,
  create,
  createFromRegistration,
  update,
  updateWithHistory,
  markVerified,
  getStats,
  getDashboardStats,
  getReports,
};