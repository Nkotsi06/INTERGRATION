const financeService = require('../services/financeService');

async function getTaxProfile(req, res, next) {
  try {
    res.json(await financeService.getTaxProfile(req.session.verifiedCitizenId));
  } catch (err) { next(err); }
}

async function registerTax(req, res, next) {
  try {
    const record = await financeService.registerTax(req.session.verifiedCitizenId, req.body, req.user);
    res.status(201).json(record);
  } catch (err) { next(err); }
}

async function makePayment(req, res, next) {
  try {
    const result = await financeService.makePayment(req.session.verifiedCitizenId, req.body, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function getPayments(req, res, next) {
  try {
    res.json(await financeService.getPayments(req.session.verifiedCitizenId));
  } catch (err) { next(err); }
}

async function getTaxClearance(req, res, next) {
  try {
    const result = await financeService.generateTaxClearance(req.session.verifiedCitizenId, {
      userId: req.user.userId,
      fullName: req.user.fullName,
      address: req.user.address,
    });
    res.json(result.cert);
  } catch (err) { next(err); }
}

async function downloadTaxClearance(req, res, next) {
  try {
    const result = await financeService.generateTaxClearance(req.session.verifiedCitizenId, {
      userId: req.user.userId,
      fullName: req.user.fullName,
      address: req.user.address,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tax-clearance-${result.cert.certificate_id}.pdf"`);
    res.send(result.pdfBuffer);
  } catch (err) { next(err); }
}

async function getStaffRegistrations(req, res, next) {
  try {
    res.json(await financeService.getStaffRegistrations(req.query));
  } catch (err) { next(err); }
}

async function processRegistration(req, res, next) {
  try {
    await financeService.processRegistration(req.params.id, req.body.action, req.user);
    res.json({ message: 'Registration processed' });
  } catch (err) { next(err); }
}

module.exports = {
  getTaxProfile, registerTax, makePayment, getPayments,
  getTaxClearance, downloadTaxClearance, getStaffRegistrations, processRegistration,
};