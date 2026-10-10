const { query } = require('../config/database');

// -------------------------------------------------------------
// Read — single
// -------------------------------------------------------------
async function findByUsername(username) {
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// -------------------------------------------------------------
// Read — paginated, filtered list
// -------------------------------------------------------------
async function findAll({ username, role, status, page = 1, pageSize = 10 } = {}) {
  const conditions = [];
  const params = [];

  if (username) {
    params.push(`%${username}%`);
    conditions.push(`username ILIKE $${params.length}`);
  }
  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const offset = (page - 1) * pageSize;

  const countSql = `SELECT COUNT(*)::int AS total FROM users ${whereClause}`;
  const dataSql = `
    SELECT
      id, username, full_name, email, role, ministry, status, citizen_id,
      created_at, updated_at
    FROM users
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

// -------------------------------------------------------------
// Create
// -------------------------------------------------------------
async function create(user) {
  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, role, ministry, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      user.username,
      user.email,
      user.passwordHash,
      user.fullName,
      user.role,
      user.ministry || null,
      user.status || 'ACTIVE',
    ]
  );
  return result.rows[0];
}

// -------------------------------------------------------------
// Update
// -------------------------------------------------------------
async function update(id, data) {
  const allowed = ['full_name', 'email', 'role', 'ministry', 'status'];
  const fields = [];
  const params = [];

  Object.keys(data).forEach((key) => {
    if (allowed.includes(key)) {
      params.push(data[key]);
      fields.push(`${key} = $${params.length}`);
    }
  });

  if (fields.length === 0) return findById(id);

  params.push(id);
  const result = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function updatePassword(id, passwordHash) {
  const result = await query(
    `UPDATE users SET password_hash = $1, updated_at = NOW()
     WHERE id = $2 RETURNING id, username`,
    [passwordHash, id]
  );
  return result.rows[0];
}

// -------------------------------------------------------------
// Status changes
// -------------------------------------------------------------
async function setStatus(id, status) {
  const result = await query(
    `UPDATE users SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

// -------------------------------------------------------------
// Delete
// -------------------------------------------------------------
async function remove(id) {
  await query('DELETE FROM users WHERE id = $1', [id]);
}

// -------------------------------------------------------------
// Counts for the guard rules
// -------------------------------------------------------------
async function countActiveAdminsExcluding(id) {
  const result = await query(
    `SELECT COUNT(*)::int AS total FROM users
     WHERE role = 'ADMIN' AND status = 'ACTIVE' AND id <> $1`,
    [id]
  );
  return result.rows[0].total;
}

// -------------------------------------------------------------
// Citizen link
// -------------------------------------------------------------
async function linkCitizen(userId, citizenId) {
  const result = await query(
    `UPDATE users SET citizen_id = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [citizenId, userId]
  );
  return result.rows[0];
}

module.exports = {
  findByUsername,
  findByEmail,
  findById,
  findAll,
  create,
  update,
  updatePassword,
  setStatus,
  remove,
  countActiveAdminsExcluding,
  linkCitizen,
};