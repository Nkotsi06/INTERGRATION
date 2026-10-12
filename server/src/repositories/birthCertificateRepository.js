const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO birth_certificates
      (citizen_id, certificate_number, date_of_birth, place_of_birth, father_name, mother_name, status, issued_by, notes)
     VALUES ($1,$2,$3,$4,$5,$6,'ISSUED',$7,$8) RETURNING *`,
    [
      data.citizenId,
      data.certificateNumber,
      data.dateOfBirth,
      data.placeOfBirth || null,
      data.fatherName || null,
      data.motherName || null,
      data.issuedBy,
      data.notes || null,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM birth_certificates WHERE citizen_id = $1 ORDER BY registered_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findAll() {
  const result = await query(
    'SELECT * FROM birth_certificates ORDER BY registered_at DESC LIMIT 200'
  );
  return result.rows;
}

module.exports = { create, findByCitizen, findAll };