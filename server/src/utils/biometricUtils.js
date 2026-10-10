// Placeholder for biometric processing utilities.
// In production, integrate with actual fingerprint SDK / face matching library.

function compareFingerprints(captured, stored, threshold = 85) {
  // Placeholder: return true for prototype
  return true;
}

function compareFacial(captured, stored, threshold = 85) {
  return true;
}

module.exports = { compareFingerprints, compareFacial };