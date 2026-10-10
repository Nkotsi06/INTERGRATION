const languageRepository = require('../repositories/languageRepository');

async function getLanguages() {
  return languageRepository.findAll();
}

async function getTranslations(code) {
  return languageRepository.getTranslations(code);
}

module.exports = { getLanguages, getTranslations };