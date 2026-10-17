const { query } = require('../config/database');

async function create(n) {
  const result = await query(
    `INSERT INTO notifications (user_id, title, message, is_read)
     VALUES ($1, $2, $3, false) RETURNING *`,
    [n.userId, n.title, n.message]
  );
  return result.rows[0];
}

async function findByUser(userId) {
  const result = await query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM notifications WHERE id = $1', [id]);
  return result.rows[0];
}

async function markRead(id) {
  await query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
}

async function markAllRead(userId) {
  await query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
    [userId]
  );
}

async function deleteById(id) {
  await query('DELETE FROM notifications WHERE id = $1', [id]);
}

module.exports = { create, findByUser, findById, markRead, markAllRead, deleteById };