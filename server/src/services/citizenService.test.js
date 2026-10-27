jest.mock('../repositories/biometricRepository', () => ({
  findByCitizen: jest.fn(),
}));
jest.mock('../repositories/documentRepository', () => ({
  findLatestByType: jest.fn(),
}));

const biometricRepository = require('../repositories/biometricRepository');
const documentRepository = require('../repositories/documentRepository');
const citizenService = require('./citizenService');

describe('findPhotoForCitizen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the Home Affairs biometric image rather than a passport photo document', async () => {
    biometricRepository.findByCitizen.mockResolvedValue({
      facial_image: 'data:image/jpeg;base64,authorized',
    });

    await expect(citizenService.findPhotoForCitizen('citizen-1')).resolves.toEqual({
      kind: 'dataurl',
      dataUrl: 'data:image/jpeg;base64,authorized',
    });
    expect(documentRepository.findLatestByType).not.toHaveBeenCalled();
  });

  it('does not fall back to a passport photo when no biometric photo exists', async () => {
    biometricRepository.findByCitizen.mockResolvedValue(null);

    await expect(citizenService.findPhotoForCitizen('citizen-1')).resolves.toBeNull();
    expect(documentRepository.findLatestByType).not.toHaveBeenCalled();
  });
});
