const documentRepository = require('../repositories/documentRepository');
const documentTypeRepository = require('../repositories/documentTypeRepository');
const auditService = require('./auditService');
const { deleteFile, getPublicUrl } = require('../utils/fileStorage');
const logger = require('../utils/logger');
const { query } = require('../config/database');

async function upload(citizenId, file, documentTypeCode, user, registrationId = null) {
  const documentType = await documentTypeRepository.findByCode(documentTypeCode);
  if (!documentType) throw new Error('Invalid document type');

  const filePath = registrationId
    ? `${file.path}#registration-${registrationId}`
    : file.path;

  const doc = await documentRepository.create({
    citizenId: citizenId || null,
    documentTypeCode,
    filePath,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
    uploadedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'DOCUMENT_UPLOADED',
    recordType: 'DOCUMENT',
    recordId: doc.id,
    result: 'SUCCESS',
  });

  return { ...doc, fileUrl: getPublicUrl(doc.file_path) };
}

async function findByCitizen(citizenId) {
  if (!citizenId) return [];
  const docs = await documentRepository.findByCitizen(citizenId);
  return docs.map((d) => ({ ...d, fileUrl: getPublicUrl(d.file_path) }));
}

async function findById(id) {
  const doc = await documentRepository.findById(id);
  if (!doc) return null;
  return { ...doc, fileUrl: getPublicUrl(doc.file_path) };
}

async function verify(id, action, reason, staffUser) {
  const status = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
  const updated = await documentRepository.verify(id, {
    status,
    verifiedBy: staffUser.userId,
    rejectionReason: reason,
  });
  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `DOCUMENT_${status}`,
    recordType: 'DOCUMENT',
    recordId: id,
    result: 'SUCCESS',
  });
  return updated;
}

// Group D — order is deliberate:
//   1. Check ownership and permissions.
//   2. Delete the DB row and commit.
//   3. Delete the file from disk AFTER the commit.
//   4. If the file delete fails, log it as an orphan for cleanup
//      and still report success to the caller.
// A successful DB delete must not be reported as a failure just
// because the file is gone or the disk is read-only.
async function remove(id, user) {
  const doc = await documentRepository.findById(id);
  if (!doc) return;

  const isStaffOrAdmin =
    user.role === 'HOME_AFFAIRS' || user.role === 'ADMIN';

  if (!isStaffOrAdmin) {
    const citizenId = user.citizenId || null;
    if (!citizenId || doc.citizen_id !== citizenId) {
      const err = new Error('You cannot delete this document.');
      err.statusCode = 403;
      throw err;
    }
  }

  // Step 1: DB delete first.
  await documentRepository.remove(id);

  // Step 2: audit BEFORE we try the file, so the record exists even
  // if the file delete fails.
  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'DOCUMENT_DELETED',
    recordType: 'DOCUMENT',
    recordId: id,
    result: 'SUCCESS',
  });

  // Step 3: file delete after commit. Wrap it.
  try {
    deleteFile(doc.file_path);
  } catch (err) {
    logger.warn(
      `[documentService.remove] DB row ${id} deleted but the file could not be removed from disk: ${err.message}. File path: ${doc.file_path}. Mark as orphan for cleanup.`
    );
  }
}

async function relinkRegistrationDocuments(registrationId, citizenId) {
  if (!registrationId || !citizenId) return;

  const marker = `#registration-${registrationId}`;

  await query(
    `UPDATE citizen_documents
     SET citizen_id = $1,
         file_path = REPLACE(file_path, $2, '')
     WHERE citizen_id IS NULL
       AND file_path LIKE $3`,
    [citizenId, marker, `%${marker}%`]
  );
}

module.exports = {
  upload,
  findByCitizen,
  findById,
  verify,
  remove,
  relinkRegistrationDocuments,
};