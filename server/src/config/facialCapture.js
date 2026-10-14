/**
 * All thresholds for the guided facial capture.
 * These are read once at component mount. To change them at runtime,
 * pass an override object into <BiometricEnrollment settings={...} />.
 * Admin Biometric Settings page edits the same numbers via /api/settings.
 */
const DEFAULTS = {
  // Timing
  holdStillMs: 2500,                // how long the person must stay still
  giveUpMs: 45000,                  // after this, offer manual mode

  // Movement tolerance
  movementTolerancePx: 18,          // nose tip must stay within this radius
  headAngleToleranceDeg: 12,        // yaw / pitch / roll within this

  // Face size relative to the frame
  minFaceSizeFraction: 0.18,
  maxFaceSizeFraction: 0.75,

  // Brightness (0..255) of the face region
  minBrightness: 60,
  maxBrightness: 215,

  // Sharpness (Laplacian variance)
  minSharpness: 40,

  // Background clutter (0..1, higher = more clutter)
  maxBackgroundClutter: 0.55,

  // Sunglasses detection
  sunglassesDarknessDelta: 45,      // eye region darker than cheek by this => suspect
  minBlinkOpenness: 0.35,           // both eyes must be at least this open

  // Hat detection
  foreheadAccessoryCoverageMax: 0.18, // fraction of forehead covered by accessories

  // Model locations (relative to /public)
  faceLandmarkerPath: '/models/face_landmarker.task',
  selfieSegmenterPath: '/models/selfie_multiclass_256x256.tflite',

  // Whether to give up and offer manual mode after giveUpMs
  allowManualFallback: true,

  // Set to true to log per-frame metrics to the console (dev only)
  debugLogging: false,
};

export default DEFAULTS;