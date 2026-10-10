const { query } = require('../config/database');

async function getAllPublic() {
  const result = await query('SELECT key, value FROM system_settings WHERE is_public = true');
  const settings = {};
  result.rows.forEach((row) => {
    settings[row.key] = row.value;
  });
  return settings;
}

async function getAll() {
  const result = await query('SELECT * FROM system_settings ORDER BY category, key');
  return result.rows;
}

async function getByKey(key) {
  const result = await query('SELECT * FROM system_settings WHERE key = $1', [key]);
  return result.rows[0];
}

async function update(key, value) {
  const result = await query(
    'UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING *',
    [value, key]
  );
  return result.rows[0];
}

async function getMinistries() {
  const result = await query(
    'SELECT id, name, code, colour_hex, icon_name, display_order FROM ministries WHERE is_active = true ORDER BY display_order'
  );
  return result.rows;
}

async function updateMinistry(id, data) {
  const fields = [];
  const params = [];
  const allowed = ['name', 'colour_hex', 'icon_name', 'display_order', 'is_active'];
  Object.keys(data).forEach((key) => {
    if (allowed.includes(key)) {
      params.push(data[key]);
      fields.push(`${key} = $${params.length}`);
    }
  });
  params.push(id);
  const result = await query(
    `UPDATE ministries SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function getDocumentTypes() {
  const result = await query(
    'SELECT * FROM document_types WHERE is_active = true ORDER BY display_order'
  );
  return result.rows;
}

async function getStatusTypes() {
  const result = await query(
    'SELECT * FROM status_types WHERE is_active = true ORDER BY display_order'
  );
  return result.rows;
}

async function getReferenceFormats() {
  const result = await query('SELECT * FROM reference_formats ORDER BY name');
  return result.rows;
}

async function getLanguages() {
  const result = await query('SELECT * FROM languages WHERE is_active = true ORDER BY name');
  return result.rows;
}

async function getTranslations(langCode) {
  const result = await query(
    'SELECT translation_key, translation_value FROM translations WHERE language_code = $1',
    [langCode]
  );
  const translations = {};
  result.rows.forEach((row) => {
    translations[row.translation_key] = row.translation_value;
  });
  return translations;
}

module.exports = {
  getAllPublic, getAll, getByKey, update,
  getMinistries, updateMinistry,
  getDocumentTypes, getStatusTypes, getReferenceFormats,
  getLanguages, getTranslations,
};