const settingsService = require('../services/settingsService');

async function getPublic(req, res, next) {
  try { res.json(await settingsService.getPublicSettings()); } catch (err) { next(err); }
}

async function getLanguages(req, res, next) {
  try { res.json(await settingsService.getLanguages()); } catch (err) { next(err); }
}

async function getTranslations(req, res, next) {
  try { res.json(await settingsService.getTranslations(req.params.langCode)); } catch (err) { next(err); }
}

async function getPublicBranches(req, res, next) {
  try { res.json(await settingsService.getPublicBranches(req.query.ministry)); } catch (err) { next(err); }
}

module.exports = { getPublic, getLanguages, getTranslations, getPublicBranches };