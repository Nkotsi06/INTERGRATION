const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDirectory = path.resolve(
  process.env.PRIVATE_UPLOAD_DIR || path.join(__dirname, '../../private_uploads'),
  'birth-applications'
);
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!['.pdf', '.jpg', '.jpeg'].includes(extension)) {
      const error = new Error('Uploads must be PDF or JPG files.');
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

function birthApplicationUpload(req, res, next) {
  upload.fields([
    { name: 'parentNationalIds', maxCount: 2 },
    { name: 'religiousConfirmation', maxCount: 1 },
    { name: 'chiefLetter', maxCount: 1 },
    { name: 'medicalOrHealth', maxCount: 1 },
  ])(req, res, (error) => {
    if (error) {
      if (!error.statusCode) error.statusCode = 400;
      return next(error);
    }
    next();
  });
}

module.exports = {
  uploadDirectory,
  birthApplicationUpload,
};
