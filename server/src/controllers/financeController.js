const financeService = require('../services/financeService');

function citizenIdFrom(req) {
  return req.session?.verifiedCitizenId || req.user?.citizenId || null;
}

// Tax core
async function getTaxProfile(req, res, next) { try { res.json(await financeService.getTaxProfile(citizenIdFrom(req))); } catch (e) { next(e); } }
async function registerTax(req, res, next) { try { res.status(201).json(await financeService.registerTax(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function makePayment(req, res, next) { try { res.status(201).json(await financeService.makePayment(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getPayments(req, res, next) { try { res.json(await financeService.getPayments(citizenIdFrom(req))); } catch (e) { next(e); } }
async function getTaxClearance(req, res, next) {
  try {
    const result = await financeService.generateTaxClearance(citizenIdFrom(req), {
      userId: req.user.userId, fullName: req.user.fullName, address: req.user.address,
    });
    res.json(result.cert);
  } catch (e) { next(e); }
}
async function downloadTaxClearance(req, res, next) {
  try {
    const result = await financeService.generateTaxClearance(citizenIdFrom(req), {
      userId: req.user.userId, fullName: req.user.fullName, address: req.user.address,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="tax-clearance-${result.cert.certificate_id}.pdf"`);
    res.send(result.pdfBuffer);
  } catch (e) { next(e); }
}
async function getStaffRegistrations(req, res, next) { try { res.json(await financeService.getStaffRegistrations(req.query)); } catch (e) { next(e); } }
async function processRegistration(req, res, next) { try { await financeService.processRegistration(req.params.id, req.body.action, req.user); res.json({ message: 'Processed' }); } catch (e) { next(e); } }

// VAT
async function applyForVat(req, res, next) { try { res.status(201).json(await financeService.applyForVat(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getMyVat(req, res, next) { try { res.json(await financeService.getMyVat(citizenIdFrom(req))); } catch (e) { next(e); } }
async function getStaffVat(req, res, next) { try { res.json(await financeService.getStaffVat(req.query)); } catch (e) { next(e); } }
async function processVat(req, res, next) { try { res.json(await financeService.processVat(req.params.id, req.body.action, req.user)); } catch (e) { next(e); } }

// Returns
async function submitTaxReturn(req, res, next) { try { res.status(201).json(await financeService.submitTaxReturn(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getMyTaxReturns(req, res, next) { try { res.json(await financeService.getMyTaxReturns(citizenIdFrom(req))); } catch (e) { next(e); } }
async function getStaffTaxReturns(req, res, next) { try { res.json(await financeService.getStaffTaxReturns(req.query)); } catch (e) { next(e); } }
async function reviewTaxReturn(req, res, next) { try { res.json(await financeService.reviewTaxReturn(req.params.id, req.body, req.user)); } catch (e) { next(e); } }

// Payment plans
async function requestPaymentPlan(req, res, next) { try { res.status(201).json(await financeService.requestPaymentPlan(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getMyPaymentPlans(req, res, next) { try { res.json(await financeService.getMyPaymentPlans(citizenIdFrom(req))); } catch (e) { next(e); } }
async function getStaffPaymentPlans(req, res, next) { try { res.json(await financeService.getStaffPaymentPlans(req.query)); } catch (e) { next(e); } }
async function processPaymentPlan(req, res, next) { try { res.json(await financeService.processPaymentPlan(req.params.id, req.body.action, req.user)); } catch (e) { next(e); } }

// Business
async function registerBusiness(req, res, next) { try { res.status(201).json(await financeService.registerBusiness(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getMyBusinesses(req, res, next) { try { res.json(await financeService.getMyBusinesses(citizenIdFrom(req))); } catch (e) { next(e); } }
async function getStaffBusinesses(req, res, next) { try { res.json(await financeService.getStaffBusinesses(req.query)); } catch (e) { next(e); } }
async function approveBusiness(req, res, next) { try { res.json(await financeService.approveBusiness(req.params.id, req.user)); } catch (e) { next(e); } }

module.exports = {
  getTaxProfile, registerTax, makePayment, getPayments,
  getTaxClearance, downloadTaxClearance, getStaffRegistrations, processRegistration,
  applyForVat, getMyVat, getStaffVat, processVat,
  submitTaxReturn, getMyTaxReturns, getStaffTaxReturns, reviewTaxReturn,
  requestPaymentPlan, getMyPaymentPlans, getStaffPaymentPlans, processPaymentPlan,
  registerBusiness, getMyBusinesses, getStaffBusinesses, approveBusiness,
};