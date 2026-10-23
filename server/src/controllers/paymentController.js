const paymentService = require('../services/paymentService');

async function financeDashboard(req, res, next) {
  try {
    res.json(await paymentService.getFinanceDashboard());
  } catch (err) {
    next(err);
  }
}

async function listPayments(req, res, next) {
  try {
    const filters = {
      ministry: req.query.ministry,
      service: req.query.service,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
      search: req.query.search,
      page: req.query.page,
      pageSize: req.query.pageSize,
    };
    res.json(await paymentService.listForFinance(filters));
  } catch (err) {
    next(err);
  }
}

async function myPayments(req, res, next) {
  try {
    const citizenId = req.user?.citizenId || req.session?.verifiedCitizenId;
    if (!citizenId) return res.json([]);
    res.json(await paymentService.listForCitizen(citizenId));
  } catch (err) {
    next(err);
  }
}

async function offlinePayment(req, res, next) {
  try {
    res.status(201).json(await paymentService.recordOfflinePayment(req.body, req.user));
  } catch (err) {
    next(err);
  }
}

module.exports = { financeDashboard, listPayments, myPayments, offlinePayment };