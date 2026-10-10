import { useState } from 'react';

function useFacialRecognition() {
  const [facialImage, setFacialImage] = useState(null);

  const capture = (imageData) => setFacialImage(imageData);
  const clear = () => setFacialImage(null);

  return { facialImage, capture, clear };
}

export default useFacialRecognition;