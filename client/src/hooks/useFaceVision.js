import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';
import config from '../config/facialCapture';

export default function useFaceVision() {
  const faceLandmarkerRef = useRef(null);
  const segmenterRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const fileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm'
        );

        const [landmarker, segmenter] = await Promise.all([
          FaceLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: config.faceLandmarkerPath,
              delegate: 'GPU',
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: 'VIDEO',
            numFaces: 3,
          }),
          ImageSegmenter.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: config.selfieSegmenterPath,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            outputCategoryMask: true,
            outputConfidenceMasks: false,
          }),
        ]);

        if (cancelled) {
          landmarker.close();
          segmenter.close();
          return;
        }

        faceLandmarkerRef.current = landmarker;
        segmenterRef.current = segmenter;
        setReady(true);
      } catch (err) {
        console.error('[useFaceVision] load failed:', err);
        setError('Could not load the facial recognition models.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
      if (segmenterRef.current) {
        segmenterRef.current.close();
        segmenterRef.current = null;
      }
    };
  }, []);

  const analyse = useCallback((videoEl, timestampMs) => {
    if (!faceLandmarkerRef.current || !segmenterRef.current || !videoEl) return null;
    if (!timestampMs || timestampMs <= 0) return null;

    let faceResult = null;
    let segResult = null;

    try {
      faceResult = faceLandmarkerRef.current.detectForVideo(videoEl, timestampMs);
    } catch (err) {
      console.warn('[useFaceVision] landmarker error:', err.message);
    }

    try {
      segResult = segmenterRef.current.segmentForVideo(videoEl, timestampMs);
    } catch (err) {
      console.warn('[useFaceVision] segmenter error:', err.message);
    }

    return { faceResult, segResult };
  }, []);

  const release = useCallback(() => {
    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
    if (segmenterRef.current) {
      segmenterRef.current.close();
      segmenterRef.current = null;
    }
    setReady(false);
  }, []);

  return { ready, loading, error, analyse, release };
}