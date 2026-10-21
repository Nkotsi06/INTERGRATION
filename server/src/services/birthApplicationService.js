const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { query, getClient } = require('../config/database');
const { hashPassword } = require('../utils/passwordHash');
const logger = require('../utils/logger');

const DOCUMENT_FIELDS = [
  'parentNationalIds',
  'religiousConfirmation',
  'chiefLetter',
  'medicalOrHealth',
];

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function calculateAge(dateValue) {
  const dob = new Date(`${dateValue}T00:00:00Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  if (
    today.getUTCMonth() < dob.getUTCMonth() ||
    (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() < dob.getUTCDate())
  ) age--;
  return age;
}

function validateApplication(data, files) {
  const required = [
    'applicantType',
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'placeOfBirth',
    'motherFullName',
    'applicantEmail',
  ];
  for (const field of required) {
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      throw httpError(400, `${field} is required.`);
    }
  }

  if (!['GUARDIAN', 'SELF'].includes(data.applicantType)) {
    throw httpError(400, 'Applicant type must be SELF or GUARDIAN.');
  }
  if (!['MALE', 'FEMALE', 'OTHER'].includes(data.gender)) {
    throw httpError(400, 'Choose a valid gender.');
  }

  const dob = new Date(`${data.dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(dob.getTime()) || dob.toISOString().slice(0, 10) !== data.dateOfBirth) {
    throw httpError(400, 'Enter a valid date of birth.');
  }
  const age = calculateAge(data.dateOfBirth);
  if (age < 0) throw httpError(400, 'Date of birth cannot be in the future.');
  if (data.applicantType === 'GUARDIAN' && age > 16) {
    throw httpError(400, 'A parent or guardian may apply for a child aged 0–16.');
  }
  if (data.applicantType === 'SELF' && age < 17) {
    throw httpError(400, 'Applicants under 17 must apply through a parent or guardian.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.applicantEmail.trim())) {
    throw httpError(400, 'Enter a valid contact email address.');
  }

  const parentIds = files.parentNationalIds || [];
  if (parentIds.length === 0) throw httpError(400, 'Upload at least one parent or guardian National ID.');
  for (const field of ['religiousConfirmation', 'chiefLetter', 'medicalOrHealth']) {
    if (!files[field]?.length) throw httpError(400, `Upload the ${field} document.`);
  }
}

async function verifyFileContent(file) {
  const handle = await fs.open(file.path, 'r');
  try {
    const header = Buffer.alloc(8);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    const isPdf = bytesRead >= 5 && header.subarray(0, 5).toString() === '%PDF-';
    const isJpeg = bytesRead >= 3 &&
      header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    const extension = path.extname(file.originalname).toLowerCase();
    if ((extension === '.pdf' && !isPdf) ||
        (['.jpg', '.jpeg'].includes(extension) && !isJpeg)) {
      throw httpError(400, `${file.originalname} does not match its file type.`);
    }
  } finally {
    await handle.close();
  }
}

function cleanForm(data) {
  return {
    applicantType: data.applicantType,
    applicantFullName: String(data.applicantFullName || '').trim(),
    applicantEmail: data.applicantEmail.trim().toLowerCase(),
    applicantPhone: String(data.applicantPhone || '').trim(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    placeOfBirth: data.placeOfBirth.trim(),
    motherFullName: data.motherFullName.trim(),
    motherNationalId: String(data.motherNationalId || '').trim(),
    fatherFullName: String(data.fatherFullName || '').trim(),
    fatherNationalId: String(data.fatherNationalId || '').trim(),
    guardianFullName: String(data.guardianFullName || '').trim(),
    guardianNationalId: String(data.guardianNationalId || '').trim(),
  };
}

async function submit(data, files) {
  const allFiles = DOCUMENT_FIELDS.flatMap((field) => files[field] || []);
  try {
    validateApplication(data, files);
    await Promise.all(allFiles.map(verifyFileContent));

    const documents = {};
    for (const field of DOCUMENT_FIELDS) {
      documents[field] = (files[field] || []).map((file) => ({
        path: file.path,
        name: path.basename(file.originalname),
        mimeType: path.extname(file.originalname).toLowerCase() === '.pdf'
          ? 'application/pdf'
          : 'image/jpeg',
      }));
    }

    const referenceNumber = `BCA-${new Date().getFullYear()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const result = await query(
      `INSERT INTO birth_certificate_applications
         (reference_number, form_data, documents, status)
       VALUES ($1, $2::jsonb, $3::jsonb, 'SUBMITTED')
       RETURNING id, reference_number, status, submitted_at`,
      [referenceNumber, JSON.stringify(cleanForm(data)), JSON.stringify(documents)]
    );
    return result.rows[0];
  } catch (error) {
    await Promise.all(allFiles.map((file) => fs.unlink(file.path).catch((unlinkError) => {
      logger.warn(`Could not remove rejected birth application upload: ${unlinkError.message}`);
    })));
    throw error;
  }
}

async function list(filters = {}) {
  const params = [];
  let where = '';
  if (filters.status) {
    params.push(filters.status);
    where = `WHERE status = $${params.length}`;
  }
  const result = await query(
    `SELECT id, reference_number, form_data, documents, status,
            rejection_reason, submitted_at, reviewed_at, certificate_number
     FROM birth_certificate_applications ${where}
     ORDER BY submitted_at ASC`,
    params
  );
  return result.rows.map((application) => ({
    ...application,
    documents: Object.fromEntries(
      Object.entries(application.documents || {}).map(([key, documents]) => [
        key,
        documents.map(({ name, mimeType }) => ({ name, mimeType })),
      ])
    ),
  }));
}

async function getForReview(id) {
  const result = await query(
    `SELECT * FROM birth_certificate_applications WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

function publicApplication(application) {
  if (!application) return null;
  return {
    ...application,
    documents: Object.fromEntries(
      Object.entries(application.documents || {}).map(([key, documents]) => [
        key,
        documents.map(({ name, mimeType }) => ({ name, mimeType })),
      ])
    ),
  };
}

async function getDocument(id, documentType, fileIndex = 0) {
  if (!DOCUMENT_FIELDS.includes(documentType)) throw httpError(404, 'Document not found.');
  const application = await getForReview(id);
  const document = application?.documents?.[documentType]?.[Number(fileIndex)];
  if (!document || !path.resolve(document.path).startsWith(`${path.resolve(process.env.PRIVATE_UPLOAD_DIR || path.join(__dirname, '../../private_uploads'))}${path.sep}`)) {
    throw httpError(404, 'Document not found.');
  }
  return document;
}

function createNationalId(year, serial) {
  const body = `${year}${String(serial).padStart(8, '0')}`;
  if (body.length !== 12) throw new Error('National ID sequence has exceeded its supported length.');
  for (let digit = 0; digit <= 9; digit++) {
    const candidate = `${body}${digit}`;
    let sum = 0;
    let doubleDigit = false;
    for (let index = candidate.length - 1; index >= 0; index--) {
      let value = Number(candidate[index]);
      if (doubleDigit) {
        value *= 2;
        if (value > 9) value -= 9;
      }
      sum += value;
      doubleDigit = !doubleDigit;
    }
    if (sum % 10 === 0) return candidate;
  }
  throw new Error('Could not generate a National ID check digit.');
}

function temporaryPassword() {
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%*-_';
  const all = lower + upper + digits + symbols;
  const chars = [
    lower[crypto.randomInt(lower.length)],
    upper[crypto.randomInt(upper.length)],
    digits[crypto.randomInt(digits.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];
  while (chars.length < 18) chars.push(all[crypto.randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

async function buildCertificatePdf(form, nationalId, certificateNumber) {
  const verifyUrl = `${process.env.PUBLIC_API_URL || 'https://services.gov.ls/api'}/birth-applications/verify/${certificateNumber}`;
  const qrData = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 180 });
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const finished = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  doc.fontSize(20).fillColor('#164e70').text('KINGDOM OF LESOTHO', { align: 'center' });
  doc.moveDown(0.4);
  doc.fontSize(14).text('NATIONAL IDENTITY & CIVIL REGISTRY', { align: 'center' });
  doc.moveDown(1.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#1c769f');
  doc.moveDown(1.5);
  doc.fontSize(24).text('BIRTH CERTIFICATE', { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(12).fillColor('#243746');
  [
    ['Certificate number', certificateNumber],
    ['National ID number', nationalId],
    ['Full name', `${form.firstName} ${form.lastName}`],
    ['Date of birth', form.dateOfBirth],
    ['Gender', form.gender],
    ['Place of birth', form.placeOfBirth],
    ['Mother / parent', form.motherFullName],
    ['Father / parent', form.fatherFullName || 'Not provided'],
  ].forEach(([label, value]) => {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value);
    doc.moveDown(0.65);
  });
  doc.moveDown(1);
  doc.fontSize(10).fillColor('#52616b')
    .text('Digitally issued by the National Identity & Civil Registry. Scan the QR code to verify this certificate.', 50, doc.y, { width: 350 });
  doc.image(Buffer.from(qrData.split(',')[1], 'base64'), 430, doc.y - 18, { width: 100, height: 100 });
  doc.end();
  return finished;
}

async function review(id, decision, reason, staffUser) {
  if (!['APPROVE', 'REJECT'].includes(decision)) {
    throw httpError(400, 'Decision must be APPROVE or REJECT.');
  }
  if (decision === 'REJECT' && !String(reason || '').trim()) {
    throw httpError(400, 'Provide a reason when rejecting an application.');
  }

  const client = await getClient();
  let plainPassword;
  try {
    await client.query('BEGIN');
    const selected = await client.query(
      'SELECT * FROM birth_certificate_applications WHERE id = $1 FOR UPDATE',
      [id]
    );
    const application = selected.rows[0];
    if (!application) throw httpError(404, 'Birth certificate application not found.');
    if (application.status !== 'SUBMITTED' && application.status !== 'UNDER_REVIEW') {
      throw httpError(409, 'This birth certificate application has already been processed.');
    }

    if (decision === 'REJECT') {
      await client.query(
        `UPDATE birth_certificate_applications
         SET status = 'REJECTED', rejection_reason = $1, reviewed_by = $2,
             reviewed_at = NOW(), updated_at = NOW()
         WHERE id = $3`,
        [String(reason).trim(), staffUser.userId, id]
      );
      await client.query('COMMIT');
      return { status: 'REJECTED' };
    }

    const year = new Date(application.form_data.dateOfBirth).getUTCFullYear();
    const serialResult = await client.query(
      "SELECT nextval('birth_certificate_number_seq') AS certificate_serial"
    );
    let nationalId;
    for (let attempt = 0; attempt < 10; attempt++) {
      const idSerial = await client.query(
        "SELECT nextval('citizen_national_id_serial_seq') AS serial"
      );
      nationalId = createNationalId(year, idSerial.rows[0].serial);
      const duplicate = await client.query(
        'SELECT 1 FROM citizens WHERE national_id = $1',
        [nationalId]
      );
      if (duplicate.rowCount === 0) break;
      nationalId = null;
    }
    if (!nationalId) throw new Error('Could not generate a unique National ID. Please try again.');
    const certificateNumber = `BC-${new Date().getFullYear()}-${String(serialResult.rows[0].certificate_serial).padStart(7, '0')}`;
    const form = application.form_data;
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    plainPassword = temporaryPassword();
    const passwordHash = await hashPassword(plainPassword);
    const pdf = await buildCertificatePdf(form, nationalId, certificateNumber);
    const citizenResult = await client.query(
      `INSERT INTO citizens
         (national_id, first_name, last_name, date_of_birth, gender, place_of_birth,
          email, phone, mother_name, father_name, is_verified, verified_at, verified_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,NOW(),$11)
       RETURNING id`,
      [
        nationalId, firstName, lastName, form.dateOfBirth, form.gender,
        form.placeOfBirth, form.applicantEmail, form.applicantPhone || null,
        form.motherFullName, form.fatherFullName || null, staffUser.userId,
      ]
    );
    const citizenId = citizenResult.rows[0].id;
    const accountEmail = `${nationalId}@citizen.gov.ls`;
    await client.query(
      `INSERT INTO users
         (username, email, password_hash, full_name, role, ministry, citizen_id, must_change_password)
       VALUES ($1,$2,$3,$4,'CITIZEN',NULL,$5,TRUE)`,
      [nationalId, accountEmail, passwordHash, fullName, citizenId]
    );
    await client.query(
      `INSERT INTO birth_certificates
         (certificate_number, child_full_name, child_date_of_birth, child_gender,
          child_national_id, place_of_birth, mother_full_name, mother_national_id,
          father_full_name, father_national_id, request_type, issued_by, issued_at,
          status, certificate_pdf)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'NEW',$11,NOW(),'ISSUED',$12)`,
      [
        certificateNumber, fullName, form.dateOfBirth, form.gender, nationalId,
        form.placeOfBirth, form.motherFullName, form.motherNationalId || null,
        form.fatherFullName || null, form.fatherNationalId || null,
        staffUser.userId, pdf,
      ]
    );
    await client.query(
      `UPDATE birth_certificate_applications
       SET status = 'APPROVED', citizen_id = $1, certificate_number = $2,
           reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4`,
      [citizenId, certificateNumber, staffUser.userId, id]
    );
    await client.query('COMMIT');

    logger.info(`Approved birth application ${application.reference_number} and issued citizen ID ${nationalId}`);
    return {
      status: 'APPROVED',
      nationalId,
      certificateNumber,
      username: nationalId,
      temporaryPassword: plainPassword,
      applicantEmail: form.applicantEmail,
    };
  } catch (error) {
    await client.query('ROLLBACK').catch((rollbackError) => {
      logger.error(`Could not roll back birth application review ${id}: ${rollbackError.message}`);
    });
    throw error;
  } finally {
    client.release();
  }
}

async function verifyCertificate(certificateNumber) {
  const result = await query(
    `SELECT certificate_number, child_full_name, status, issued_at
     FROM birth_certificates WHERE certificate_number = $1`,
    [certificateNumber]
  );
  return result.rows[0] || null;
}

async function getCertificatePdf(user, certificateNumber) {
  const result = await query(
    `SELECT certificate_pdf FROM birth_certificates
     WHERE certificate_number = $1 AND citizen_id = $2 AND status = 'ISSUED'`,
    [certificateNumber, user.citizenId]
  );
  if (!result.rows[0]?.certificate_pdf) throw httpError(404, 'Certificate PDF not found.');
  return result.rows[0].certificate_pdf;
}

module.exports = {
  submit,
  list,
  getForReview,
  publicApplication,
  getDocument,
  review,
  verifyCertificate,
  getCertificatePdf,
};
