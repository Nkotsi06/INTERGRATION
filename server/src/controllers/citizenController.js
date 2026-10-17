const citizenService = require('../services/citizenService');
const applicationRepository = require('../repositories/applicationRepository');
const documentService = require('../services/documentService');
const notificationService = require('../services/notificationService');
const { query } = require('../config/database'); // ← Added to support custom joins
const path = require('path');
const fs = require('fs');

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
    
    // Join with branches to get the branch name for the tracking UI
    const result = await query(
      `SELECT a.*, b.name as branch_name, b.address as branch_address
       FROM applications a
       LEFT JOIN branches b ON b.id::text = (a.data->'formData'->>'branchId')
       WHERE a.citizen_id = $1 
       ORDER BY a.submitted_at DESC`,
      [citizenId]
    );
    
    // Format the branch name into the JSON data for the frontend
    const apps = result.rows.map(r => ({
      ...r,
      data: {
        ...r.data,
        formData: {
          ...r.data.formData,
          branchName: r.branch_name,
          branchAddress: r.branch_address
        }
      }
    }));
    
    res.json(apps);
  } catch (err) {
    next(err);
  }
}

async function getApplicationByRef(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    const app = await applicationRepository.findByReference(req.params.ref);
    if (!app || !citizenId || app.citizen_id !== citizenId) {
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

async function getPhoto(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    if (!citizenId) return res.status(404).json({ message: 'No photo' });

    const photo = await citizenService.findPhotoForCitizen(citizenId);
    if (!photo) return res.status(404).json({ message: 'No photo' });

    if (photo.kind === 'dataurl') {
      const match = photo.dataUrl.match(/^data:(.+?);base64,(.*)$/);
      if (!match) return res.status(404).json({ message: 'No photo' });
      const [, mime, b64] = match;
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'private, max-age=300');
      return res.send(Buffer.from(b64, 'base64'));
    }

    const filePath = String(photo.filePath).split('#')[0];
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Photo file missing' });
    }
    res.setHeader('Content-Type', photo.fileType || 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=300');
    fs.createReadStream(filePath).pipe(res);
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
  getPhoto,
  getNotifications,
  deleteNotification,
  markNotificationRead,
};