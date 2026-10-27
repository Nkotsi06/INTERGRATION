jest.mock('../repositories/pensionRepository', () => ({
  getEligibilityFacts: jest.fn(),
  findByCitizen: jest.fn(),
  findRulesForCategory: jest.fn(),
  create: jest.fn(),
  findApplications: jest.fn(),
}));
jest.mock('../repositories/pensionVerificationRepository', () => ({}));
jest.mock('../repositories/deathCertificateRepository', () => ({
  findByCitizen: jest.fn(),
  findByNationalId: jest.fn(),
}));
jest.mock('../repositories/citizenRepository', () => ({
  findById: jest.fn(),
}));
jest.mock('../services/notificationService', () => ({
  notify: jest.fn(),
}));
jest.mock('../repositories/userRepository', () => ({
  findByCitizenId: jest.fn(),
}));
jest.mock('../services/auditService', () => ({
  log: jest.fn(),
}));
jest.mock('../config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
}));
jest.mock('../utils/referenceGenerator', () => ({
  generateReference: jest.fn(),
}));

const pensionRepository = require('../repositories/pensionRepository');
const deathCertificateRepository = require('../repositories/deathCertificateRepository');
const citizenRepository = require('../repositories/citizenRepository');
const userRepository = require('../repositories/userRepository');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');
const { getClient } = require('../config/database');
const { generateReference } = require('../utils/referenceGenerator');
const pensionsService = require('./pensionsService');

