const serviceCatalog = require('../services/serviceCatalogService');

function citizenIdFrom(req) {
  return req.session?.verifiedCitizenId || req.user?.citizenId || null;
}

// Public list for a ministry — no login required.
async function listPublic(req, res, next) {
  try {
    const ministry = req.query.ministry;
    if (!ministry) return res.status(400).json({ message: 'ministry is required' });
    res.json(await serviceCatalog.listPublic(ministry));
  } catch (err) { next(err); }
}

// Admin list — every service, enabled or not.
async function listAll(req, res, next) {
  try {
    res.json(await serviceCatalog.listAll({
      ministry: req.query.ministry,
      service_type: req.query.service_type,
      is_enabled:
        req.query.is_enabled === undefined
          ? undefined
          : req.query.is_enabled === 'true',
    }));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try { res.json(await serviceCatalog.getById(req.params.id)); } catch (err) { next(err); }
}

async function updateService(req, res, next) {
  try {
    res.json(await serviceCatalog.updateService(req.params.id, req.body, req.user));
  } catch (err) { next(err); }
}

async function submitApplication(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    if (!citizenId) return res.status(403).json({ message: 'Identity verification required.' });
    const result = await serviceCatalog.submitApplication({
      serviceId: req.params.serviceId,
      citizenId,
      formData: req.body.formData || {},
      user: req.user,
    });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

module.exports = { listPublic, listAll, getById, updateService, submitApplication };