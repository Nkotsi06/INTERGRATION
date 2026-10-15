const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO marriage_certificates
       (application_id, citizen_id, certificate_number,
        spouse1_full_name, spouse1_national_id,
        spouse2_full_name, spouse2_national_id,
        marriage_date, marriage_place, marriage_officiant,
        request_type, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, COALESCE($12,'PENDING'))
     RETURNING *`,
    [
      data.applicationId || null,
      data.citizenId || null,
      data.certificateNumber,
      data.spouse1FullName || null,
      data.spouse1NationalId || null,
      data.spouse2FullName || data.spouse2Name || null,
      data.spouse2NationalId || null,
      data.marriageDate,
      data.marriagePlace || data.placeOfMarriage || null,
      data.marriageOfficiant || data.officiant || null,
      data.requestType || 'NEW',
      data.status || null,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM marriage_certificates WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findAll() {
  const result = await query(
    'SELECT * FROM marriage_certificates ORDER BY created_at DESC LIMIT 200'
  );
  return result.rows;
}

module.exports = { create, findByCitizen, findAll };