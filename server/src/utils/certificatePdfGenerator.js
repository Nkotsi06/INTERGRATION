const PDFDocument = require('pdfkit');

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-GB');
}

function buildHeader(doc, title) {
  doc.fontSize(18).fillColor('#1A5276').text('Kingdom of Lesotho', { align: 'center' });
  doc.fontSize(12).fillColor('#2C3E50')
    .text('Integrated Government Services System', { align: 'center' });
  doc.moveDown(0.4);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#D5DBDB');
  doc.moveDown(1.2);
  doc.fontSize(20).fillColor('#1A5276').text(title, { align: 'center' });
  doc.moveDown(1);
}

function rows(doc, pairs) {
  pairs.forEach(([label, value]) => {
    doc.fontSize(11).fillColor('#7F8C8D').text(label, { continued: true });
    doc.fillColor('#2C3E50').text(`  ${value ?? '—'}`);
    doc.moveDown(0.3);
  });
}

function buildBirthCertificate(row) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  buildHeader(doc, 'Birth Certificate');
  doc.moveDown(1);
  rows(doc, [
    ['Certificate number', row.certificate_number],
    ['Child full name', row.child_full_name],
    ['National ID', row.child_national_id],
    ['Date of birth', fmtDate(row.child_date_of_birth)],
    ['Gender', row.child_gender],
    ['Place of birth', row.place_of_birth],
    ['Mother', row.mother_full_name],
    ['Father', row.father_full_name],
    ['Issued on', fmtDate(row.issued_at)],
  ]);
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#7F8C8D')
    .text('This certificate is issued by the Ministry of Home Affairs.', { align: 'center' });
  doc.end();
  return doc;
}

function buildDeathCertificate(row) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  buildHeader(doc, 'Death Certificate');
  doc.moveDown(1);
  rows(doc, [
    ['Certificate number', row.certificate_number],
    ['Deceased full name', row.deceased_full_name],
    ['National ID', row.deceased_national_id],
    ['Date of death', fmtDate(row.date_of_death)],
    ['Place of death', row.place_of_death],
    ['Cause of death', row.cause_of_death],
    ['Informant', row.informant_full_name],
    ['Relationship', row.informant_relationship],
    ['Issued on', fmtDate(row.issued_at)],
  ]);
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#7F8C8D')
    .text('This certificate is issued by the Ministry of Home Affairs.', { align: 'center' });
  doc.end();
  return doc;
}

function buildMarriageCertificate(row) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  buildHeader(doc, 'Marriage Certificate');
  doc.moveDown(1);
  rows(doc, [
    ['Certificate number', row.certificate_number],
    ['Spouse 1', row.spouse1_full_name],
    ['Spouse 1 National ID', row.spouse1_national_id],
    ['Spouse 2', row.spouse2_full_name],
    ['Spouse 2 National ID', row.spouse2_national_id],
    ['Date of marriage', fmtDate(row.marriage_date)],
    ['Place', row.marriage_place],
    ['Officiant', row.marriage_officiant],
    ['Issued on', fmtDate(row.issued_at)],
  ]);
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#7F8C8D')
    .text('This certificate is issued by the Ministry of Home Affairs.', { align: 'center' });
  doc.end();
  return doc;
}

function buildDivorceCertificate(row) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  buildHeader(doc, 'Divorce Certificate');
  doc.moveDown(1);
  rows(doc, [
    ['Certificate number', row.certificate_number],
    ['Spouse 1', row.spouse1_full_name],
    ['Spouse 1 National ID', row.spouse1_national_id],
    ['Former spouse', row.spouse2_full_name],
    ['Former spouse National ID', row.spouse2_national_id],
    ['Date of divorce', fmtDate(row.divorce_date)],
    ['Court', row.court_name],
    ['Case number', row.case_number],
    ['Issued on', fmtDate(row.issued_at)],
  ]);
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#7F8C8D')
    .text('This certificate is issued by the Ministry of Home Affairs.', { align: 'center' });
  doc.end();
  return doc;
}

function buildNationalIdCard(row) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  buildHeader(doc, 'National Identity Card');
  rows(doc, [
    ['Card number', row.card_number],
    ['Full name', `${row.first_name || ''} ${row.last_name || ''}`.trim()],
    ['National ID', row.national_id],
    ['Date of birth', fmtDate(row.date_of_birth)],
    ['Gender', row.gender],
    ['Issued on', fmtDate(row.issued_at)],
  ]);
  if (row.signature_data && /^data:image\/png;base64,/.test(row.signature_data)) {
    const image = Buffer.from(row.signature_data.split(',')[1], 'base64');
    doc.moveDown();
    doc.image(image, { fit: [180, 70] });
    doc.fontSize(9).fillColor('#7F8C8D').text('Signature of holder');
  }
  doc.end();
  return doc;
}

function generateCertificatePdf(type, row) {
  switch (type) {
    case 'BIRTH': return buildBirthCertificate(row);
    case 'DEATH': return buildDeathCertificate(row);
    case 'MARRIAGE': return buildMarriageCertificate(row);
    case 'DIVORCE': return buildDivorceCertificate(row);
    case 'ID_CARD': return buildNationalIdCard(row);
    default: throw new Error(`Unknown certificate type: ${type}`);
  }
}

function generateCertificateBuffer(type, row) {
  return new Promise((resolve, reject) => {
    const doc = generateCertificatePdf(type, row);
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

module.exports = { generateCertificateBuffer };