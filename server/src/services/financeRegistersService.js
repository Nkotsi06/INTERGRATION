const repository = require('../repositories/financeRegistersRepository');
const auditLogRepository = require('../repositories/auditLogRepository');

function fail(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function requiredText(value, label, maxLength) {
  const text = String(value || '').trim();
  if (!text || text.length > maxLength) throw fail(`${label} is required and must be ${maxLength} characters or fewer.`);
  return text;
}

function employeeData(input = {}) {
  input = input || {};
  const nationalId = requiredText(input.nationalId, 'National ID', 20);
  const employeeNumber = requiredText(input.employeeNumber, 'Employee number', 80);
  const employerId = requiredText(input.employerId, 'Employer', 50);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employerId)) {
    throw fail('Choose a valid government employer.');
  }
  const startDate = requiredText(input.startDate, 'Start date', 10);
  const status = String(input.status || '').trim().toUpperCase();
  const endDate = input.endDate ? String(input.endDate).trim() : null;
  const validDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (!validDate(startDate)) {
    throw fail('Enter a valid start date.');
  }
  if (!['ACTIVE', 'RETIRED', 'RESIGNED'].includes(status)) {
    throw fail('Choose Active, Retired, or Resigned.');
  }
  if (status === 'ACTIVE' && endDate) throw fail('An active employee cannot have an end date.');
  if (status !== 'ACTIVE' && (!endDate || !validDate(endDate))) {
    throw fail('Retired and resigned employees require a valid end date.');
  }
  if (endDate && endDate < startDate) throw fail('The end date cannot be before the start date.');
  return { nationalId, employeeNumber, employerId, startDate, status, endDate };
}

function debtData(input = {}) {
  input = input || {};
  const nationalId = requiredText(input.nationalId, 'National ID', 20);
  const debtType = requiredText(input.debtType, 'Debt type', 120);
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99) {
    throw fail('Amount must be greater than zero and within the supported limit.');
  }
  return { nationalId, debtType, amount };
}

async function audit(actor, action, recordType, recordId) {
  await auditLogRepository.create({
    userId: actor.userId,
    username: actor.username,
    action,
    recordType,
    recordId,
    result: 'SUCCESS',
  });
}

async function employers(activeOnly) {
  return repository.listEmployers(activeOnly);
}

async function saveEmployer(input = {}, actor, id) {
  input = input || {};
  if (input.isActive !== undefined && typeof input.isActive !== 'boolean') {
    throw fail('Active status must be true or false.');
  }
  const data = {
    code: requiredText(input.code, 'Employer code', 80).toUpperCase().replace(/\s+/g, '_'),
    name: requiredText(input.name, 'Employer name', 160),
    isActive: input.isActive !== false,
  };
  if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw fail('Invalid employer identifier.');
  }
  let employer;
  try {
    employer = await repository.saveEmployer(data, id);
  } catch (error) {
    if (error.code === '23505') throw fail('An employer already uses this code.', 409);
    throw error;
  }
  if (!employer) throw fail('Employer not found.', 404);
  await audit(actor, id ? 'GOVERNMENT_EMPLOYER_UPDATED' : 'GOVERNMENT_EMPLOYER_CREATED', 'GOVERNMENT_EMPLOYER', employer.id);
  return employer;
}

async function employees(filters, actor) {
  const result = await repository.listEmployees(filters);
  await audit(actor, 'GOVERNMENT_EMPLOYEE_REGISTER_VIEWED', 'GOVERNMENT_EMPLOYEE', 'LIST');
  return result;
}

async function saveEmployee(input = {}, actor, id) {
  input = input || {};
  const data = employeeData(input);
  if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw fail('Invalid employee record identifier.');
  }
  const employersList = await repository.listEmployers(true);
  if (!employersList.some((employer) => employer.id === data.employerId)) {
    throw fail('Choose an active government employer.');
  }
  let employee;
  try {
    employee = await repository.saveEmployee(data, actor.userId, id);
  } catch (error) {
    if (error.code === '23505') throw fail('This National ID is already registered.', 409);
    if (error.code === '23503') throw fail('The selected employer no longer exists.', 400);
    throw error;
  }
  if (!employee) throw fail('Employee record not found.', 404);
  await audit(actor, id ? 'GOVERNMENT_EMPLOYEE_UPDATED' : 'GOVERNMENT_EMPLOYEE_CREATED', 'GOVERNMENT_EMPLOYEE', employee.id);
  return employee;
}

async function importEmployees(rows, actor) {
  if (!Array.isArray(rows) || rows.length === 0) throw fail('The import file contains no employee rows.');
  if (rows.length > 1000) throw fail('Import up to 1,000 employee rows at a time.');
  const results = [];
  const activeEmployerIds = new Set((await repository.listEmployers(true)).map((employer) => employer.id));
  for (let index = 0; index < rows.length; index += 1) {
    try {
      const data = employeeData(rows[index]);
      if (!activeEmployerIds.has(data.employerId)) {
        throw fail('Employer must match an active employer ID.');
      }
      const employee = await repository.saveEmployee(data, actor.userId);
      results.push({ row: index + 2, status: 'IMPORTED', id: employee.id });
    } catch (error) {
      if (error.code === '23505') {
        results.push({ row: index + 2, status: 'REJECTED', reason: 'National ID is already registered.' });
      } else if (error.statusCode === 400) {
        results.push({ row: index + 2, status: 'REJECTED', reason: error.message });
      } else {
        throw error;
      }
    }
  }
  const imported = results.filter((item) => item.status === 'IMPORTED').length;
  await audit(actor, 'GOVERNMENT_EMPLOYEE_IMPORT', 'GOVERNMENT_EMPLOYEE', `rows:${rows.length};imported:${imported}`);
  return { total: rows.length, imported, rejected: rows.length - imported, results };
}

async function debts(filters, actor) {
  const result = await repository.listGovernmentDebts(filters);
  await audit(actor, 'GOVERNMENT_DEBT_REGISTER_VIEWED', 'GOVERNMENT_DEBT', 'LIST');
  return result;
}

async function recordDebt(input = {}, actor) {
  input = input || {};
  const debt = await repository.createGovernmentDebt(debtData(input), actor.userId);
  await audit(actor, 'GOVERNMENT_DEBT_RECORDED', 'GOVERNMENT_DEBT', debt.id);
  return debt;
}

async function clearDebt(id, actor) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw fail('Invalid debt record identifier.');
  }
  const debt = await repository.clearGovernmentDebt(id);
  if (!debt) throw fail('Outstanding debt record not found.', 404);
  await audit(actor, 'GOVERNMENT_DEBT_CLEARED', 'GOVERNMENT_DEBT', debt.id);
  return debt;
}

async function outstandingDebtTotal() {
  return repository.getOutstandingDebtTotal();
}

async function citizenIdByNationalId(nationalId) {
  const value = requiredText(nationalId, 'National ID', 20);
  const citizen = await repository.findCitizenByNationalId(value);
  if (!citizen) throw fail('No citizen record was found for that National ID.', 404);
  return citizen.id;
}

module.exports = {
  employers,
  saveEmployer,
  employees,
  saveEmployee,
  importEmployees,
  debts,
  recordDebt,
  clearDebt,
  outstandingDebtTotal,
  citizenIdByNationalId,
};
