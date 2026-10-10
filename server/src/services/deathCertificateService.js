const deathCertificateRepository = require('../repositories/deathCertificateRepository');

async function checkByNationalId(nationalId) {
  const dc = await deathCertificateRepository.findByNationalId(nationalId);
  return dc ? { found: true, date: dc.date_of_death } : { found: false };
}

async function checkByCitizenId(citizenId) {
  const dc = await deathCertificateRepository.findByCitizen(citizenId);
  return dc ? { found: true, date: dc.date_of_death } : { found: false };
}

module.exports = { checkByNationalId, checkByCitizenId };