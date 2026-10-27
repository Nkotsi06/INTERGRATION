jest.mock('../config/database', () => ({
  query: jest.fn(),
}));
jest.mock('../repositories/citizenRepository', () => ({
  findById: jest.fn(),
}));
jest.mock('../repositories/applicationRepository', () => ({
  create: jest.fn(),
}));
jest.mock('../repositories/signatureRepository', () => ({
  create: jest.fn(),
}));
jest.mock('../repositories/biometricRepository', () => ({
  findByCitizen: jest.fn(),
}));
jest.mock('../services/notificationService', () => ({
  notify: jest.fn(),
}));
jest.mock('../utils/referenceGenerator', () => ({
  generateReference: jest.fn(),
}));

const { query } = require('../config/database');
const citizenRepository = require('../repositories/citizenRepository');
const biometricRepository = require('../repositories/biometricRepository');
const applicationRepository = require('../repositories/applicationRepository');
const nationalIdService = require('./nationalIdService');

describe('National ID application submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    query
      .mockResolvedValueOnce({ rows: [{ id: 'birth-document-1' }] })
      .mockResolvedValueOnce({ rows: [] });
    citizenRepository.findById.mockResolvedValue({ id: 'citizen-1' });
    biometricRepository.findByCitizen.mockResolvedValue(null);
  });

  it('requires the authorized Home Affairs biometric image at the backend', async () => {
    await expect(nationalIdService.submitApplication(
      'citizen-1',
      {
        signature: 'data:image/png;base64,signature',
        photo: 'data:image/jpeg;base64,untrusted',
      },
      { userId: 'citizen-user-1' }
    )).rejects.toMatchObject({
      statusCode: 400,
      message: 'Home Affairs must capture your photograph before you can apply for a National ID.',
    });

    expect(applicationRepository.create).not.toHaveBeenCalled();
  });
});