describe('assessEligibility', () => {
  const activeOldAgeRule = {
    pension_type: 'OLD_AGE',
    minimum_age: 70,
    minimum_service_years: 0,
    requires_government_service: false,
    monthly_amount: 1000,
    currency: 'LSL',
  };
  const activeCivilServiceRule = {
    pension_type: 'CIVIL_SERVICE',
    minimum_age: 55,
    minimum_service_years: 20,
    requires_government_service: true,
    monthly_amount: 0,
    currency: 'LSL',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    citizenRepository.findById.mockResolvedValue({
      id: 'citizen-1',
      date_of_birth: '1950-01-01',
    });
    deathCertificateRepository.findByCitizen.mockResolvedValue(null);
    pensionRepository.getEligibilityFacts.mockResolvedValue({
      government_employee_id: null,
      employee_number: null,
      employment_status: null,
      employment_start_date: null,
      employment_end_date: null,
      outstanding_debt_count: 0,
      outstanding_debt_amount: 0,
      pension_status: null,
      has_pending_application: false,
    });
    pensionRepository.findByCitizen.mockResolvedValue(null);
    pensionRepository.findRulesForCategory.mockResolvedValue([
      activeOldAgeRule,
      activeCivilServiceRule,
    ]);
    userRepository.findByCitizenId.mockResolvedValue({ id: 'user-citizen-1' });
  });

  it('allows an eligible non-government employee to apply for Old Age Pension', async () => {
    const result = await pensionsService.assessEligibility('citizen-1');

    expect(result).toMatchObject({
      eligible: true,
      category: 'OLD_AGE',
      governmentEmployee: false,
      hasOutstandingDebt: false,
    });
  });

  it('does not qualify an active government employee for Old Age Pension', async () => {
    pensionRepository.getEligibilityFacts.mockResolvedValue({
      government_employee_id: 'employee-1',
      employee_number: 'EMP-01',
      employment_status: 'ACTIVE',
      employment_start_date: '1990-01-01',
      employment_end_date: null,
      outstanding_debt_count: 0,
      outstanding_debt_amount: 0,
      pension_status: null,
      has_pending_application: false,
    });

    const result = await pensionsService.assessEligibility('citizen-1');

    expect(result).toMatchObject({
      eligible: true,
      category: 'CIVIL_SERVICE',
      governmentEmployee: true,
      isCurrentGovernmentEmployee: true,
    });
    expect(result.evaluatedCategories.find((item) => item.category === 'OLD_AGE'))
      .toMatchObject({ employeeTypeMet: false, eligible: false });
  });

  it('blocks eligibility when Finance has outstanding government debt', async () => {
    pensionRepository.getEligibilityFacts.mockResolvedValue({
      government_employee_id: null,
      employee_number: null,
      employment_status: null,
      employment_start_date: null,
      employment_end_date: null,
      outstanding_debt_count: 1,
      outstanding_debt_amount: '250.00',
      pension_status: null,
      has_pending_application: false,
    });

    const result = await pensionsService.assessEligibility('citizen-1');

    expect(result).toMatchObject({
      eligible: false,
      reason: 'OUTSTANDING_GOVERNMENT_DEBT',
      hasOutstandingDebt: true,
      outstandingDebtAmount: 250,
    });
  });

  it('prevents a second application when a pension entitlement already exists', async () => {
    pensionRepository.findByCitizen.mockResolvedValue({
      payment_status: 'SUSPENDED',
    });

    const result = await pensionsService.assessEligibility('citizen-1');

    expect(result).toMatchObject({
      eligible: false,
      reason: 'EXISTING_PENSION',
      hasExistingPension: true,
    });
  });

  it('prevents a concurrent application while one is already pending', async () => {
    pensionRepository.getEligibilityFacts.mockResolvedValue({
      government_employee_id: null,
      employee_number: null,
      employment_status: null,
      employment_start_date: null,
      employment_end_date: null,
      outstanding_debt_count: 0,
      outstanding_debt_amount: 0,
      pension_status: null,
      has_pending_application: true,
    });

    const result = await pensionsService.assessEligibility('citizen-1');

    expect(result).toMatchObject({
      eligible: false,
      reason: 'PENDING_APPLICATION',
      hasPendingApplication: true,
    });
  });

  it('uses a citizen lock and verifies the requested category before creating an application', async () => {
    const calls = [];
    const client = {
      query: jest.fn(async (sql) => {
        calls.push(sql);
        if (sql.includes('SELECT id FROM citizens')) {
          return { rows: [{ id: 'citizen-1' }] };
        }
        if (sql.includes('INSERT INTO applications')) {
          return { rows: [{ id: 'application-1', reference_number: 'APP-1' }] };
        }
        return { rows: [] };
      }),
      release: jest.fn(),
    };
    getClient.mockResolvedValue(client);
    generateReference.mockResolvedValue('APP-1');

    await expect(pensionsService.submitPensionApplication({
      citizenId: 'citizen-1',
      formData: { pensionType: 'CIVIL_SERVICE' },
      user: { userId: 'citizen-user-1', username: 'citizen' },
    })).rejects.toMatchObject({
      statusCode: 400,
      message: 'Choose the pension type returned by your current eligibility assessment.',
    });

    expect(calls[0]).toBe('BEGIN');
    expect(calls.some((sql) => sql.includes('FOR UPDATE'))).toBe(true);
    expect(calls.some((sql) => sql.includes('INSERT INTO applications'))).toBe(false);
    expect(calls[calls.length - 1]).toBe('ROLLBACK');
    expect(client.release).toHaveBeenCalledTimes(1);
    expect(notificationService.notify).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('rechecks eligibility and applies the configured benefit amount on approval', async () => {
    const pensionApplication = {
      id: 'application-1',
      citizen_id: 'citizen-1',
      reference_number: 'APP-1',
      status: 'SUBMITTED',
      data: { formData: { pensionType: 'OLD_AGE' } },
    };
    const client = {
      query: jest.fn(async (sql) => {
        if (sql.includes('SELECT * FROM applications')) {
          return { rows: [pensionApplication] };
        }
        if (sql.includes("nextval('pension_number_seq')")) {
          return { rows: [{ pension_number: 'LS-PEN-2026-000001' }] };
        }
        if (sql.includes('INSERT INTO applications')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
      release: jest.fn(),
    };
    getClient.mockResolvedValue(client);
    pensionRepository.getEligibilityFacts.mockResolvedValue({
      government_employee_id: null,
      employee_number: null,
      employment_status: null,
      employment_start_date: null,
      employment_end_date: null,
      outstanding_debt_count: 0,
      outstanding_debt_amount: 0,
      pension_status: null,
      has_pending_application: false,
    });
    pensionRepository.findRulesForCategory.mockResolvedValue([activeOldAgeRule]);
    pensionRepository.create.mockResolvedValue({
      id: 'pension-1',
      pension_number: 'LS-PEN-2026-000001',
      monthly_amount: 1000,
    });

    const result = await pensionsService.processPensionApplication(
      'application-1',
      { action: 'APPROVE' },
      { userId: 'staff-1', username: 'pensions-staff' }
    );

    expect(pensionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        citizenId: 'citizen-1',
        pensionType: 'OLD_AGE',
        pensionNumber: 'LS-PEN-2026-000001',
        monthlyAmount: 1000,
      }),
      expect.any(Function)
    );
    expect(result.status).toBe('APPROVED');
    expect(client.query).toHaveBeenCalledWith('COMMIT');
    expect(notificationService.notify).toHaveBeenCalledWith(
      'user-citizen-1',
      'Pension application approved',
      'Your pension application APP-1 was approved. Your pension number is LS-PEN-2026-000001.'
    );
  });
});
