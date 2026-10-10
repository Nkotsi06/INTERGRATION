const settingsRepository = require('../repositories/settingsRepository');
const { clearCache } = require('../config/settingsLoader');
const { getPublicUrl } = require('../utils/fileStorage');

async function updateLogo(file, adminUser) {
  const relative = file.path;
  const updated = await settingsRepository.update('system_logo_path', relative);
  clearCache();
  return { ...updated, url: getPublicUrl(relative) };
}

module.exports = { updateLogo };