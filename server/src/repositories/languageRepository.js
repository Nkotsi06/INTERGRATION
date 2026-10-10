const { query } = require('../config/database');

async function findAll() {
  const result = await query(
    'SELECT * FROM languages WHERE is_active = true ORDER BY name'
  );
  return result.rows;
}

async function getTranslations(code) {
  const result = await query(
    'SELECT translation_key, translation_value FROM translations WHERE language_code = $1',
    [code]
  );
  const t = {};
  result.rows.forEach((row) => {
    t[row.translation_key] = row.translation_value;
  });
  return t;
}

module.exports = { findAll, getTranslations };