const branchService = require('../services/branchService');

async function list(req, res, next) {
  try {
    const filters = {
      ministryCode: req.query.ministryCode,
      district: req.query.district,
      activeOnly: req.query.activeOnly === 'true',
    };
    res.json(await branchService.list(filters));
  } catch (e) { next(e); }
}

async function getOne(req, res, next) {
  try {
    const branch = await branchService.getById(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const created = await branchService.create(req.body, req.user);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const updated = await branchService.update(req.params.id, req.body, req.user);
    res.json(updated);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    await branchService.remove(req.params.id, req.user);
    res.json({ message: 'Branch deleted' });
  } catch (e) { next(e); }
}

module.exports = { list, getOne, create, update, remove };