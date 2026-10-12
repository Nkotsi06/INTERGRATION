const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO marriage_certificates
      (certificate_number, spouse1_citizen_id, spouse2_citizen_id, spouse2_name,
       marriage_date, place_of_marriage, officiant, status, issued_by, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'ISSUED',$8,$9) RETURNING *`,
    [
      data.certificateNumber,
      data.spouse1CitizenId,
      data.spouse2CitizenId || null,
      data.spouse2Name || null,
      data.marriageDate,
      data.placeOfMarriage || null,
      data.officiant || null,
      data.issuedBy,
      data.notes || null,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    `SELECT * FROM marriage_certificates
     WHERE spouse1_citizen_id = $1 OR spouse2_citizen_id = $1
     ORDER BY marriage_date DESC`,
    [citizenId]
  );
  return result.rows;
}

async function findAll() {
  const result = await query(
    'SELECT * FROM marriage_certificates ORDER BY issued_at DESC LIMIT 200'
  );
  return result.rows;
}

module.exports = { create, findByCitizen, findAll };