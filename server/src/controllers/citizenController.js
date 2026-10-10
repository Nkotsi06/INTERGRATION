const citizenService = require('../services/citizenService');
const applicationRepository = require('../repositories/applicationRepository');
const documentService = require('../services/documentService');
const notificationService = require('../services/notificationService');

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
    const apps = await applicationRepository.findByCitizen(
      req.session.verifiedCitizenId
    );
    res.json(apps);
  } catch (err) {
    next(err);
  }
}

async function getApplicationByRef(req, res, next) {
  try {
    const app = await applicationRepository.findByReference(req.params.ref);
    if (!app || app.citizen_id !== req.session.verifiedCitizenId) {
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
    const docs = await documentService.findByCitizen(
      req.session.verifiedCitizenId
    );
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