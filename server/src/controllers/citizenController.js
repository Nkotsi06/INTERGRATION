const citizenService = require('../services/citizenService');
const applicationRepository = require('../repositories/applicationRepository');
const documentService = require('../services/documentService');
const notificationService = require('../services/notificationService');

// Helper — prefer the session flag (step-up auth), fall back to the JWT
// citizenId (account link created by Home Affairs).
function citizenIdFrom(req) {
  return req.session?.verifiedCitizenId || req.user?.citizenId || null;
}

async function getProfile(req, res, next) {
  try {
    const profile = await citizenService.getProfile(req.user.userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function updateContact(req, res, next) {
  try {
    const updated = await citizenService.updateContact(req.user.userId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await citizenService.changePassword(req.user.userId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getApplications(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    if (!citizenId) return res.json([]);
    const apps = await applicationRepository.findByCitizen(citizenId);
    res.json(apps);
  } catch (err) {
    next(err);
  }
}

async function getApplicationByRef(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    const app = await applicationRepository.findByReference(req.params.ref);
    if (!app || (citizenId && app.citizen_id !== citizenId)) {
      return res.status(404).json({ message: 'Application not found' });
    }
    const history = await applicationRepository.getStatusHistory(app.id);
    res.json({ ...app, history });
  } catch (err) {
    next(err);
  }
}

async function getDocuments(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    if (!citizenId) return res.json([]);
    const docs = await documentService.findByCitizen(citizenId);
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getForUser(req.user.userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    await notificationService.deleteForUser(req.params.id, req.user.userId);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    await notificationService.markRead(req.params.id, req.user.userId);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateContact,
  changePassword,
  getApplications,
  getApplicationByRef,
  getDocuments,
  getNotifications,
  deleteNotification,
  markNotificationRead,
};