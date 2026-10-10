const notificationRepository = require('../repositories/notificationRepository');

async function notify(userId, title, message) {
  return notificationRepository.create({ userId, title, message });
}

async function getForUser(userId) {
  return notificationRepository.findByUser(userId);
}

async function markRead(id, userId) {
  const row = await notificationRepository.findById(id);
  if (!row) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  if (row.user_id !== userId) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }
  return notificationRepository.markRead(id);
}

async function deleteForUser(id, userId) {
  const row = await notificationRepository.findById(id);
  if (!row) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  if (row.user_id !== userId) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }
  return notificationRepository.deleteById(id);
}

module.exports = { notify, getForUser, markRead, deleteForUser };