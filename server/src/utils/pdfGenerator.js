const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generateTaxClearancePDF(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('TAX CLEARANCE CERTIFICATE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('Lesotho Revenue Authority', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12);
      doc.text(`Certificate ID: ${data.certificateId}`);
      doc.text(`TIN: ${data.tin}`);
      doc.text(`Legal Name: ${data.legalName}`);
      doc.text(`Trading Name: ${data.tradingName || '-'}`);
      doc.text(`Nature of Business: ${data.natureOfBusiness || '-'}`);
      doc.text(`Address: ${data.address}`);
      doc.moveDown();
      doc.text(`Date Issued: ${data.dateIssued}`);
      doc.text(`Valid Until: ${data.validUntil}`);

      // QR Code
      if (data.verificationUrl) {
        const qrDataUrl = await QRCode.toDataURL(data.verificationUrl);
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, { fit: [120, 120], align: 'right' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateTaxClearancePDF };