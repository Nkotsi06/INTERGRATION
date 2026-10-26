const registerService = require('../services/financeRegistersService');

function filters(query) {
  return {
    search: query.search,
    status: query.status,
    employerId: query.employerId,
    page: query.page,
    pageSize: query.pageSize,
  };
}

async function listEmployers(req, res, next) {
  try { res.json(await registerService.employers(req.query.activeOnly === 'true', req.user)); } catch (error) { next(error); }
}

async function createEmployer(req, res, next) {
  try { res.status(201).json(await registerService.saveEmployer(req.body, req.user)); } catch (error) { next(error); }
}

async function updateEmployer(req, res, next) {
  try { res.json(await registerService.saveEmployer(req.body, req.user, req.params.id)); } catch (error) { next(error); }
}

async function listEmployees(req, res, next) {
  try { res.json(await registerService.employees(filters(req.query), req.user)); } catch (error) { next(error); }
}

async function createEmployee(req, res, next) {
  try { res.status(201).json(await registerService.saveEmployee(req.body, req.user)); } catch (error) { next(error); }
}

async function updateEmployee(req, res, next) {
  try { res.json(await registerService.saveEmployee(req.body, req.user, req.params.id)); } catch (error) { next(error); }
}

async function importEmployees(req, res, next) {
  try { res.status(201).json(await registerService.importEmployees(req.body.rows, req.user)); } catch (error) { next(error); }
}

async function listDebts(req, res, next) {
  try { res.json(await registerService.debts(filters(req.query), req.user)); } catch (error) { next(error); }
}

async function createDebt(req, res, next) {
  try { res.status(201).json(await registerService.recordDebt(req.body, req.user)); } catch (error) { next(error); }
}

async function clearDebt(req, res, next) {
  try { res.json(await registerService.clearDebt(req.params.id, req.user)); } catch (error) { next(error); }
}

module.exports = {
  listEmployers,
  createEmployer,
  updateEmployer,
  listEmployees,
  createEmployee,
  updateEmployee,
  importEmployees,
  listDebts,
  createDebt,
  clearDebt,
};
