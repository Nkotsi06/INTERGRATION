export const fingerprintToBase64 = (imageData) => {
  return imageData;
};

export const captureFromWebcam = (webcamRef) => {
  if (!webcamRef || !webcamRef.current) return null;
  return webcamRef.current.getScreenshot();
};

export const validateBiometricQuality = (imageData, threshold = 0.7) => {
  // Placeholder for quality validation
  return true;
};