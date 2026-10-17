const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO birth_certificates
       (application_id, citizen_id, certificate_number,
        child_full_name, child_date_of_birth, child_gender,
        place_of_birth, mother_full_name, mother_national_id,
        father_full_name, father_national_id, request_type, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, COALESCE($13,'PENDING'))
     RETURNING *`,
    [
      data.applicationId || null,
      data.citizenId,
      data.certificateNumber,
      data.childFullName || data.fullName || null,
      data.childDateOfBirth || data.dateOfBirth || null,
      data.childGender || data.gender || null,
      data.placeOfBirth || null,
      data.motherFullName || data.motherName || null,
      data.motherNationalId || null,
      data.fatherFullName || data.fatherName || null,
      data.fatherNationalId || null,
      data.requestType || 'NEW',
      data.status || null,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM birth_certificates WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

// Returns every row. The pagination responsibility sits with the
// caller: HACertificates.jsx slices in the browser, MyCertificates
// renders the whole list. No silent LIMIT.
async function findAll() {
  const result = await query(
    'SELECT * FROM birth_certificates ORDER BY created_at DESC'
  );
  return result.rows;
}

module.exports = { create, findByCitizen, findAll };