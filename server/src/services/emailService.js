const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Setup reusable transporter using env or fallbacks
function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to test/log transporter when SMTP credentials are not yet configured
  return {
    sendMail: async (options) => {
      logger.info(`[EmailService - Simulated Send]
To: ${options.to}
Subject: ${options.subject}
Content: ${options.text || options.html?.slice(0, 100)}...`);
      return { messageId: `mock-${Date.now()}` };
    },
  };
}

const transporter = createTransporter();

/**
 * Send Birth Certificate notification email to citizen with official certificate URL
 */
async function sendBirthCertificate(toEmail, details = {}) {
  const {
    certificateNumber = 'N/A',
    childFullName = 'Citizen',
    childNationalId = 'Pending',
    certificateUrl = '#',
  } = details;

  if (!toEmail) {
    logger.warn('sendBirthCertificate called without an email address.');
    return null;
  }

  const subject = `Official Birth Certificate Issued - ${certificateNumber} | Kingdom of Lesotho`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .header { background: #1A5276; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 28px; }
        .details-box { background: #f1f5f9; border-left: 4px solid #1A5276; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0; }
        .details-box p { margin: 6px 0; font-size: 14px; }
        .button { display: inline-block; background: #1A5276; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 16px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kingdom of Lesotho</h1>
          <p>Ministry of Home Affairs · Civil Registration Department</p>
        </div>
        <div class="content">
          <h2>Official Birth Certificate Issued</h2>
          <p>Dear Citizen,</p>
          <p>We are pleased to notify you that the official birth certificate has been registered and issued successfully in the national registry.</p>
          
          <div class="details-box">
            <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
            <p><strong>Child's Full Name:</strong> ${childFullName}</p>
            <p><strong>National ID:</strong> ${childNationalId || 'N/A'}</p>
            <p><strong>Status:</strong> ISSUED &amp; VERIFIED</p>
          </div>

          <p>You can access, view, or download the official digital PDF certificate at any time via the Lesotho Integrated Government Services Portal:</p>
          
          <p style="text-align: center;">
            <a href="${certificateUrl}" class="button" target="_blank" rel="noopener noreferrer">
              Download Birth Certificate PDF
            </a>
          </p>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            If the button above does not work, copy and paste this link into your browser:<br>
            <a href="${certificateUrl}" style="color: #1A5276;">${certificateUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from the Lesotho Integrated Government Services System. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Kingdom of Lesotho - Ministry of Home Affairs
Official Birth Certificate Issued

Dear Citizen,
The official birth certificate has been issued:
- Certificate Number: ${certificateNumber}
- Child Full Name: ${childFullName}
- National ID: ${childNationalId}

You can download your official certificate here: ${certificateUrl}
`;

  try {
    const fromAddress = process.env.EMAIL_FROM || '"Lesotho Home Affairs" <no-reply@gov.ls>';
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text,
      html,
    });
    logger.info(`Birth certificate email sent to ${toEmail} (Certificate: ${certificateNumber})`);
    return info;
  } catch (err) {
    logger.error(`Failed to send birth certificate email to ${toEmail}: ${err.message}`);
    throw err;
  }
}

module.exports = {
  sendBirthCertificate,
};

