jest.mock('../repositories/vehicleRepository', () => ({
  findById: jest.fn(),
}));
jest.mock('../repositories/applicationRepository', () => ({
  findById: jest.fn(),
  updateStatus: jest.fn(),
}));
jest.mock('../repositories/licenceApplicationRepository', () => ({
  findByReference: jest.fn(),
  updateStatus: jest.fn(),
}));
jest.mock('../repositories/vehicleLicenceRepository', () => ({
  create: jest.fn(),
}));
jest.mock('../repositories/serviceRepository', () => ({
  findByCode: jest.fn(),
}));
jest.mock('../services/feeScheduleService', () => ({
  getFeeForService: jest.fn(),
}));
jest.mock('../services/paymentService', () => ({
  recordPayment: jest.fn(),
}));
jest.mock('../services/auditService', () => ({
  log: jest.fn(),
}));
jest.mock('../services/notificationService', () => ({
  notify: jest.fn(),
}));
jest.mock('../repositories/userRepository', () => ({
  findByCitizenId: jest.fn(),
}));
jest.mock('../utils/referenceGenerator', () => ({
  generateReference: jest.fn(),
}));
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

const vehicleRepository = require('../repositories/vehicleRepository');
const applicationRepository = require('../repositories/applicationRepository');
const licenceApplicationRepository = require('../repositories/licenceApplicationRepository');
const vehicleLicenceRepository = require('../repositories/vehicleLicenceRepository');
const serviceRepository = require('../repositories/serviceRepository');
const feeScheduleService = require('../services/feeScheduleService');
const paymentService = require('../services/paymentService');
const userRepository = require('../repositories/userRepository');
const { generateReference } = require('../utils/referenceGenerator');
const { query } = require('../config/database');
const notificationService = require('../services/notificationService');
const trafficService = require('./trafficService');

describe('applyVehicleLicence', () => {
  const citizenId = 'citizen-1';
  const user = { userId: 'user-1', username: 'citizen' };

  beforeEach(() => {
    jest.clearAllMocks();
    vehicleRepository.findById.mockResolvedValue({
      id: 'vehicle-1',
      citizen_id: citizenId,
    });
    vehicleLicenceRepository.create.mockResolvedValue({ id: 'licence-1' });
    serviceRepository.findByCode.mockResolvedValue({
      is_enabled: true,
      fee: '150.00',
    });
    feeScheduleService.getFeeForService.mockResolvedValue({
      amount: '125.00',
      is_active: true,
    });
    userRepository.findByCitizenId.mockResolvedValue({ id: 'account-1' });
    generateReference.mockResolvedValue('VL-2026-00001');
  });

  it('uses the configured fee instead of an amount supplied by the citizen', async () => {
    await trafficService.applyVehicleLicence(citizenId, {
      vehicleId: 'vehicle-1',
      amount: 1,
      feeAmount: 1,
      method: 'BANK_TRANSFER',
    }, user);

    expect(serviceRepository.findByCode).toHaveBeenCalledWith(
      'TRAFFIC',
      'MY_VEHICLE_LICENCES'
    );
    expect(vehicleLicenceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ feeAmount: 125 })
    );
    expect(paymentService.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'MY_VEHICLE_LICENCES',
        amount: 125,
        method: 'BANK_TRANSFER',
      })
    );
  });

  it('rejects mobile-money requests without a valid mobile number before creating a licence', async () => {
    await expect(trafficService.applyVehicleLicence(citizenId, {
      vehicleId: 'vehicle-1',
      method: 'MOBILE_MONEY',
      mobile: ' ',
    }, user)).rejects.toMatchObject({
      statusCode: 400,
      message: 'A valid mobile number is required for mobile money.',
    });

    expect(vehicleLicenceRepository.create).not.toHaveBeenCalled();
    expect(paymentService.recordPayment).not.toHaveBeenCalled();
  });

  it('does not attempt payment when the configured service fee is zero', async () => {
    feeScheduleService.getFeeForService.mockResolvedValue({
      amount: '125.00',
      is_active: false,
    });

    await trafficService.applyVehicleLicence(citizenId, {
      vehicleId: 'vehicle-1',
      method: 'MOBILE_MONEY',
    }, user);

    expect(vehicleLicenceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ feeAmount: 0 })
    );
    expect(paymentService.recordPayment).not.toHaveBeenCalled();
  });
});

describe('Traffic application information requests', () => {
  const staffUser = { userId: 'staff-1', username: 'traffic-staff' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores the requested details and notifies the citizen', async () => {
    applicationRepository.findById.mockResolvedValue({
      id: 'application-1',
      service: 'TRAFFIC',
      status: 'SUBMITTED',
      citizen_id: 'citizen-1',
      reference_number: 'TR-001',
    });
    applicationRepository.updateStatus.mockResolvedValue();
    userRepository.findByCitizenId.mockResolvedValue({ id: 'account-1' });

    await expect(trafficService.processApplication(
      'application-1',
      'REQUEST_INFO',
      { details: 'Please provide proof of vehicle ownership.' },
      staffUser
    )).resolves.toEqual({ status: 'INFO_REQUESTED' });

    expect(applicationRepository.updateStatus).toHaveBeenCalledWith(
      'application-1',
      'INFO_REQUESTED',
      'staff-1',
      'Information requested: Please provide proof of vehicle ownership.'
    );
    expect(notificationService.notify).toHaveBeenCalledWith(
      'account-1',
      'Traffic application update',
      expect.stringContaining('Please provide proof of vehicle ownership.')
    );
  });

  it('rejects empty information requests without changing application status', async () => {
    await expect(trafficService.processApplication(
      'application-1',
      'REQUEST_INFO',
      { details: '   ' },
      staffUser
    )).rejects.toMatchObject({
      statusCode: 400,
      message: 'Provide details about the information required.',
    });

    expect(applicationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('accepts a response only from the owning citizen and notifies Traffic staff', async () => {
    licenceApplicationRepository.findByReference.mockResolvedValue({
      id: 'application-1',
      citizen_id: 'citizen-1',
      status: 'INFO_REQUESTED',
      reference_number: 'TR-001',
    });
    query.mockResolvedValue({ rows: [{ id: 'traffic-staff-account' }] });
    licenceApplicationRepository.updateStatus.mockResolvedValue();

    await expect(trafficService.submitTrafficInformationResponse(
      'TR-001',
      'citizen-1',
      'Here is my vehicle ownership information.',
      'citizen-user-1'
    )).resolves.toEqual({ status: 'UNDER_REVIEW' });

    expect(licenceApplicationRepository.updateStatus).toHaveBeenCalledWith(
      'application-1',
      'UNDER_REVIEW',
      'citizen-user-1',
      'Citizen information response: Here is my vehicle ownership information.'
    );
    expect(notificationService.notify).toHaveBeenCalledWith(
      'traffic-staff-account',
      'Traffic application information received',
      expect.stringContaining('TR-001')
    );
  });

  it("does not disclose or update another citizen's application", async () => {
    licenceApplicationRepository.findByReference.mockResolvedValue({
      id: 'application-1',
      citizen_id: 'other-citizen',
      status: 'INFO_REQUESTED',
    });

    await expect(trafficService.submitTrafficInformationResponse(
      'TR-001',
      'citizen-1',
      'response',
      'citizen-user-1'
    )).rejects.toMatchObject({ statusCode: 404 });

    expect(licenceApplicationRepository.updateStatus).not.toHaveBeenCalled();
  });
});
