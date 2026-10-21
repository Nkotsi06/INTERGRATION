const birthApplicationService = require('../services/birthApplicationService');

async function submit(req, res, next) {
  try {
    const application = await birthApplicationService.submit(req.body, req.files || {});
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  try {
    const certificate = await birthApplicationService.verifyCertificate(req.params.certificateNumber);
    if (!certificate) return res.status(404).json({ message: 'Certificate not found.' });
    res.json(certificate);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    res.json(await birthApplicationService.list(req.query));
  } catch (error) {
    next(error);
  }
}

async function get(req, res, next) {
  try {
    const application = await birthApplicationService.getForReview(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    res.json(birthApplicationService.publicApplication(application));
  } catch (error) {
    next(error);
  }
}

async function document(req, res, next) {
  try {
    const file = await birthApplicationService.getDocument(
      req.params.id,
      req.params.documentType,
      req.params.fileIndex
    );
    res.type(file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
    res.sendFile(file.path);
  } catch (error) {
    next(error);
  }
}

async function review(req, res, next) {
  try {
    res.json(await birthApplicationService.review(
      req.params.id,
      req.body.decision,
      req.body.reason,
      req.user
    ));
  } catch (error) {
    next(error);
  }
}

async function downloadCertificate(req, res, next) {
  try {
    const pdf = await birthApplicationService.getCertificatePdf(
      req.user,
      req.params.certificateNumber
    );
    res.type('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.certificateNumber}.pdf"`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
}

module.exports = { submit, verify, list, get, document, review, downloadCertificate };
