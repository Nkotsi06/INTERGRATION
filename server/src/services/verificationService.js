const citizenRepository = require('../repositories/citizenRepository');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const sessionService = require('./sessionService');
const { verifyPassword } = require('../utils/passwordHash');
const logger = require('../utils/logger');

async function confirmIdentity({ password, user, ipAddress, userAgent }) {
  if (!user?.userId || typeof password !== 'string' || password.length === 0) {
    return { success: false, reason: 'invalid_input' };
  }

  // Step 1 — verify the citizen's password
  const account = await userRepository.findById(user.userId);
  if (!account || account.role !== 'CITIZEN' || !account.password_hash) {
    return { success: false, reason: 'wrong_password' };
  }

  const passwordOk = await verifyPassword(password, account.password_hash);
  if (!passwordOk) {
    await auditService.log({
      userId: user.userId,
      username: user.username,
      action: 'IDENTITY_VERIFICATION_FAILED',
      result: 'WRONG_PASSWORD',
      ipAddress,
      userAgent,
    });
    return { success: false, reason: 'wrong_password' };
  }

  // Step 2 — find the linked citizen record
  const citizen = account.citizen_id
    ? await citizenRepository.findById(account.citizen_id)
    : null;

  if (!citizen) {
    await auditService.log({
      userId: user.userId,
      username: user.username,
      action: 'IDENTITY_VERIFICATION_FAILED',
      result: 'NO_RECORD',
      ipAddress,
      userAgent,
    });
    return { success: false, reason: 'not_verified' };
  }

  // Step 3 — check verification status
  if (!citizen.is_verified) {
    await auditService.log({
      userId: user.userId,
      username: user.username,
      action: 'IDENTITY_VERIFICATION_FAILED',
      result: 'NOT_VERIFIED',
      ipAddress,
      userAgent,
    });
    return { success: false, reason: 'not_verified' };
  }

  // Step 4 — success
  const newToken = sessionService.buildVerifiedSession(user, citizen.id);

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'IDENTITY_VERIFICATION_SUCCESS',
    recordType: 'CITIZEN',
    recordId: citizen.id,
    result: 'SUCCESS',
    ipAddress,
    userAgent,
  });

  logger.info('Identity confirmation succeeded', { userId: user.userId });

  return {
    success: true,
    citizenId: citizen.id,
    token: newToken,
    citizen: {
      id: citizen.id,
      fullName: `${citizen.first_name} ${citizen.last_name}`,
      nationalId: citizen.national_id,
    },
  };
}

module.exports = { confirmIdentity };