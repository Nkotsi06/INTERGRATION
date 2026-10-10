const settingsRepository = require('../repositories/settingsRepository');
const { loadPublicSettings, clearCache } = require('../config/settingsLoader');
const auditService = require('./auditService');
const { getPublicUrl } = require('../utils/fileStorage');

async function getPublicSettings() {
  const settings = await loadPublicSettings();

  // Convert stored file path into a URL the browser can load
  if (settings.system_logo_path) {
    settings.systemLogoPath = getPublicUrl(settings.system_logo_path);
  } else {
    settings.systemLogoPath = null;
  }

  return settings;
}

async function getAll() {
  return settingsRepository.getAll();
}

async function update(key, value, adminUser) {
  const updated = await settingsRepository.update(key, value);
  clearCache();
  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'SETTING_UPDATED',
    recordType: 'SETTING',
    recordId: key,
    result: 'SUCCESS',
  });
  return updated;
}

async function getLanguages() {
  return settingsRepository.getLanguages();
}

async function getTranslations(code) {
  return settingsRepository.getTranslations(code);
}

async function updateMinistry(id, data, adminUser) {
  const updated = await settingsRepository.updateMinistry(id, data);
  clearCache();
  return updated;
}

module.exports = {
  getPublicSettings,
  getAll,
  update,
  getLanguages,
  getTranslations,
  updateMinistry,
};