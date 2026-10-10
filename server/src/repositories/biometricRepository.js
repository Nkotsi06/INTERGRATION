const { query } = require('../config/database');

async function upsert(data) {
  const result = await query(
    `INSERT INTO biometrics (
        citizen_id,
        fingerprint_left_thumb,
        fingerprint_left_index,
        fingerprint_right_thumb,
        fingerprint_right_index,
        facial_image,
        enrolled_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (citizen_id) DO UPDATE SET
       fingerprint_left_thumb  = EXCLUDED.fingerprint_left_thumb,
       fingerprint_left_index  = EXCLUDED.fingerprint_left_index,
       fingerprint_right_thumb = EXCLUDED.fingerprint_right_thumb,
       fingerprint_right_index = EXCLUDED.fingerprint_right_index,
       facial_image            = EXCLUDED.facial_image,
       enrolled_by             = EXCLUDED.enrolled_by,
       updated_at              = NOW()
     RETURNING *`,
    [
      data.citizenId,
      data.fingerprint_left_thumb,
      data.fingerprint_left_index,
      data.fingerprint_right_thumb,
      data.fingerprint_right_index,
      data.facial_image,
      data.enrolledBy,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM biometrics WHERE citizen_id = $1',
    [citizenId]
  );
  return result.rows[0];
}

module.exports = { upsert, findByCitizen };