import config from '../config/facialCapture';

export function evaluateFrame(analysis, videoEl, prevFrame = null, thresholds = config) {
  const { faceResult, segResult } = analysis || {};
  const W = videoEl?.videoWidth || 640;
  const H = videoEl?.videoHeight || 480;

  const checks = {
    oneFace:        { status: 'unknown' },
    centredSize:    { status: 'unknown' },
    facingForward:  { status: 'unknown' },
    standingStill:  { status: 'unknown' },
    eyesVisible:    { status: 'unknown' },
    noGlasses:      { status: 'unknown' },
    noHat:          { status: 'unknown' },
    clearBackground: { status: 'unknown' },
    goodLight:      { status: 'unknown' },
    sharpImage:     { status: 'unknown' },
  };

  const faces = faceResult?.faceLandmarks || [];
  if (faces.length === 0) {
    checks.oneFace.status = 'fail';
    return { checks, primaryMessage: 'No face detected', noseTip: null, canHold: false };
  }
  if (faces.length > 1) {
    checks.oneFace.status = 'fail';
    return { checks, primaryMessage: 'More than one face in view', noseTip: null, canHold: false };
  }
  checks.oneFace.status = 'pass';

  const landmarks = faces[0];
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

  const matrix = faceResult?.facialTransformationMatrixes?.[0]?.data;
  let yaw = 0, pitch = 0, roll = 0;
  if (!matrix || matrix.length < 16) {
    checks.facingForward.status = 'fail';
    checks.facingForward.message = 'Face-position check is unavailable';
  } else {
    const r00 = matrix[0], r10 = matrix[1], r20 = matrix[2];
    const r21 = matrix[6], r22 = matrix[10];
    pitch = Math.atan2(-r20, Math.sqrt(r00 * r00 + r10 * r10)) * 180 / Math.PI;
    yaw   = Math.atan2(r10, r00) * 180 / Math.PI;
    roll  = Math.atan2(r21, r22) * 180 / Math.PI;
    const angleOk =
      Math.abs(yaw) < thresholds.headAngleToleranceDeg &&
      Math.abs(pitch) < thresholds.headAngleToleranceDeg &&
      Math.abs(roll) < thresholds.headAngleToleranceDeg;
    checks.facingForward.status = angleOk ? 'pass' : 'fail';
    if (!angleOk) checks.facingForward.message = 'Face the camera';
  }

  const noseTip = landmarks[1] ? { x: landmarks[1].x * W, y: landmarks[1].y * H } : null;

  let moved = false;
  if (prevFrame?.noseTip && noseTip) {
    const dx = noseTip.x - prevFrame.noseTip.x;
    const dy = noseTip.y - prevFrame.noseTip.y;
    moved = Math.sqrt(dx * dx + dy * dy) > thresholds.movementTolerancePx;
  }
  checks.standingStill.status = moved ? 'fail' : 'checking';
  if (moved) checks.standingStill.message = 'Hold still';

  const blendshapes = faceResult?.faceBlendshapes?.[0]?.categories || [];
  const blinkLeft = blendshapes.find((b) => b.categoryName === 'eyeBlinkLeft')?.score;
  const blinkRight = blendshapes.find((b) => b.categoryName === 'eyeBlinkRight')?.score;
  const eyesOpen =
    blinkLeft !== undefined &&
    blinkRight !== undefined &&
    (1 - blinkLeft) > thresholds.minBlinkOpenness &&
    (1 - blinkRight) > thresholds.minBlinkOpenness;
  checks.eyesVisible.status = eyesOpen ? 'pass' : 'fail';
  if (!eyesOpen) {
    checks.eyesVisible.message = blinkLeft === undefined || blinkRight === undefined
      ? 'Eye check is unavailable'
      : 'Open your eyes';
  }

  checks.noGlasses.status = 'checking';
  checks.noHat.status = 'checking';

  if (segResult) {
    const clutter = estimateBackgroundClutter(videoEl, segResult);
    if (clutter == null) {
      checks.clearBackground.status = 'fail';
      checks.clearBackground.message = 'Background check is unavailable';
    } else {
      checks.clearBackground.status = clutter < thresholds.maxBackgroundClutter ? 'pass' : 'fail';
    }
    if (clutter != null && clutter >= thresholds.maxBackgroundClutter) {
      checks.clearBackground.message = 'Move to a plainer background';
    }
  } else {
    checks.clearBackground.status = 'fail';
    checks.clearBackground.message = 'Background check is unavailable';
  }

  const brightness = averageBrightness(videoEl, faceCX, faceCY, faceW, faceH);
  if (brightness == null) {
    checks.goodLight.status = 'fail';
    checks.goodLight.message = 'Lighting check is unavailable';
  } else if (brightness < thresholds.minBrightness) {
    checks.goodLight.status = 'fail';
    checks.goodLight.message = 'Move to better light';
  } else if (brightness > thresholds.maxBrightness) {
    checks.goodLight.status = 'fail';
    checks.goodLight.message = 'Too bright — reduce backlight';
  } else {
    checks.goodLight.status = 'pass';
  }

  const sharpness = estimateSharpness(videoEl, faceCX, faceCY, faceW, faceH);
  if (sharpness == null) {
    checks.sharpImage.status = 'fail';
    checks.sharpImage.message = 'Image focus check is unavailable';
  } else if (sharpness < thresholds.minSharpness) {
    checks.sharpImage.status = 'fail';
    checks.sharpImage.message = 'Hold still and improve focus';
  } else {
    checks.sharpImage.status = 'pass';
  }

  const priority = [
    ['oneFace', 'No face detected'],
    ['oneFace', 'More than one face in view'],
    ['centredSize', 'Move into the oval'],
    ['centredSize', 'Move closer to the camera'],
    ['centredSize', 'Move back a little'],
    ['facingForward', 'Face the camera'],
    ['facingForward', 'Face-position check is unavailable'],
    ['eyesVisible', 'Open your eyes'],
    ['eyesVisible', 'Eye check is unavailable'],
    ['clearBackground', 'Move to a plainer background'],
    ['clearBackground', 'Background check is unavailable'],
    ['goodLight', 'Move to better light'],
    ['goodLight', 'Too bright — reduce backlight'],
    ['goodLight', 'Lighting check is unavailable'],
    ['sharpImage', 'Hold still and improve focus'],
    ['sharpImage', 'Image focus check is unavailable'],
    ['facingForward', 'Face-position check is unavailable'],
    ['standingStill', 'Hold still'],
  ];

  let primaryMessage = 'Looking good — hold still';
  for (const [key, msg] of priority) {
    if (checks[key].status === 'fail' && checks[key].message === msg) {
      primaryMessage = msg;
      break;
    }
  }

  const automatedChecks = Object.entries(checks)
    .filter(([key]) => key !== 'noGlasses' && key !== 'noHat')
    .map(([, check]) => check);
  const canHold = automatedChecks.every(
    (check) => check.status === 'pass' || check.status === 'checking'
  );

  return { checks, primaryMessage, noseTip, canHold };
}

