const treasuryRepository = require('../repositories/treasuryRepository');
const budgetRepository = require('../repositories/budgetRepository');
const debtRepository = require('../repositories/debtRepository');
const procurementRepository = require('../repositories/procurementRepository');
const auditFindingRepository = require('../repositories/auditFindingRepository');

async function getTreasury(filters) { return treasuryRepository.findAll(filters); }
async function getTreasuryStats()   { return treasuryRepository.getStats(); }

async function getBudget(filters)     { return budgetRepository.findAll(filters); }
async function getBudgetStats(fy)     { return budgetRepository.getStats(fy || new Date().getFullYear().toString()); }

async function getDebt(filters) { return debtRepository.findAll(filters); }
async function getDebtStats()   { return debtRepository.getStats(); }

async function getProcurement(filters) { return procurementRepository.findAll(filters); }
async function getProcurementStats()   { return procurementRepository.getStats(); }

async function getAuditFindings(filters) { return auditFindingRepository.findAll(filters); }
async function getAuditStats()           { return auditFindingRepository.getStats(); }

module.exports = {
  getTreasury, getTreasuryStats,
  getBudget, getBudgetStats,
  getDebt, getDebtStats,
  getProcurement, getProcurementStats,
  getAuditFindings, getAuditStats,
};