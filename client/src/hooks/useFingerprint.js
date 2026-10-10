import { useState } from 'react';

function useFingerprint() {
  const [fingerprints, setFingerprints] = useState({});
  const [capturing, setCapturing] = useState(false);

  const capture = async (fingerKey) => {
    setCapturing(true);
    try {
      // In production, integrates with fingerprint scanner SDK
      const mockImage = 'data:image/png;base64,placeholder';
      setFingerprints((prev) => ({ ...prev, [fingerKey]: mockImage }));
      return mockImage;
    } finally {
      setCapturing(false);
    }
  };

  const clear = () => setFingerprints({});

  return { fingerprints, capturing, capture, clear };
}

export default useFingerprint;