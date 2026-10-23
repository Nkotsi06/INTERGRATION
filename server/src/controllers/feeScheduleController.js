const feeScheduleService = require('../services/feeScheduleService');

async function listFees(req, res, next) {
  try {
    res.json(await feeScheduleService.listFees({
      ministry: req.query.ministry,
      is_active:
        req.query.is_active === undefined
          ? undefined
          : req.query.is_active === 'true',
    }));
  } catch (err) { next(err); }
}

async function updateFee(req, res, next) {
  try {
    res.json(await feeScheduleService.updateFee(req.params.id, req.body, req.user));
  } catch (err) { next(err); }
}

async function createFee(req, res, next) {
  try {
    res.status(201).json(await feeScheduleService.createFee(req.body, req.user));
  } catch (err) { next(err); }
}

module.exports = { listFees, updateFee, createFee };