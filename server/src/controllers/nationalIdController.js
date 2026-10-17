const nationalIdService = require('../services/nationalIdService');

async function getAutoFill(req, res, next) {
  try {
    const citizenId = req.user.citizenId;
    if (!citizenId) return res.status(403).json({ message: 'Citizen profile required.' });

    const data = await nationalIdService.getAutoFillData(citizenId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function submitApplication(req, res, next) {
  try {
    const citizenId = req.user.citizenId;
    if (!citizenId) return res.status(403).json({ message: 'Citizen profile required.' });

    const result = await nationalIdService.submitApplication(citizenId, req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAutoFill, submitApplication };