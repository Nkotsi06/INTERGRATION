const { query } = require('../config/database');

async function create(doc) {
  const result = await query(
    `INSERT INTO citizen_documents (
       citizen_id,
       document_type_code,
       file_path,
       file_name,
       file_type,
       file_size,
       status,
       uploaded_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      doc.citizenId || null,
      doc.documentTypeCode,
      doc.filePath,
      doc.fileName,
      doc.fileType,
      doc.fileSize,
      'PENDING',
      doc.uploadedBy,
    ]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM citizen_documents WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM citizen_documents WHERE citizen_id = $1 ORDER BY uploaded_at DESC',
    [citizenId]
  );
  return result.rows;
}

// New: latest document of a specific type for a citizen.
async function findLatestByType(citizenId, documentTypeCode) {
  const result = await query(
    `SELECT * FROM citizen_documents
     WHERE citizen_id = $1 AND document_type_code = $2
     ORDER BY uploaded_at DESC
     LIMIT 1`,
    [citizenId, documentTypeCode]
  );
  return result.rows[0];
}

async function verify(id, data) {
  const result = await query(
    `UPDATE citizen_documents
     SET status = $1,
         verified_by = $2,
         verified_at = NOW(),
         rejection_reason = $3
     WHERE id = $4
     RETURNING *`,
    [data.status, data.verifiedBy, data.rejectionReason || null, id]
  );
  return result.rows[0];
}

async function remove(id) {
  await query('DELETE FROM citizen_documents WHERE id = $1', [id]);
}

module.exports = { create, findById, findByCitizen, findLatestByType, verify, remove };