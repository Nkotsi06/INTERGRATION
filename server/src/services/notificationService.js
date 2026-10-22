const notificationRepository = require('../repositories/notificationRepository');
const logger = require('../utils/logger');

async function notify(userId, title, message) {
  if (!userId) {
    logger.warn(`Notification attempted without userId. Title: ${title}`);
    return null;
  }
  return notificationRepository.create({ userId, title, message });
}

async function getForUser(userId) {
  return notificationRepository.findByUser(userId);
}

async function markRead(id, userId) {
  const row = await notificationRepository.findById(id);
  if (!row) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  if (row.user_id !== userId) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }
  return notificationRepository.markRead(id);
}

async function markAllRead(userId) {
  return notificationRepository.markAllRead(userId);
}

async function deleteForUser(id, userId) {
  const row = await notificationRepository.findById(id);
  if (!row) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  if (row.user_id !== userId) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }
  return notificationRepository.deleteById(id);
}

// ─────────────────────────────────────────────────────────────────────
// MODULE-SPECIFIC NOTIFICATION TRIGGERS
// ─────────────────────────────────────────────────────────────────────

// Home Affairs
async function triggerHomeAffairsNewBirth(userId, data = {}) {
  const ref = data.reference || data.referenceNumber || data.id || '';
  return notify(
    userId,
    'New Birth Application',
    data.message || `A new birth certificate application has been submitted${ref ? ` (Ref: ${ref})` : ''}.`
  );
}

async function triggerHomeAffairsBiometricsUploaded(userId, data = {}) {
  const name = data.citizenName || data.nationalId || '';
  return notify(
    userId,
    'Biometrics Uploaded',
    data.message || `Biometrics have been uploaded and recorded${name ? ` for ${name}` : ''}.`
  );
}

// Police
async function triggerPoliceNewCaseAssigned(userId, data = {}) {
  const caseNum = data.caseNumber || data.id || '';
  return notify(
    userId,
    'New Case Assigned',
    data.message || `A new case${caseNum ? ` #${caseNum}` : ''} has been assigned for investigation.`
  );
}

async function triggerPoliceClearancePending(userId, data = {}) {
  const ref = data.reference || data.referenceNumber || '';
  return notify(
    userId,
    'Clearance Application Pending',
    data.message || `A police clearance certificate application${ref ? ` (${ref})` : ''} is pending review.`
  );
}

// Passport
async function triggerPassportReceived(userId, data = {}) {
  const ref = data.reference || data.referenceNumber || '';
  return notify(
    userId,
    'Application Received',
    data.message || `Your passport application${ref ? ` (${ref})` : ''} has been received and is queued for processing.`
  );
}

async function triggerPassportReady(userId, data = {}) {
  const branch = data.branch || data.branchName || 'the collection center';
  return notify(
    userId,
    'Ready for Collection',
    data.message || `Your passport has been printed and is ready for collection at ${branch}.`
  );
}

async function triggerPassportExpiringSoon(userId, data = {}) {
  const dateStr = data.expiryDate ? ` on ${data.expiryDate}` : ' within the next 6 months';
  return notify(
    userId,
    'Expiring Soon',
    data.message || `Notice: Your Lesotho passport is expiring${dateStr}. Please submit a renewal application.`
  );
}

// Traffic
async function triggerTrafficApproved(userId, data = {}) {
  const ref = data.reference || data.referenceNumber || '';
  return notify(
    userId,
    'Application Approved',
    data.message || `Your traffic service application${ref ? ` (${ref})` : ''} has been approved.`
  );
}

async function triggerTrafficPaymentReceived(userId, data = {}) {
  const amount = data.amount ? ` of M${data.amount}` : '';
  const receipt = data.receiptNumber ? ` (Receipt: ${data.receiptNumber})` : '';
  return notify(
    userId,
    'Payment Received',
    data.message || `Payment${amount} was successfully verified and recorded${receipt}.`
  );
}

