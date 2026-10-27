jest.mock('../repositories/documentRepository', () => ({
  create: jest.fn(),
  findByCitizen: jest.fn(),
  findById: jest.fn(),
}));
jest.mock('../repositories/documentTypeRepository', () => ({
  findByCode: jest.fn(),
}));
jest.mock('../services/auditService', () => ({
  log: jest.fn(),
}));
jest.mock('../utils/fileStorage', () => ({
  deleteFile: jest.fn(),
  getPublicUrl: jest.fn(),
}));
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

const documentRepository = require('../repositories/documentRepository');
const documentTypeRepository = require('../repositories/documentTypeRepository');
const documentService = require('./documentService');

describe('documentService.upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects passport-photo uploads without persisting a document', async () => {
    await expect(documentService.upload(
      'citizen-1',
      { path: 'C:\\private\\upload.jpg' },
      'PASSPORT_PHOTO',
      { userId: 'citizen-user-1' }
    )).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Passport photograph uploads are not accepted'),
    });

    expect(documentTypeRepository.findByCode).not.toHaveBeenCalled();
    expect(documentRepository.create).not.toHaveBeenCalled();
  });
});
