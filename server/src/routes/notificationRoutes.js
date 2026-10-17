const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');

router.use(authMiddleware);

// Get all notifications for the logged-in user (citizen, staff, or admin)
router.get('/', async (req, res, next) => {
  try {
    const rows = await notificationService.getForUser(req.user.userId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Unread count for the sidebar badge
router.get('/unread-count', async (req, res, next) => {
  try {
    const rows = await notificationService.getForUser(req.user.userId);
    const count = (rows || []).filter((n) => !n.is_read).length;
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// Mark all as read
router.put('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

// Mark one as read
router.put('/:id/read', async (req, res, next) => {
  try {
    await notificationService.markRead(req.params.id, req.user.userId);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

// Delete one
router.delete('/:id', async (req, res, next) => {
  try {
    await notificationService.deleteForUser(req.params.id, req.user.userId);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;