const userRepository = require('../repositories/userRepository');
const citizenRepository = require('../repositories/citizenRepository');
const auditService = require('./auditService');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');
const { signToken } = require('../utils/jwt');
const logger = require('../utils/logger');

async function register({ username, email, password, fullName, role = 'CITIZEN' }) {
  const existing = await userRepository.findByUsername(username);
  if (existing) throw new Error('Username already taken');

  const emailExists = await userRepository.findByEmail(email);
  if (emailExists) throw new Error('Email already registered');

  const passwordHash = await hashPassword(password);

  const user = await userRepository.create({
    username,
    email,
    passwordHash,
    fullName: fullName || username,
    role,
    ministry: null,
  });

  logger.info(`New user registered: ${username} (${role})`);
  return { id: user.id, username: user.username, role: user.role };
}

async function login({ username, password, expectedRoleGroup }) {
  const user = await userRepository.findByUsername(username);
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
    },
  };
}

module.exports = { register, login, getSession };