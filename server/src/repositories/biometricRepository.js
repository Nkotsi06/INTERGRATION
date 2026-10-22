const { query } = require('../config/database');

let columnsAltered = false;
async function ensureTextColumns() {
  if (columnsAltered) return;
  columnsAltered = true;
  try {
    await query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'biometrics') THEN
          ALTER TABLE biometrics 
            ALTER COLUMN fingerprint_left_thumb TYPE TEXT,
            ALTER COLUMN fingerprint_left_index TYPE TEXT,
            ALTER COLUMN fingerprint_right_thumb TYPE TEXT,
            ALTER COLUMN fingerprint_right_index TYPE TEXT,
            ALTER COLUMN facial_image TYPE TEXT;
        END IF;
      END $$;
    `);
  } catch (err) {
    // If table doesn't exist yet or already altered, proceed safely
  }
}

async function upsert(data) {
  await ensureTextColumns();
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
      data.fingerprint_left_thumb ? String(data.fingerprint_left_thumb) : null,
      data.fingerprint_left_index ? String(data.fingerprint_left_index) : null,
      data.fingerprint_right_thumb ? String(data.fingerprint_right_thumb) : null,
      data.fingerprint_right_index ? String(data.fingerprint_right_index) : null,
      data.facial_image ? String(data.facial_image) : null,
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
