const fs = require('fs');
const financeCitizenService = require('../services/financeCitizenService');
const { citizenIdFrom } = require('../middleware/citizenId');

function requireCitizenId(req, res) {
  const citizenId = citizenIdFrom(req);
  if (!citizenId) {
    res.status(403).json({ message: 'A linked citizen profile is required.' });
    return null;
  }
  return citizenId;
}

async function dashboard(req, res, next) {
  try {
    const citizenId = requireCitizenId(req, res);
    if (!citizenId) return;
    res.json(await financeCitizenService.getDashboard(citizenId));
  } catch (error) {
    next(error);
  }
}

async function payApplicationFee(req, res, next) {
  try {
    const citizenId = requireCitizenId(req, res);
    if (!citizenId) return;
    res.status(201).json(
      await financeCitizenService.payApplicationFee(citizenId, req.user, req.body)
    );
  } catch (error) {
    next(error);
  }
}

async function submitEmploymentDeclaration(req, res, next) {
  try {
    const citizenId = requireCitizenId(req, res);
    if (!citizenId) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return;
    }
    const result = await financeCitizenService.submitEmploymentDeclaration(
      citizenId,
      req.body,
      req.file,
      req.user
    );
    res.status(201).json(result);
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
}

async function downloadEmploymentProof(req, res, next) {
  try {
    const citizenId = requireCitizenId(req, res);
    if (!citizenId) return;
    const proof = await financeCitizenService.getEmploymentProof(req.params.id, citizenId);
    if (!fs.existsSync(proof.filePath)) {
      return res.status(404).json({ message: 'Employment proof file is no longer available.' });
    }
    res.download(proof.filePath, proof.fileName, { headers: { 'Content-Type': proof.fileType } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboard,
  payApplicationFee,
  submitEmploymentDeclaration,
  downloadEmploymentProof,
};
