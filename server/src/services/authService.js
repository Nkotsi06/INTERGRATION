const userRepository = require('../repositories/userRepository');
const citizenRepository = require('../repositories/citizenRepository');
const auditService = require('./auditService');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');
const { signToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const crypto = require('crypto');

async function registerWithNationalId({ nationalId, username }) {
  const normalizedNationalId = String(nationalId || '').trim();
  const normalizedUsername = String(username || '').trim();
  if (!/^\d{13}$/.test(normalizedNationalId)) {
    const error = new Error('Enter a valid 13-digit National ID number.');
    error.statusCode = 400;
    throw error;
  }
  if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(normalizedUsername)) {
    const error = new Error('Username must be 3–50 characters and use letters, numbers, dots, dashes, or underscores.');
    error.statusCode = 400;
    throw error;
  }

  const citizen = await citizenRepository.findByNationalId(normalizedNationalId);
  if (!citizen) {
    const error = new Error('That National ID was not found in the national registry.');
    error.statusCode = 404;
    throw error;
  }
  if (await userRepository.findByCitizenId(citizen.id)) {
    const error = new Error('An account is already registered for this National ID.');
    error.statusCode = 409;
    throw error;
  }
  if (await userRepository.findByUsername(normalizedUsername)) {
    const error = new Error('Username already taken.');
    error.statusCode = 409;
    throw error;
  }

  const temporaryPassword = crypto.randomBytes(18).toString('base64url');
  const passwordHash = await hashPassword(temporaryPassword);
  const accountEmail = citizen.email ||
    `${normalizedNationalId}@citizen.gov.ls`;
  const emailExists = await userRepository.findByEmail(accountEmail);
  const user = await userRepository.create({
    username: normalizedUsername,
    email: emailExists ? `${normalizedNationalId}@citizen.gov.ls` : accountEmail,
    passwordHash,
    fullName: `${citizen.first_name} ${citizen.last_name}`.trim(),
    role: 'CITIZEN',
    mustChangePassword: true,
    citizenId: citizen.id,
  });

  logger.info(`National ID account registered: ${normalizedNationalId}`);
  return {
    username: user.username,
    nationalId: normalizedNationalId,
    temporaryPassword,
    mustChangePassword: true,
  };
}

async function login({ username, nationalId, password, expectedRoleGroup }) {
  let user;
  if (nationalId) {
    const citizen = await citizenRepository.findByNationalId(String(nationalId).trim());
    if (citizen) user = await userRepository.findByCitizenId(citizen.id);
  } else {
    user = await userRepository.findByUsername(username);
  }
  if (!user) throw new Error('Invalid username or password');
  if (user.status !== 'ACTIVE') throw new Error('Account is inactive');

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw new Error('Invalid username or password');

  // Role group check
  if (expectedRoleGroup === 'CITIZEN' && user.role !== 'CITIZEN') {
    throw new Error('Please use the staff login for staff accounts');
  }
  if (
    expectedRoleGroup === 'STAFF' &&
    !['HOME_AFFAIRS', 'TRAFFIC', 'POLICE', 'FINANCE', 'PENSIONS', 'PASSPORT'].includes(
      user.role
    )
  ) {
    throw new Error('Please use the correct login for your account type');
  }
  if (expectedRoleGroup === 'ADMIN' && user.role !== 'ADMIN') {
    throw new Error('Administrator access only');
  }

  // ─── FIX: reflect DB verification state at login ─────────────────────
  let identityVerified = false;
  let verifiedCitizenId = null;

  if (user.citizen_id) {
    const citizen = await citizenRepository.findById(user.citizen_id);
    if (citizen && citizen.is_verified) {
      identityVerified = true;
      verifiedCitizenId = citizen.id;
    }
  }
  // ─────────────────────────────────────────────────────────────────────

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
    citizenId: user.citizen_id || null,
    mustChangePassword: user.must_change_password === true,
    identityVerified,
    verifiedCitizenId,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      ministry: user.ministry,
      citizenId: user.citizen_id || null,
      mustChangePassword: user.must_change_password === true,
    },
  };
}

async function getSession(userId) {
  const user = await userRepository.findById(userId);
  if (!user) return null;
  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      ministry: user.ministry,
      citizenId: user.citizen_id || null,
      mustChangePassword: user.must_change_password === true,
    },
  };
}

module.exports = { registerWithNationalId, login, getSession };