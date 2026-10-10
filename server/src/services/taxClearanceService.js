const taxClearanceRepository = require('../repositories/taxClearanceRepository');
const { generateTaxClearancePDF } = require('../utils/pdfGenerator');

async function generatePDF(cert) {
  return generateTaxClearancePDF(cert);
}

async function findByCitizen(citizenId) {
  return taxClearanceRepository.findByCitizen(citizenId);
}

module.exports = { generatePDF, findByCitizen };