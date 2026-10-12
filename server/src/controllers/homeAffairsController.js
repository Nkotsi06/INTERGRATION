const homeAffairsService = require('../services/homeAffairsService');
const citizenService = require('../services/citizenService');
const documentService = require('../services/documentService');
const biometricService = require('../services/biometricService');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────
// Search & read
// ─────────────────────────────────────────────────────────────────────
async function search(req, res, next) {
  try {
    const citizen = await homeAffairsService.searchByQuery({
      query: req.query.query || req.query.nationalId,
    });
    if (!citizen) return res.status(404).json({ message: 'No citizen found' });
    res.json(citizen);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const citizen = await homeAffairsService.getById(req.params.id);
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });
    res.json(citizen);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Registration queue
// ─────────────────────────────────────────────────────────────────────
async function getRegistrations(req, res, next) {
  try {
    const registrations = await homeAffairsService.getRegistrations(req.query);
    res.json(registrations);
  } catch (err) {
    next(err);
  }
}

async function getRegistrationById(req, res, next) {
  try {
    const reg = await homeAffairsService.getRegistrationById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    res.json(reg);
  } catch (err) {
    console.error(
      `[homeAffairsController.getRegistrationById] id=${req.params.id}`,
      err
    );
    next(err);
  }
}

async function completeRecord(req, res, next) {
  try {
    const result = await homeAffairsService.completeRecord(
      req.params.id,
      req.body,
      req.user
    );
    if (!result || !result.citizenId) {
      return res
        .status(500)
        .json({ message: 'Service did not return a citizenId' });
    }
    res.status(201).json(result);
  } catch (err) {
    console.error(
      `[homeAffairsController.completeRecord] id=${req.params.id}`,
      err
    );
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Verification
// ─────────────────────────────────────────────────────────────────────
async function verify(req, res, next) {
  try {
    const updated = await homeAffairsService.verifyCitizen(
      req.params.id,
      req.body,
      req.user
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────────────
async function update(req, res, next) {
  try {
    const updated = await homeAffairsService.updateCitizen(
      req.params.id,
      req.body,
      req.user
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Documents and biometrics
// ─────────────────────────────────────────────────────────────────────
async function getDocuments(req, res, next) {
  try {
    const docs = await documentService.findByCitizen(req.params.id);
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

async function getBiometrics(req, res, next) {
  try {
    const record = await biometricService.get(req.params.id);
    res.json(record);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Photo — serves the citizen's passport photo or biometric facial image.
// ─────────────────────────────────────────────────────────────────────
async function getCitizenPhoto(req, res, next) {
  try {
    const citizenId = req.params.id;
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

// ─────────────────────────────────────────────────────────────────────
// Certificates
// ─────────────────────────────────────────────────────────────────────
async function getCertificates(req, res, next) {
  try {
    const result = await homeAffairsService.getCertificatesForCitizen(
      req.params.id
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function issueBirthCertificate(req, res, next) {
  try {
    const result = await homeAffairsService.issueBirthCertificate(
      req.params.id,
      req.body,
      req.user
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function issueDeathCertificate(req, res, next) {
  try {
    const result = await homeAffairsService.issueDeathCertificate(
      req.params.id,
      req.body,
      req.user
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function issueMarriageCertificate(req, res, next) {
  try {
    const result = await homeAffairsService.issueMarriageCertificate(
      req.params.id,
      req.body,
      req.user
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Dashboard stats and reports
// ─────────────────────────────────────────────────────────────────────
async function getStats(req, res, next) {
  try {
    const stats = await homeAffairsService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const report = await homeAffairsService.getReports(req.query);
    res.json(report);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  search,
  getById,
  getRegistrations,
  getRegistrationById,
  completeRecord,
  verify,
  update,
  getDocuments,
  getBiometrics,
  getCitizenPhoto,
  getCertificates,
  issueBirthCertificate,
  issueDeathCertificate,
  issueMarriageCertificate,
  getStats,
  getReports,
};