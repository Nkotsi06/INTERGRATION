const documentRepository = require('../repositories/documentRepository');
const documentTypeRepository = require('../repositories/documentTypeRepository');
const auditService = require('./auditService');
const { deleteFile, getPublicUrl } = require('../utils/fileStorage');
const { query } = require('../config/database');

// -------------------------------------------------------------
// Upload
// -------------------------------------------------------------
async function upload(
  citizenId,
  file,
  documentTypeCode,
  user,
  registrationId = null
) {
  const documentType = await documentTypeRepository.findByCode(documentTypeCode);
  if (!documentType) throw new Error('Invalid document type');

  // When the citizen does not exist yet, attach a marker to the file path
  // so the record can be re-linked after the citizen is created.
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

// -------------------------------------------------------------
// Read
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Verify
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Delete — ownership enforced for citizens, staff and admin can delete any
// -------------------------------------------------------------
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

  await documentRepository.remove(id);
  deleteFile(doc.file_path);
  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'DOCUMENT_DELETED',
    recordType: 'DOCUMENT',
    recordId: id,
    result: 'SUCCESS',
  });
}

// -------------------------------------------------------------
// Re-link documents captured against a registration to the new citizen
// -------------------------------------------------------------
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