// Finance
async function triggerFinancePensionApplication(userId, data = {}) {
  const name = data.citizenName || data.nationalId || '';
  return notify(
    userId,
    'Pension Application',
    data.message || `A new pension benefit application has been received${name ? ` for ${name}` : ''}.`
  );
}

async function triggerFinanceDebtDetected(userId, data = {}) {
  const amount = data.amount ? ` of M${data.amount}` : '';
  return notify(
    userId,
    'Debt Detected',
    data.message || `System alert: Outstanding government debt${amount} detected on account.`
  );
}

async function triggerFinanceDoublePensionFlagged(userId, data = {}) {
  const id = data.nationalId || data.citizenId || '';
  return notify(
    userId,
    'Double Pension Flagged',
    data.message || `Audit alert: Potential duplicate/double pension claim flagged${id ? ` for National ID ${id}` : ''}.`
  );
}

// Admin
async function triggerAdminNewUser(userId, data = {}) {
  const username = data.username ? ` (${data.username})` : '';
  const role = data.role ? ` with role ${data.role}` : '';
  return notify(
    userId,
    'New User Registered',
    data.message || `A new user account${username} has been registered${role}.`
  );
}

async function triggerAdminSystemError(userId, data = {}) {
  const errorMsg = data.error || data.message || 'Internal server error';
  return notify(
    userId,
    'System Error (500)',
    `Server Exception 500: ${errorMsg}`
  );
}

// Trigger dispatcher
async function trigger(eventType, userId, data = {}) {
  switch (eventType) {
    case 'HOME_AFFAIRS_NEW_BIRTH':
      return triggerHomeAffairsNewBirth(userId, data);
    case 'HOME_AFFAIRS_BIOMETRICS_UPLOADED':
      return triggerHomeAffairsBiometricsUploaded(userId, data);
    case 'POLICE_NEW_CASE_ASSIGNED':
      return triggerPoliceNewCaseAssigned(userId, data);
    case 'POLICE_CLEARANCE_PENDING':
      return triggerPoliceClearancePending(userId, data);
    case 'PASSPORT_RECEIVED':
      return triggerPassportReceived(userId, data);
    case 'PASSPORT_READY':
      return triggerPassportReady(userId, data);
    case 'PASSPORT_EXPIRING_SOON':
      return triggerPassportExpiringSoon(userId, data);
    case 'TRAFFIC_APPROVED':
      return triggerTrafficApproved(userId, data);
    case 'TRAFFIC_PAYMENT_RECEIVED':
      return triggerTrafficPaymentReceived(userId, data);
    case 'FINANCE_PENSION_APPLICATION':
      return triggerFinancePensionApplication(userId, data);
    case 'FINANCE_DEBT_DETECTED':
      return triggerFinanceDebtDetected(userId, data);
    case 'FINANCE_DOUBLE_PENSION_FLAGGED':
      return triggerFinanceDoublePensionFlagged(userId, data);
    case 'ADMIN_NEW_USER':
      return triggerAdminNewUser(userId, data);
    case 'ADMIN_SYSTEM_ERROR':
      return triggerAdminSystemError(userId, data);
    default:
      return notify(userId, data.title || eventType, data.message || 'System Notification');
  }
}

module.exports = {
  notify,
  getForUser,
  markRead,
  markAllRead,
  deleteForUser,
  trigger,
  // Module triggers
  triggerHomeAffairsNewBirth,
  triggerHomeAffairsBiometricsUploaded,
  triggerPoliceNewCaseAssigned,
  triggerPoliceClearancePending,
  triggerPassportReceived,
  triggerPassportReady,
  triggerPassportExpiringSoon,
  triggerTrafficApproved,
  triggerTrafficPaymentReceived,
  triggerFinancePensionApplication,
  triggerFinanceDebtDetected,
  triggerFinanceDoublePensionFlagged,
  triggerAdminNewUser,
  triggerAdminSystemError,
};
