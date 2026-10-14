const staffService = require('../services/financeStaffService');

async function getTreasury(req, res, next) { try { res.json(await staffService.getTreasury(req.query)); } catch (e) { next(e); } }
async function getTreasuryStats(req, res, next) { try { res.json(await staffService.getTreasuryStats()); } catch (e) { next(e); } }

async function getBudget(req, res, next) { try { res.json(await staffService.getBudget(req.query)); } catch (e) { next(e); } }
async function getBudgetStats(req, res, next) { try { res.json(await staffService.getBudgetStats(req.query.fiscalYear)); } catch (e) { next(e); } }

async function getDebt(req, res, next) { try { res.json(await staffService.getDebt(req.query)); } catch (e) { next(e); } }
async function getDebtStats(req, res, next) { try { res.json(await staffService.getDebtStats()); } catch (e) { next(e); } }

async function getProcurement(req, res, next) { try { res.json(await staffService.getProcurement(req.query)); } catch (e) { next(e); } }
async function getProcurementStats(req, res, next) { try { res.json(await staffService.getProcurementStats()); } catch (e) { next(e); } }

async function getTaxPolicy(req, res, next) { try { res.json(await staffService.getTaxPolicy()); } catch (e) { next(e); } }

async function getAuditFindings(req, res, next) { try { res.json(await staffService.getAuditFindings(req.query)); } catch (e) { next(e); } }
async function getAuditStats(req, res, next) { try { res.json(await staffService.getAuditStats()); } catch (e) { next(e); } }

module.exports = {
  getTreasury, getTreasuryStats,
  getBudget, getBudgetStats,
  getDebt, getDebtStats,
  getProcurement, getProcurementStats,
  getTaxPolicy,
  getAuditFindings, getAuditStats,
};