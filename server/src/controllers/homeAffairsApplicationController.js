const haAppService = require('../services/homeAffairsApplicationService');

async function listApplications(req, res, next) {
  try {
    res.json(await haAppService.listApplications(req.query));
  } catch (err) { next(err); }
}

async function getApplication(req, res, next) {
  try {
    const app = await haAppService.getApplication(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    await haAppService.updateStatus(req.params.id, req.body.status, req.user);
    res.json({ message: 'Status updated successfully' });
  } catch (err) { next(err); }
}

async function recordCollection(req, res, next) {
  try {
    await haAppService.recordCollection(req.params.id, req.body, req.user);
    res.json({ message: 'Collection recorded successfully' });
  } catch (err) { next(err); }
}

module.exports = { listApplications, getApplication, updateStatus, recordCollection };