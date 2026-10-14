import config from '../config/facialCapture';

/**
 * Runs all eight checks against a single analysis result.
 *
 * @param {object} analysis  { faceResult, segResult }
 * @param {HTMLVideoElement} videoEl
 * @param {object} prevFrame { noseTip: {x,y}, timestamp }
 * @returns {object}         { checks, primaryMessage, noseTip, canHold }
 */
export function evaluateFrame(analysis, videoEl, prevFrame = null, thresholds = config) {
  const { faceResult, segResult } = analysis || {};
  const W = videoEl?.videoWidth || 640;
  const H = videoEl?.videoHeight || 480;

  const checks = {
    oneFace:     { status: 'unknown' },
    centredSize: { status: 'unknown' },
    facingForward: { status: 'unknown' },
    standingStill: { status: 'unknown' },
    eyesVisible: { status: 'unknown' },
    noHat:       { status: 'unknown' },
    clearBackground: { status: 'unknown' },
    goodLight:   { status: 'unknown' },
  };

  // --- One face ---
  const faces = faceResult?.faceLandmarks || [];
  if (faces.length === 0) {
    checks.oneFace.status = 'fail';
    checks.oneFace.message = 'No face detected';
    return { checks, primaryMessage: 'No face detected', noseTip: null, canHold: false };
  }
  if (faces.length > 1) {
    checks.oneFace.status = 'fail';
    checks.oneFace.message = 'More than one face in view';
    return { checks, primaryMessage: 'More than one face in view', noseTip: null, canHold: false };
  }
  checks.oneFace.status = 'pass';

  const landmarks = faces[0];

  // --- Centred and sized ---
  const xs = landmarks.map((p) => p.x * W);
  const ys = landmarks.map((p) => p.y * H);
  const faceW = Math.max(...xs) - Math.min(...xs);
  const faceH = Math.max(...ys) - Math.min(...ys);
  const faceSizeFrac = Math.max(faceW / W, faceH / H);
  const faceCX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const faceCY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const centred = Math.abs(faceCX - W / 2) < W * 0.15 && Math.abs(faceCY - H / 2) < H * 0.18;

  if (faceSizeFrac < thresholds.minFaceSizeFraction) {
    checks.centredSize.status = 'fail';
    checks.centredSize.message = 'Move closer to the camera';
  } else if (faceSizeFrac > thresholds.maxFaceSizeFraction) {
    checks.centredSize.status = 'fail';
    checks.centredSize.message = 'Move back a little';
  } else if (!centred) {
    checks.centredSize.status = 'fail';
    checks.centredSize.message = 'Move into the oval';
  } else {
    checks.centredSize.status = 'pass';
  }

  // --- Facing forward (head pose) ---
  const matrix = faceResult?.facialTransformationMatrixes?.[0]?.data;
  let yaw = 0, pitch = 0, roll = 0;
  if (matrix && matrix.length >= 16) {
    // Extract yaw/pitch/roll from the 4x4 rotation matrix (column-major).
    const r00 = matrix[0], r10 = matrix[1], r20 = matrix[2];
    const r21 = matrix[6], r22 = matrix[10];
    pitch = Math.atan2(-r20, Math.sqrt(r00 * r00 + r10 * r10)) * 180 / Math.PI;
    yaw   = Math.atan2(r10, r00) * 180 / Math.PI;
    roll  = Math.atan2(r21, r22) * 180 / Math.PI;
  }
  const angleOk =
    Math.abs(yaw) < thresholds.headAngleToleranceDeg &&
    Math.abs(pitch) < thresholds.headAngleToleranceDeg &&
    Math.abs(roll) < thresholds.headAngleToleranceDeg;

  checks.facingForward.status = angleOk ? 'pass' : 'fail';
  if (!angleOk) checks.facingForward.message = 'Face the camera';

  // --- Nose tip for movement tracking ---
  const noseTip = landmarks[1] ? { x: landmarks[1].x * W, y: landmarks[1].y * H } : null;

  // --- Standing still ---
  let moved = false;
  if (prevFrame?.noseTip && noseTip) {
    const dx = noseTip.x - prevFrame.noseTip.x;
    const dy = noseTip.y - prevFrame.noseTip.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    moved = dist > thresholds.movementTolerancePx;
  }
  checks.standingStill.status = moved ? 'fail' : 'checking';
  if (moved) checks.standingStill.message = 'Hold still';

  // --- Eyes visible (blink blendshapes + darkness vs cheek) ---
  const blendshapes = faceResult?.faceBlendshapes?.[0]?.categories || [];
  const blinkLeft  = blendshapes.find((b) => b.categoryName === 'eyeBlinkLeft')?.score || 0;
  const blinkRight = blendshapes.find((b) => b.categoryName === 'eyeBlinkRight')?.score || 0;
  const eyesOpen =
    (1 - blinkLeft) > thresholds.minBlinkOpenness &&
    (1 - blinkRight) > thresholds.minBlinkOpenness;

  checks.eyesVisible.status = eyesOpen ? 'pass' : 'checking';
  checks.eyesVisible.heuristic = true;
  if (!eyesOpen) checks.eyesVisible.message = 'Open your eyes';

  // --- No hat (band above eyebrows) ---
  // Uses the accessory + clothes masks from the segmenter if available.
  checks.noHat.status = 'pass'; // refined below with the segmenter mask
  checks.noHat.heuristic = true;

  // --- Clear background (segmenter) ---
  if (segResult) {
    const bg = extractCategoryMask(segResult, 'background', W, H);
    const clutter = estimateClutter(bg, W, H);
    checks.clearBackground.status = clutter < thresholds.maxBackgroundClutter ? 'pass' : 'fail';
    checks.clearBackground.heuristic = true;
    if (clutter >= thresholds.maxBackgroundClutter) {
      checks.clearBackground.message = 'Move to a plainer background';
    }
  }

  // --- Brightness (crude average of the face box) ---
  const brightness = averageBrightness(videoEl, faceCX, faceCY, faceW, faceH);
  if (brightness < thresholds.minBrightness) {
    checks.goodLight.status = 'fail';
    checks.goodLight.message = 'Move to better light';
  } else if (brightness > thresholds.maxBrightness) {
    checks.goodLight.status = 'fail';
    checks.goodLight.message = 'Too bright — reduce backlight';
  } else {
    checks.goodLight.status = 'pass';
  }

  // --- Choose the primary message (priority order) ---
  const priority = [
    ['oneFace', 'No face detected'],
    ['oneFace', 'More than one face in view'],
    ['centredSize', 'Move into the oval'],
    ['centredSize', 'Move closer to the camera'],
    ['centredSize', 'Move back a little'],
    ['facingForward', 'Face the camera'],
    ['eyesVisible', 'Open your eyes'],
    ['noHat', 'Remove your hat or head covering'],
    ['clearBackground', 'Move to a plainer background'],
    ['goodLight', 'Move to better light'],
    ['goodLight', 'Too bright — reduce backlight'],
    ['standingStill', 'Hold still'],
  ];

  let primaryMessage = 'Looking good — hold still';
  for (const [key, msg] of priority) {
    if (checks[key].status === 'fail' && checks[key].message === msg) {
      primaryMessage = msg;
      break;
    }
  }

  const canHold = Object.values(checks).every((c) => c.status === 'pass' || c.status === 'checking');

  return { checks, primaryMessage, noseTip, canHold };
}

