const { query } = require('../config/database');

async function create(cert) {
  const result = await query(
    `INSERT INTO tax_clearances (citizen_id, certificate_id, tin, legal_name, trading_name,
      nature_of_business, address, date_issued, valid_until, verification_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9) RETURNING *`,
    [
      cert.citizenId, cert.certificateId, cert.tin, cert.legalName,
      cert.tradingName, cert.natureOfBusiness, cert.address,
      cert.validUntil, cert.verificationUrl,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM tax_clearances WHERE citizen_id = $1 ORDER BY date_issued DESC LIMIT 1',
    [citizenId]
  );
  return result.rows[0];
}

module.exports = { create, findByCitizen };