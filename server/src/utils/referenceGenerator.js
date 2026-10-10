const referenceFormatRepository = require('../repositories/referenceFormatRepository');
const { query } = require('../config/database');

// -------------------------------------------------------------
// Generic reference generator (used by applications, payments, etc.)
// -------------------------------------------------------------
async function generateReference(formatName) {
  const format = await referenceFormatRepository.getByName(formatName);
  if (!format) throw new Error(`Reference format not found: ${formatName}`);

  const year = new Date().getFullYear();
  const yearStr = format.year_format === 'YYYY' ? year : String(year).slice(-2);

  const result = await query(
    `SELECT COUNT(*) AS count FROM applications WHERE reference_number LIKE $1`,
    [`${format.prefix}-${yearStr}-%`]
  );
  const nextSeq = String(parseInt(result.rows[0].count, 10) + 1).padStart(
    format.sequence_length,
    '0'
  );

  return `${format.prefix}-${yearStr}-${nextSeq}`;
}

async function generateCaseNumber() {
  return generateReference('POLICE_CASE');
}

// -------------------------------------------------------------
// Lesotho National ID generator
// -------------------------------------------------------------
// Format: 13 digits.
//   - 6 digits: date of birth (YYMMDD, computed from dateOfBirth)
//   - 1 digit:  gender indicator (odd = male, even = female)
//   - 6 digits: sequential unique number
//
// Example: born 1990-05-15, male -> 900515 + 1 + 000042 = 9005151000042
// -------------------------------------------------------------
async function generateNationalId(dateOfBirth, gender) {
  // Step 1: YYMMDD from date of birth
  const dob = new Date(dateOfBirth);
  const yy = String(dob.getFullYear()).slice(-2);
  const mm = String(dob.getMonth() + 1).padStart(2, '0');
  const dd = String(dob.getDate()).padStart(2, '0');
  const dobPart = `${yy}${mm}${dd}`;

  // Step 2: Gender digit (odd = male, even = female)
  const genderDigit = gender === 'MALE' ? '1' : '2';

  // Step 3: Find next sequence number for this DOB + gender
  const prefix = `${dobPart}${genderDigit}`;
  const result = await query(
    `SELECT COUNT(*) AS count FROM citizens WHERE national_id LIKE $1`,
    [`${prefix}%`]
  );
  const nextSeq = String(parseInt(result.rows[0].count, 10) + 1).padStart(6, '0');

  return `${prefix}${nextSeq}`;
}

module.exports = { generateReference, generateCaseNumber, generateNationalId };