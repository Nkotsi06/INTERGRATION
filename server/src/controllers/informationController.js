const infoService = require('../services/informationService');

// Info Topics
async function listInformation(req, res, next) {
  try { res.json(await infoService.listInformation()); } catch (err) { next(err); }
}
async function updateInformation(req, res, next) {
  try { res.json(await infoService.updateInformation(req.params.code, req.body)); } catch (err) { next(err); }
}

// Enquiries
async function createEnquiry(req, res, next) {
  try {
    const result = await infoService.createEnquiry(req.user.citizenId, req.body, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}
async function listEnquiries(req, res, next) {
  try { res.json(await infoService.listEnquiries(req.query)); } catch (err) { next(err); }
}
async function getEnquiry(req, res, next) {
  try {
    const e = await infoService.getEnquiry(req.params.id);
    if (!e) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(e);
  } catch (err) { next(err); }
}
async function replyToEnquiry(req, res, next) {
  try {
    await infoService.replyToEnquiry(req.params.id, req.body.message, req.user);
    res.json({ message: 'Reply sent' });
  } catch (err) { next(err); }
}

// Verification
async function verifyDocument(req, res, next) {
  try {
    const result = await infoService.verifyDocument(req.query.number);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = {
  listInformation, updateInformation,
  createEnquiry, listEnquiries, getEnquiry, replyToEnquiry,
  verifyDocument
};