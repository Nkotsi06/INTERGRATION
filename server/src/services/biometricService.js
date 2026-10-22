const biometricRepository = require('../repositories/biometricRepository');
const biometricUtils = require('../utils/biometricUtils');
const auditService = require('./auditService');
const logger = require('../utils/logger');

// -------------------------------------------------------------
// Normalise fingerprint keys from different naming styles
// -------------------------------------------------------------
// Accepted inputs:
//   'Left Thumb', 'Left Index', 'Right Thumb', 'Right Index'   (frontend default)
//   'left_thumb', 'left_index', 'right_thumb', 'right_index'   (backend style)
//   'leftThumb',  'leftIndex',  'rightThumb',  'rightIndex'    (camelCase)
//   'left- thumb', 'left- index', ...                          (defensive)
// -------------------------------------------------------------
function normaliseFingerprints(input) {
  const aliases = {
    left_thumb:  ['left_thumb',  'Left Thumb',  'leftThumb',  'left- thumb'],
    left_index:  ['left_index',  'Left Index',  'leftIndex',  'left- index'],
    right_thumb: ['right_thumb', 'Right Thumb', 'rightThumb', 'right- thumb'],
    right_index: ['right_index', 'Right Index', 'rightIndex', 'right- index'],
  };

  const output = {
    left_thumb: null,
    left_index: null,
    right_thumb: null,
    right_index: null,
  };

  Object.entries(aliases).forEach(([dbKey, list]) => {
    for (const alias of list) {
      if (input && input[alias]) {
        output[dbKey] = input[alias];
        break;
      }
    }
  });

  return output;
}

// -------------------------------------------------------------
// Enrol fingerprints - saves full Base64 strings to TEXT columns
// -------------------------------------------------------------
async function enrollFingerprints(citizenId, rawFingerprints, user) {
  const fp = normaliseFingerprints(rawFingerprints || {});
  const existing = await biometricRepository.findByCitizen(citizenId);

  // Store Base64 strings directly in TEXT columns (not VARCHAR)
  const payload = {
    citizenId,
    fingerprint_left_thumb:  fp.left_thumb  ? String(fp.left_thumb)  : (existing?.fingerprint_left_thumb  || null),
    fingerprint_left_index:  fp.left_index  ? String(fp.left_index)  : (existing?.fingerprint_left_index  || null),
    fingerprint_right_thumb: fp.right_thumb ? String(fp.right_thumb) : (existing?.fingerprint_right_thumb || null),
    fingerprint_right_index: fp.right_index ? String(fp.right_index) : (existing?.fingerprint_right_index || null),
    facial_image: existing?.facial_image || null,
    enrolledBy: user.userId,
  };

  const result = await biometricRepository.upsert(payload);

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'BIOMETRIC_FINGERPRINTS_ENROLLED',
    recordType: 'BIOMETRIC',
    recordId: result.id,
    result: 'SUCCESS',
  });

  const enrolledCount = ['left_thumb', 'left_index', 'right_thumb', 'right_index']
    .filter((k) => payload[`fingerprint_${k}`])
    .length;

  logger.info(`Fingerprints enrolled for citizen ${citizenId} (${enrolledCount} prints saved as TEXT Base64)`);
  return result;
}

// -------------------------------------------------------------
// Enrol facial photo - saves full Base64 strings to TEXT columns
// -------------------------------------------------------------
async function enrollFacial(citizenId, image, user) {
  const existing = await biometricRepository.findByCitizen(citizenId);

  const payload = {
    citizenId,
    fingerprint_left_thumb:  existing?.fingerprint_left_thumb  || null,
    fingerprint_left_index:  existing?.fingerprint_left_index  || null,
    fingerprint_right_thumb: existing?.fingerprint_right_thumb || null,
    fingerprint_right_index: existing?.fingerprint_right_index || null,
    facial_image: image ? String(image) : (existing?.facial_image || null),
    enrolledBy: user.userId,
  };

  const result = await biometricRepository.upsert(payload);

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'BIOMETRIC_FACIAL_ENROLLED',
    recordType: 'BIOMETRIC',
    recordId: result.id,
    result: 'SUCCESS',
  });

  logger.info(`Facial photo enrolled for citizen ${citizenId}`);
  return result;
}

// -------------------------------------------------------------
// Read — return camelCase shape for the frontend
// -------------------------------------------------------------
async function get(citizenId) {
  const row = await biometricRepository.findByCitizen(citizenId);
  if (!row) return null;

  return {
    id: row.id,
    citizenId: row.citizen_id,
    fingerprints: {
      'Left Thumb':  row.fingerprint_left_thumb  || null,
      'Left Index':  row.fingerprint_left_index  || null,
      'Right Thumb': row.fingerprint_right_thumb || null,
      'Right Index': row.fingerprint_right_index || null,
    },
    facialImage: row.facial_image || null,
    enrolledBy: row.enrolled_by,
    enrolledAt: row.enrolled_at,
    updatedAt: row.updated_at,
  };
}

// -------------------------------------------------------------
// Verify a captured fingerprint against the stored one
// -------------------------------------------------------------
async function verifyFingerprint(citizenId, captured) {
  const stored = await biometricRepository.findByCitizen(citizenId);
  if (!stored) {
    return { match: false, reason: 'No biometric record' };
  }

  return {
    match: biometricUtils.compareFingerprints(
      captured,
      stored.fingerprint_left_thumb
    ),
  };
}

module.exports = {
  enrollFingerprints,
  enrollFacial,
  get,
  verifyFingerprint,
};
