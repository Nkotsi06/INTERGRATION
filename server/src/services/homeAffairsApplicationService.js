const { query } = require('../config/database');
const notificationService = require('./notificationService');
const certificateService = require('./certificateService');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const logger = require('../utils/logger');

async function listApplications(filters) {
  let sql = `
    SELECT 
      a.*, 
      c.first_name, c.last_name, c.national_id as citizen_national_id,
      b.name as branch_name, b.address as branch_address, b.opening_hours
    FROM applications a
    LEFT JOIN citizens c ON c.id = a.citizen_id
    LEFT JOIN branches b ON b.id::text = (a.data->'formData'->>'branchId')
    WHERE a.service = 'HOME_AFFAIRS'
  `;
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    sql += ` AND a.status = $${params.length}`;
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    sql += ` AND (a.reference_number ILIKE $${params.length} OR c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length})`;
  }

  sql += ' ORDER BY a.submitted_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function getApplication(id) {
  const result = await query(
    `SELECT a.*,
            c.first_name, c.last_name, c.national_id AS citizen_national_id,
            c.date_of_birth, c.gender, c.place_of_birth, c.address,
            c.phone, c.email, c.nationality, c.is_verified,
            b.name AS branch_name, b.address AS branch_address
     FROM applications a
     LEFT JOIN citizens c ON c.id = a.citizen_id
     LEFT JOIN branches b ON b.id::text = (a.data->'formData'->>'branchId')
     WHERE a.id = $1 AND a.service = 'HOME_AFFAIRS'`,
    [id]
  );
  return result.rows[0];
}

async function updateStatus(id, newStatus, staffUser) {
  const app = await getApplication(id);
  if (!app) throw new Error('Application not found.');

  if (app.status === 'COLLECTED') {
    throw new Error('This application has already been collected and cannot be changed.');
  }

  if (newStatus === 'COLLECTED') {
    await query(
      `UPDATE applications
       SET status = $1, collected_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [newStatus, id]
    );
  } else {
    await query(
      `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, id]
    );
  }

  await query(
    `INSERT INTO application_status_history (application_id, status, changed_by, notes)
     VALUES ($1, $2, $3, $4)`,
    [id, newStatus, staffUser.userId, `Status changed to ${newStatus} by staff.`]
  );

  if (newStatus === 'READY_FOR_COLLECTION' || newStatus === 'COLLECTED') {
    try {
      await certificateService.createNationalIdCardFromApplication({
        application: app,
        staffUser,
      });
    } catch (err) {
      logger.error(
        `Could not create a National ID card for application ${id}:`,
        err
      );
    }
  }

  const owner = await userRepository.findByCitizenId(app.citizen_id);
  if (owner) {
    let message = `Your application ${app.reference_number} is now ${newStatus.replace(/_/g, ' ')}.`;
    if (newStatus === 'READY_FOR_COLLECTION') {
      message += ` Please collect it at ${app.branch_name} (${app.branch_address}).`;
    }
    await notificationService.notify(owner.id, 'Application Update', message);
  }

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `HA_APPLICATION_${newStatus}`,
    recordType: 'APPLICATION',
    recordId: id,
    result: 'SUCCESS',
  });
}

async function recordCollection(id, data, staffUser) {
  const app = await getApplication(id);
  if (!app) throw new Error('Application not found.');
  if (app.status !== 'READY_FOR_COLLECTION') {
    throw new Error('This application is not ready for collection.');
  }

  await query(
    `UPDATE applications 
     SET status = 'COLLECTED', collected_at = NOW(), collected_by_name = $1, collected_by_staff_id = $2, id_checked = $3, updated_at = NOW()
     WHERE id = $4`,
    [data.collectedByName, staffUser.userId, data.idChecked, id]
  );

  await query(
    `INSERT INTO application_status_history (application_id, status, changed_by, notes)
     VALUES ($1, 'COLLECTED', $2, $3)`,
    [id, staffUser.userId, `Collected by ${data.collectedByName}. ID Checked: ${data.idChecked ? 'Yes' : 'No'}.`]
  );

  try {
    await certificateService.createNationalIdCardFromApplication({
      application: app,
      staffUser,
    });
  } catch (err) {
    logger.error(
      `Could not create a National ID card for application ${id}:`,
      err
    );
  }

  const owner = await userRepository.findByCitizenId(app.citizen_id);
  if (owner) {
    await notificationService.notify(
      owner.id,
      'Document Collected',
      `Your document ${app.reference_number} has been successfully collected.`
    );
  }

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'HA_APPLICATION_COLLECTED',
    recordType: 'APPLICATION',
    recordId: id,
    result: 'SUCCESS',
  });
}

module.exports = { listApplications, getApplication, updateStatus, recordCollection };