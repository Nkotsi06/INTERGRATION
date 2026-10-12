const fs = require('fs');
const path = require('path');

/**
 * Build a public URL for a file that lives under /uploads.
 * The base URL comes from the environment — never hardcoded — so production
 * serves files from the deployed backend and local dev serves from localhost.
 */

function getBaseUrl() {
  // 1. Explicit override.
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/+$/, '');
  }
  // 2. Accept BACKEND_URL as an alias for older deployments.
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/+$/, '');
  }
  // 3. Render sets RENDER_EXTERNAL_URL automatically.
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '');
  }
  // 4. Local development fallback.
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

function getPublicUrl(filePath) {
  if (!filePath) return null;

  // Already an absolute URL? Leave it alone.
  if (typeof filePath === 'string' &&
      (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
    return filePath;
  }

  // Normalise separators and find the "uploads/" anchor.
  const normalised = String(filePath).replace(/\\/g, '/').split('#')[0];

  let relative;
  const idx = normalised.indexOf('uploads/');
  if (idx !== -1) {
    relative = normalised.slice(idx); // "uploads/logos/abc.jpeg"
  } else {
    relative = 'uploads/' + normalised.replace(/^\/+/, '');
  }

  return `${getBaseUrl()}/${relative}`;
}

function deleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // Missing files are not errors.
  }
}

module.exports = { getPublicUrl, deleteFile };