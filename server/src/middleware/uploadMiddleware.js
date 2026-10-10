const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_BASE = process.env.UPLOAD_DIR || './uploads';

const SUBFOLDERS = {
  documents: path.join(UPLOAD_BASE, 'documents'),
  signatures: path.join(UPLOAD_BASE, 'signatures'),
  biometrics: path.join(UPLOAD_BASE, 'biometrics'),
  photos: path.join(UPLOAD_BASE, 'photos'),
  logos: path.join(UPLOAD_BASE, 'logos'),
};

// Ensure directories exist
Object.values(SUBFOLDERS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function createStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, SUBFOLDERS[subfolder]);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  const allowed = (process.env.UPLOAD_ALLOWED_FORMATS || 'pdf,jpg,jpeg,png')
    .split(',')
    .map((f) => f.trim().toLowerCase());
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (!allowed.includes(ext)) {
    return cb(new Error(`Invalid file type. Allowed: ${allowed.join(', ')}`));
  }
  cb(null, true);
}

const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5', 10) * 1024 * 1024;

const documentUpload = multer({
  storage: createStorage('documents'),
  fileFilter,
  limits: { fileSize: maxSize },
});

const signatureUpload = multer({
  storage: createStorage('signatures'),
  limits: { fileSize: 2 * 1024 * 1024 },
});

const biometricUpload = multer({
  storage: createStorage('biometrics'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const photoUpload = multer({
  storage: createStorage('photos'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const logoUpload = multer({
  storage: createStorage('logos'),
  fileFilter: (req, file, cb) => {
    const allowed = ['png', 'jpg', 'jpeg', 'svg'];
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!allowed.includes(ext)) {
      return cb(new Error(`Invalid logo format. Allowed: ${allowed.join(', ')}`));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = {
  documentUpload,
  signatureUpload,
  biometricUpload,
  photoUpload,
  logoUpload,
  SUBFOLDERS,
};