import { useState } from 'react';
import { saveSignature } from '../api/signatureApi';

function useSignature() {
  const [signature, setSignature] = useState(null);
  const [saving, setSaving] = useState(false);

  const capture = (dataUrl) => setSignature(dataUrl);

  const save = async (citizenId, documentType) => {
    if (!signature) return null;
    setSaving(true);
    try {
      const result = await saveSignature({ citizenId, documentType, signatureData: signature });
      return result;
    } finally {
      setSaving(false);
    }
  };

  const clear = () => setSignature(null);

  return { signature, capture, save, clear, saving };
}

export default useSignature;