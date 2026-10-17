const { query } = require('../config/database');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const { generateReference } = require('../utils/referenceGenerator');

// --- INFORMATION TOPICS ---
async function listInformation() {
  const result = await query('SELECT * FROM information_topics ORDER BY title');
  return result.rows;
}

async function updateInformation(code, data) {
  const result = await query(
    `UPDATE information_topics 
     SET content = $1, contact_details = $2, is_published = $3, updated_at = NOW()
     WHERE code = $4 RETURNING *`,
    [data.content, data.contact_details, data.is_published, code]
  );
  return result.rows[0];
}

// --- ENQUIRIES ---
async function createEnquiry(citizenId, data, user) {
  const referenceNumber = await generateReference('ENQUIRY');
  
  const result = await query(
    `INSERT INTO document_enquiries (citizen_id, reference_number, subject, message)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [citizenId, referenceNumber, data.subject, data.message]
  );

  const enquiry = result.rows[0];

  // Notify Home Affairs staff
  // (Assuming we notify all staff or the system just shows it on the queue)
  await notificationService.notify(
    user.userId,
    'Enquiry Submitted',
    `Your enquiry ${referenceNumber} has been received.`
  );

  return enquiry;
}

async function listEnquiries(filters) {
  let sql = `
    SELECT e.*, c.first_name, c.last_name, c.national_id
    FROM document_enquiries e
    JOIN citizens c ON c.id = e.citizen_id
    WHERE 1=1
  `;
  const params = [];
  
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND e.status = $${params.length}`;
  }
  
  sql += ' ORDER BY e.created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function getEnquiry(id) {
  const result = await query(
    `SELECT e.*, c.first_name, c.last_name, c.national_id
     FROM document_enquiries e
     JOIN citizens c ON c.id = e.citizen_id
     WHERE e.id = $1`,
    [id]
  );
  const enquiry = result.rows[0];
  
  if (enquiry) {
    const msgs = await query(
      `SELECT m.*, u.username, u.role 
       FROM enquiry_messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.enquiry_id = $1 ORDER BY m.created_at ASC`,
      [id]
    );
    enquiry.messages = msgs.rows;
  }
  return enquiry;
}

async function replyToEnquiry(id, message, staffUser) {
  // 1. Add message
  await query(
    `INSERT INTO enquiry_messages (enquiry_id, sender_id, message) VALUES ($1, $2, $3)`,
    [id, staffUser.userId, message]
  );

  // 2. Mark as resolved (optional, but usually a reply resolves the initial question)
  await query(`UPDATE document_enquiries SET status = 'RESOLVED' WHERE id = $1`, [id]);

  // 3. Notify citizen
  const enquiryRes = await query('SELECT citizen_id, reference_number FROM document_enquiries WHERE id = $1', [id]);
  if (enquiryRes.rows.length > 0) {
    const owner = await userRepository.findByCitizenId(enquiryRes.rows[0].citizen_id);
    if (owner) {
      await notificationService.notify(
        owner.id,
        'Enquiry Reply',
        `Home Affairs has replied to your enquiry ${enquiryRes.rows[0].reference_number}.`
      );
    }
  }
}

// --- DOCUMENT VERIFICATION ---
async function verifyDocument(numberOrId) {
  // This is a simple lookup. It checks certificates and citizen records.
  const cert = await query(
    `SELECT certificate_number, 'BIRTH' as type FROM birth_certificates WHERE certificate_number = $1
     UNION
     SELECT certificate_number, 'DEATH' as type FROM death_certificates_new WHERE certificate_number = $1
     UNION
     SELECT certificate_number, 'MARRIAGE' as type FROM marriage_certificates WHERE certificate_number = $1`,
    [numberOrId]
  );

  if (cert.rows.length > 0) {
    return { valid: true, type: cert.rows[0].type, number: cert.rows[0].certificate_number };
  }

  const citizen = await query('SELECT national_id, first_name, last_name FROM citizens WHERE national_id = $1', [numberOrId]);
  if (citizen.rows.length > 0) {
    return { valid: true, type: 'NATIONAL ID', number: citizen.rows[0].national_id, name: `${citizen.rows[0].first_name} ${citizen.rows[0].last_name}` };
  }

  return { valid: false };
}

module.exports = {
  listInformation,
  updateInformation,
  createEnquiry,
  listEnquiries,
  getEnquiry,
  replyToEnquiry,
  verifyDocument
};