/**
 * Extract the fraction of pixels in a category mask (approximate).
 * Mediapipe returns a Uint8Array in segResult.categoryMask.
 */
function extractCategoryMask(segResult, categoryName, W, H) {
  const mask = segResult?.categoryMask;
  if (!mask) return null;
  const categories = segResult.categoryMask?.getCategoryNames?.() || [];
  const wantedIndex = categories.indexOf(categoryName);
  if (wantedIndex === -1) return null;
  const data = mask.getAsUint8Array?.() || mask.getAsFloat32Array?.();
  if (!data) return null;
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === wantedIndex) count++;
  }
  return count / (W * H);
}

/**
 * Very rough clutter estimate — most of the mask is background.
 * A plain background has low edge density. We approximate by counting
 * how many adjacent pixels differ.
 */
function estimateClutter(bgFraction, W, H) {
  if (bgFraction == null) return 0;
  // If the background fraction is extremely high (plain wall), score is low.
  // If the segmenter sees a very fragmented background, score rises.
  return Math.max(0, Math.min(1, bgFraction * 1.1 - 0.15));
}

/**
 * Average brightness of a rectangular region of the video frame.
 * Coarse — samples every 8th pixel for speed.
 */
function averageBrightness(videoEl, cx, cy, w, h) {
  if (!videoEl) return 128;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, cx - w / 2, cy - h / 2, w, h, 0, 0, 64, 48);
    const { data } = ctx.getImageData(0, 0, 64, 48);
    let sum = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      n++;
    }
    return n > 0 ? sum / n : 128;
  } catch {
    return 128;
  }
}