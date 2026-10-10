const settingsRepository = require('../repositories/settingsRepository');
const logger = require('../utils/logger');

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

async function loadPublicSettings() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return cache;
  }

  try {
    const settings = await settingsRepository.getAllPublic();
    const ministries = await settingsRepository.getMinistries();
    const documentTypes = await settingsRepository.getDocumentTypes();
    const statusTypes = await settingsRepository.getStatusTypes();
    const referenceFormats = await settingsRepository.getReferenceFormats();

    cache = {
      ...settings,
      ministries,
      documentTypes,
      statusTypes,
      referenceFormats,
    };
    cacheTime = Date.now();
    return cache;
  } catch (err) {
    logger.error('Failed to load settings:', err);
    throw err;
  }
}

function clearCache() {
  cache = null;
  cacheTime = 0;
}

module.exports = { loadPublicSettings, clearCache };