function estimateBackgroundClutter(videoEl, segResult) {
  const mask = segResult?.categoryMask;
  if (!mask || !videoEl) return null;
  const categories = mask.getCategoryNames?.() || [];
  const wantedIndex = categories.indexOf('background');
  if (wantedIndex === -1) return null;
  const data = mask.getAsUint8Array?.() || mask.getAsFloat32Array?.();
  const maskWidth = mask.width;
  const maskHeight = mask.height;
  if (!data || !maskWidth || !maskHeight || data.length !== maskWidth * maskHeight) {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const { data: pixels } = context.getImageData(0, 0, canvas.width, canvas.height);
    const maskIndex = (x, y) =>
      Math.min(maskHeight - 1, Math.floor((y / canvas.height) * maskHeight)) * maskWidth +
      Math.min(maskWidth - 1, Math.floor((x / canvas.width) * maskWidth));
    const luminance = (x, y) => {
      const index = (y * canvas.width + x) * 4;
      return 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
    };
    let edges = 0;
    let comparisons = 0;
    for (let y = 1; y < canvas.height - 1; y += 2) {
      for (let x = 1; x < canvas.width - 1; x += 2) {
        const current = maskIndex(x, y);
        if (data[current] !== wantedIndex) continue;
        for (const [nextX, nextY] of [[x + 1, y], [x, y + 1]]) {
          if (data[maskIndex(nextX, nextY)] !== wantedIndex) continue;
          comparisons++;
          if (Math.abs(luminance(x, y) - luminance(nextX, nextY)) > 22) edges++;
        }
      }
    }
    return comparisons > 0 ? edges / comparisons : null;
  } catch {
    return null;
  }
}

function averageBrightness(videoEl, cx, cy, w, h) {
  if (!videoEl) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(videoEl, cx - w / 2, cy - h / 2, w, h, 0, 0, 64, 48);
    const { data } = ctx.getImageData(0, 0, 64, 48);
    let sum = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      n++;
    }
    return n > 0 ? sum / n : null;
  } catch {
    return null;
  }
}

function estimateSharpness(videoEl, cx, cy, w, h) {
  if (!videoEl) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(videoEl, cx - w / 2, cy - h / 2, w, h, 0, 0, 64, 64);
    const { data } = context.getImageData(0, 0, 64, 64);
    const gray = new Float32Array(64 * 64);
    for (let i = 0; i < gray.length; i++) {
      const pixel = i * 4;
      gray[i] = 0.299 * data[pixel] + 0.587 * data[pixel + 1] + 0.114 * data[pixel + 2];
    }
    let sum = 0;
    let squaredSum = 0;
    let count = 0;
    for (let y = 1; y < 63; y++) {
      for (let x = 1; x < 63; x++) {
        const index = y * 64 + x;
        const laplacian =
          gray[index - 64] + gray[index - 1] - 4 * gray[index] +
          gray[index + 1] + gray[index + 64];
        sum += laplacian;
        squaredSum += laplacian * laplacian;
        count++;
      }
    }
    const mean = sum / count;
    return squaredSum / count - mean * mean;
  } catch {
    return null;
  }
}