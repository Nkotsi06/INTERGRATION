const fs = require('fs');
const path = require('path');

function deleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // Ignore delete errors
  }
}

function getPublicUrl(filePath) {
  if (!filePath) return null;

  // If the path is already an absolute URL, return it unchanged.
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // Build a relative URL path from the file path.
  // The static middleware in app.js serves files from /uploads.
  const normalized = filePath.replace(/\\/g, '/');
  const uploadsIndex = normalized.indexOf('uploads/');
  const relative = uploadsIndex >= 0
    ? normalized.slice(uploadsIndex)
    : normalized.replace(/^.*uploads\//, '');

  // Absolute URL with backend origin so the browser can load it.
  const backendOrigin = process.env.BACKEND_URL || 'http://localhost:5000';
  return `${backendOrigin}/${relative}`;
}

module.exports = { deleteFile, getPublicUrl };