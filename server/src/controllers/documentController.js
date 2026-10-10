const documentService = require('../services/documentService');

async function upload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Prefer verified citizen from session (citizen upload), then body
    // citizenId (staff acting on a specific citizen), then registrationId
    // (staff capturing a new record).
    const citizenId =
      req.session?.verifiedCitizenId ||
      req.body.citizenId ||
      null;

    const registrationId = req.body.registrationId || null;

    if (!citizenId && !registrationId) {
      return res.status(400).json({
        message:
          'A citizen or registration reference is required to upload a document.',
      });
    }

    if (!req.body.documentType) {
      return res.status(400).json({ message: 'Document type is required.' });
    }

    const doc = await documentService.upload(
      citizenId,
      req.file,
      req.body.documentType,
      req.user,
      registrationId
    );

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const citizenId = req.query.citizenId || req.session?.verifiedCitizenId;
    if (!citizenId) return res.json([]);
    res.json(await documentService.findByCitizen(citizenId));
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const doc = await documentService.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const doc = await documentService.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.download(doc.file_path, doc.file_name);
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    const updated = await documentService.verify(
      req.params.id,
      req.body.action,
      req.body.reason,
      req.user
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await documentService.remove(req.params.id, req.user);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, list, getOne, download, verify, remove };