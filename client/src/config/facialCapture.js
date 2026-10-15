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
  faceLandmarkerPath:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  selfieSegmenterPath:
    'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/1/selfie_multiclass_256x256.tflite',
  allowManualFallback: true,
  debugLogging: false,
};

export default DEFAULTS;