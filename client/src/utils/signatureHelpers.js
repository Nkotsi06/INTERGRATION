export const signatureToBase64 = (signaturePad) => {
  if (!signaturePad || signaturePad.isEmpty()) return null;
  return signaturePad.getCanvas().toDataURL('image/png');
};

export const isSignatureEmpty = (signaturePad) => {
  return !signaturePad || signaturePad.isEmpty();
};

export const clearSignature = (signaturePad) => {
  if (signaturePad) signaturePad.clear();
};