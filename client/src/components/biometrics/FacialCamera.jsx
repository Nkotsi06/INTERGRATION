import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Button from '../common/Button';
import useFaceVision from '../../hooks/useFaceVision';
import { evaluateFrame } from '../../utils/facialChecks';
import config from '../../config/facialCapture';

const STATUS_SYMBOL = {
  pass: '✓',
  fail: '!',
  checking: '…',
  unknown: '…',
};

const STATUS_LABEL = {
  pass: 'Passed',
  fail: 'Needs attention',
  checking: 'Checking',
  unknown: 'Checking',
};

export default function FacialCamera({ onCapture, onCancel, settings }) {
  const thresholds = { ...config, ...(settings || {}) };
  const webcamRef = useRef(null);
  const rafRef = useRef(null);
  const lastAnalysisRef = useRef({ noseTip: null, timestamp: 0 });
  const holdStartRef = useRef(null);
  const [checks, setChecks] = useState({});
  const [message, setMessage] = useState('Looking for a face…');
  const [holdProgress, setHoldProgress] = useState(0);
  const [lastCaptured, setLastCaptured] = useState(null);

  const { ready, loading, error, analyse } = useFaceVision();

  useEffect(() => {
    if (!ready || lastCaptured) return undefined;

    function tick() {
      const video = webcamRef.current?.video;
      if (video && video.readyState === 4) {
        const now = performance.now();
        const analysis = analyse(video, now);
        if (analysis) {
          const result = evaluateFrame(
            analysis,
            video,
            lastAnalysisRef.current,
            thresholds
          );

          setChecks(result.checks);
          setMessage(result.primaryMessage);

          if (result.canHold) {
            if (!holdStartRef.current) holdStartRef.current = Date.now();
            const held = Date.now() - holdStartRef.current;
            setHoldProgress(Math.min(1, held / thresholds.holdStillMs));
            if (held >= thresholds.holdStillMs) {
              handleCapture();
              return;
            }
          } else {
            holdStartRef.current = null;
            setHoldProgress(0);
          }

          lastAnalysisRef.current = {
            noseTip: result.noseTip,
            timestamp: now,
          };
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, lastCaptured, thresholds.holdStillMs]);

  useEffect(() => {
    if (!thresholds.allowManualFallback) return undefined;
    const t = setTimeout(() => {
      if (!lastCaptured) {
        setMessage('Having trouble? You can capture manually instead.');
      }
    }, thresholds.giveUpMs);
    return () => clearTimeout(t);
  }, [lastCaptured, thresholds.giveUpMs, thresholds.allowManualFallback]);

  const handleCapture = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (shot) {
      setLastCaptured(shot);
      onCapture(shot);
    }
  }, [onCapture]);

  const handleRetake = () => {
    setLastCaptured(null);
    holdStartRef.current = null;
    setHoldProgress(0);
    lastAnalysisRef.current = { noseTip: null, timestamp: 0 };
  };

  return (
    <div className="facial-camera">
      {!lastCaptured ? (
        <>
          <div className="facial-webcam-wrapper">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 },
              }}
              className="webcam-view"
            />
            <div className="facial-oval" aria-hidden="true" />
            <div
              className="facial-hold-ring"
              style={{ '--hold': holdProgress }}
              aria-hidden="true"
            />
          </div>

          <p className="facial-primary-message" role="status" aria-live="polite">
            {message}
          </p>

          {loading && <p className="text-muted">Loading camera models…</p>}
          {error && <div className="facial-error" role="alert">{error}</div>}

          <div className="facial-checklist">
            {Object.entries(checks).map(([key, c]) => (
              <div key={key} className={`facial-check facial-check-${c.status}`}>
                <span className="facial-check-icon" aria-hidden="true">
                  {STATUS_SYMBOL[c.status]}
                </span>
                <span className="facial-check-label">{humanise(key)}</span>
                <span className="facial-check-status">{STATUS_LABEL[c.status]}</span>
              </div>
            ))}
          </div>

          <div className="facial-actions">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button variant="primary" onClick={handleCapture} disabled={!ready}>
              Capture manually
            </Button>
          </div>
        </>
      ) : (
        <>
          <img src={lastCaptured} alt="Captured face" className="facial-image" />
          <div className="facial-actions">
            <Button variant="secondary" onClick={handleRetake}>
              Retake
            </Button>
            <Button variant="primary" onClick={handleCapture}>
              Use this photo
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function humanise(key) {
  const map = {
    oneFace: 'One face',
    centredSize: 'Centred and sized',
    facingForward: 'Facing forward',
    standingStill: 'Standing still',
    eyesVisible: 'Eyes visible',
    noHat: 'No hat',
    clearBackground: 'Clear background',
    goodLight: 'Good light',
  };
  return map[key] || key;
}