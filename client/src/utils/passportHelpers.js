const FILLER = '<';
const MONTHS = [
  'Jan/Janv.', 'Feb/Févr.', 'Mar/Mars', 'Apr/Avr.', 'May/Mai', 'Jun/Juin',
  'Jul/Juil.', 'Aug/Août', 'Sep/Sept.', 'Oct/Oct.', 'Nov/Nov.', 'Dec/Déc.',
];

function charValue(character) {
  if (character >= '0' && character <= '9') return Number(character);
  if (character >= 'A' && character <= 'Z') return character.charCodeAt(0) - 55;
  if (character === FILLER) return 0;
  throw new Error(`Invalid MRZ character: "${character}"`);
}

function isValidIsoDate(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function toYyMmDd(isoDate) {
  if (!isValidIsoDate(isoDate)) {
    throw new Error(`Date must be a valid YYYY-MM-DD date, got "${isoDate}"`);
  }
  return isoDate.slice(2).replace(/-/g, '');
}

function pad(value, length) {
  return (value + FILLER.repeat(length)).slice(0, length);
}

function cleanName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/['’`]/g, '')
    .replace(/[^A-Z]+/g, FILLER)
    .replace(/^<+|<+$/g, '');
}

function normalizeMrzCode(value, label) {
  const normalized = String(value || '').toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(`${label} must be a three-letter code`);
  }
  return normalized;
}

export function mrzCheckDigit(text) {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let index = 0; index < text.length; index += 1) {
    sum += charValue(text[index]) * weights[index % 3];
  }
  return String(sum % 10);
}

export function buildMrzLines({
  issuingState,
  surname,
  givenNames,
  passportNumber,
  nationality,
  birthDate,
  sex,
  expiryDate,
  personalNumber = '',
}) {
  const stateCode = normalizeMrzCode(issuingState, 'Issuing state');
  const nationalityCode = normalizeMrzCode(nationality, 'Nationality');
  const namePart = `${cleanName(surname)}<<${cleanName(givenNames)}`;
  const line1 = `P<${stateCode}${pad(namePart, 39)}`;

  const number = String(passportNumber || '')
    .toUpperCase()
    .replace(/-/g, FILLER);
  if (!/^[A-Z0-9<]*$/.test(number)) {
    throw new Error('Passport number contains characters that are not valid in an MRZ');
  }
  if (number.length > 23) {
    throw new Error('Passport number is too long to fit the TD3 MRZ fields');
  }
  const documentNumberOverflow = number.slice(9);
  const number9 = pad(number.slice(0, 9), 9);
  const birth = toYyMmDd(birthDate);
  const expiry = toYyMmDd(expiryDate);
  const sexCharacter = sex === 'M' || sex === 'F' ? sex : FILLER;
  // ICAO places an overlength document number in optional data, which takes priority over the personal number.
  const personal = documentNumberOverflow
    ? ''
    : String(personalNumber || '').toUpperCase();
  if (!/^[A-Z0-9<]*$/.test(personal)) {
    throw new Error('Personal number contains characters that are not valid in an MRZ');
  }
  if (personal.length > 14) {
    throw new Error('Personal number is longer than the 14-character MRZ field');
  }
  const optionalData = documentNumberOverflow + personal;
  if (optionalData.length > 14) {
    throw new Error('Passport number overflow is too long for the TD3 optional-data field');
  }
  const personal14 = pad(optionalData, 14);
  const personalCheck = optionalData.length === 0 ? '0' : mrzCheckDigit(personal14);
  const numberCheck = documentNumberOverflow ? FILLER : mrzCheckDigit(number9);
  const birthCheck = mrzCheckDigit(birth);
  const expiryCheck = mrzCheckDigit(expiry);
  const composite = mrzCheckDigit(
    number9 + numberCheck + birth + birthCheck +
    expiry + expiryCheck + personal14 + personalCheck
  );
  const line2 =
    number9 + numberCheck + nationalityCode + birth + birthCheck +
    sexCharacter + expiry + expiryCheck + personal14 + personalCheck + composite;

  if (line1.length !== 44 || line2.length !== 44) {
    throw new Error('Passport MRZ lines must each contain exactly 44 characters');
  }
  return [line1, line2];
}

export function formatPassportDate(isoDate) {
  if (!isValidIsoDate(isoDate)) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${year}`;
}

export function computeExpiry(issueIsoDate, validityYears) {
  if (!isValidIsoDate(issueIsoDate)) {
    throw new Error('Issue date must be a valid YYYY-MM-DD date');
  }
  if (!Number.isInteger(validityYears) || validityYears < 1) {
    throw new Error('Passport validity must be a positive whole number of years');
  }

  const [year, month, day] = issueIsoDate.split('-').map(Number);
  const expiry = new Date(Date.UTC(year + validityYears, month - 1, day));
  expiry.setUTCDate(expiry.getUTCDate() - 1);
  return expiry.toISOString().slice(0, 10);
}
