const { query } = require('../config/database');

async function findByNationalId(nationalId) {
  const result = await query(
    `SELECT dc.* FROM death_certificates_new dc
     JOIN citizens c ON c.id = dc.citizen_id
     WHERE c.national_id = $1 AND dc.status = 'ISSUED'
     ORDER BY dc.issued_at DESC NULLS LAST
     LIMIT 1`,
    [nationalId]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    `SELECT * FROM death_certificates_new
     WHERE citizen_id = $1 AND status = 'ISSUED'
     ORDER BY issued_at DESC NULLS LAST
     LIMIT 1`,
    [citizenId]
  );
  return result.rows[0];
}

async function create(data) {
  const result = await query(
    `INSERT INTO death_certificates_new
       (application_id, citizen_id, certificate_number,
        deceased_full_name, deceased_national_id,
        date_of_death, place_of_death, cause_of_death,
        informant_full_name, informant_relationship, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, COALESCE($11,'PENDING'))
     RETURNING *`,
    [
      data.applicationId || null,
      data.citizenId,
      data.certificateNumber,
      data.deceasedFullName || null,
      data.deceasedNationalId || data.deceasedNationalID || null,
      data.dateOfDeath,
      data.placeOfDeath || null,
      data.causeOfDeath || null,
      data.informantFullName || null,
      data.informantRelationship || null,
      data.status || null,
    ]
  );
  return result.rows[0];
}

// Returns every row. No silent LIMIT.
async function findAll() {
  const result = await query(
    'SELECT * FROM death_certificates_new ORDER BY created_at DESC'
  );
  return result.rows;
}

module.exports = { findByNationalId, findByCitizen, create, findAll };