const { query } = require('../config/database');

async function findByNationalId(nationalId) {
  const result = await query(
    `SELECT dc.* FROM death_certificates dc
     JOIN citizens c ON c.id = dc.citizen_id
     WHERE c.national_id = $1 LIMIT 1`,
    [nationalId]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM death_certificates WHERE citizen_id = $1 ORDER BY registered_at DESC',
    [citizenId]
  );
  return result.rows[0];
}

async function create(data) {
  const result = await query(
    `INSERT INTO death_certificates
      (citizen_id, certificate_number, date_of_death, place_of_death, cause_of_death, status, issued_by, notes)
     VALUES ($1,$2,$3,$4,$5,'ISSUED',$6,$7) RETURNING *`,
    [
      data.citizenId,
      data.certificateNumber,
      data.dateOfDeath,
      data.placeOfDeath || null,
      data.causeOfDeath || null,
      data.issuedBy,
      data.notes || null,
    ]
  );
  return result.rows[0];
}

async function findAll() {
  const result = await query(
    'SELECT * FROM death_certificates ORDER BY registered_at DESC LIMIT 200'
  );
  return result.rows;
}

module.exports = { findByNationalId, findByCitizen, create, findAll };