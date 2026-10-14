const DEFAULTS = {
  holdStillMs: 2500,
  giveUpMs: 45000,
  movementTolerancePx: 18,
  headAngleToleranceDeg: 12,
  minFaceSizeFraction: 0.18,
  maxFaceSizeFraction: 0.75,
  minBrightness: 60,
  maxBrightness: 215,
  minSharpness: 40,
  maxBackgroundClutter: 0.55,
  sunglassesDarknessDelta: 45,
  minBlinkOpenness: 0.35,
  foreheadAccessoryCoverageMax: 0.18,
  faceLandmarkerPath: '/models/face_landmarker.task',
  selfieSegmenterPath: '/models/selfie_multiclass_256x256.tflite',
  allowManualFallback: true,
  debugLogging: false,
};

export default DEFAULTS;