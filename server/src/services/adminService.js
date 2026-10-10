const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const { hashPassword } = require('../utils/passwordHash');
const { query } = require('../config/database');
const { clearCache } = require('../config/settingsLoader');
const settingsRepository = require('../repositories/settingsRepository');

// -------------------------------------------------------------
// Dashboard stats
// -------------------------------------------------------------
async function getDashboardStats() {
  const [totalUsers, activeStaff, pendingActions] = await Promise.all([
    query('SELECT COUNT(*)::int AS c FROM users'),
    query("SELECT COUNT(*)::int AS c FROM users WHERE role <> 'CITIZEN' AND status = 'ACTIVE'"),
    query(`
      SELECT (
        (SELECT COUNT(*) FROM applications WHERE status IN ('SUBMITTED', 'UNDER_REVIEW'))
        + (SELECT COUNT(*) FROM police_cases WHERE status IN ('SUBMITTED', 'UNDER_INVESTIGATION'))
        + (SELECT COUNT(*) FROM pension_verifications WHERE status = 'PENDING')
      )::int AS c
    `),
  ]);

  return {
    totalUsers: totalUsers.rows[0].c,
    activeStaff: activeStaff.rows[0].c,
    pendingActions: pendingActions.rows[0].c,
    systemHealth: 'Healthy',
  };
}

// -------------------------------------------------------------
// Health check
// -------------------------------------------------------------
async function getHealth() {
  try {
    await query('SELECT 1');
    const now = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Africa/Maseru',
      hour: '2-digit',
      minute: '2-digit',
    });
    return { ok: true, checkedAt: now };
  } catch (err) {
    return { ok: false, message: 'Database is not responding.' };
  }
}

// -------------------------------------------------------------
// Recent activity (latest audit entries)
// -------------------------------------------------------------
async function getRecentActivity(limit = 5) {
  const rows = await auditService.getRecent(limit);
  return rows.map((r) => ({
    id: r.id,
    time: new Date(r.created_at).toLocaleTimeString('en-GB', {
      timeZone: 'Africa/Maseru',
      hour: '2-digit',
      minute: '2-digit',
    }),
    username: r.username,
    action: r.action,
  }));
}

// -------------------------------------------------------------
// Options for dropdowns
// -------------------------------------------------------------
async function getOptions() {
  const ministries = await settingsRepository.getMinistries();
  return {
    roles: [
      { value: 'CITIZEN', label: 'Citizen' },
      { value: 'STAFF', label: 'Staff' },
      { value: 'ADMIN', label: 'Admin' },
    ],
    ministries: ministries.map((m) => ({ value: m.code, label: m.name })),
    statuses: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
    ],
  };
}

// -------------------------------------------------------------
// Users — CRUD
// -------------------------------------------------------------
async function listUsers(filters) {
  const result = await userRepository.findAll(filters);
  return {
    rows: result.rows.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      roleLabel: labelForRole(u.role),
      ministry: u.ministry,
      ministryLabel: labelForMinistry(u.role, u.ministry),
      status: u.status,
      createdAt: u.created_at,
    })),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

async function getUser(id) {
  const user = await userRepository.findById(id);
  if (!user) throw notFound();
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    ministry: user.ministry,
    status: user.status,
  };
}

async function createUser(data, adminUser) {
  const existingUsername = await userRepository.findByUsername(data.username);
  if (existingUsername) throw badRequest('Username is already taken.');

  const existingEmail = await userRepository.findByEmail(data.email);
  if (existingEmail) throw badRequest('Email is already registered.');

  if (data.role === 'STAFF' && !data.ministry) {
    throw badRequest('Ministry is required for staff accounts.');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await userRepository.create({
    username: data.username,
    email: data.email,
    passwordHash,
    fullName: data.fullName,
    role: data.role === 'STAFF' ? data.ministry : data.role,
    ministry: data.role === 'STAFF' ? data.ministry : data.role === 'ADMIN' ? 'ADMIN' : null,
    status: data.status || 'ACTIVE',
  });

  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'Create User',
    recordType: 'USER',
    recordId: user.username,
    result: 'SUCCESS',
  });

  return { id: user.id, username: user.username };
}

async function updateUser(id, data, adminUser) {
  const target = await userRepository.findById(id);
  if (!target) throw notFound();

  const update = {
    full_name: data.fullName,
    email: data.email,
    role: data.role === 'STAFF' ? data.ministry : data.role,
    ministry: data.role === 'STAFF' ? data.ministry : data.role === 'ADMIN' ? 'ADMIN' : null,
    status: data.status,
  };

  await userRepository.update(id, update);

  if (data.password) {
    const passwordHash = await hashPassword(data.password);
    await userRepository.updatePassword(id, passwordHash);
  }

  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'Update User',
    recordType: 'USER',
    recordId: target.username,
    result: 'SUCCESS',
  });

  return { id, username: target.username };
}

// -------------------------------------------------------------
// Activate / deactivate
// -------------------------------------------------------------
async function deactivateUser(id, adminUser) {
  const target = await userRepository.findById(id);
  if (!target) throw notFound();
  if (target.id === adminUser.userId) {
    throw badRequest('You cannot deactivate your own account.');
  }
  if (target.status === 'INACTIVE') {
    return { id, username: target.username, status: 'INACTIVE' };
  }

  // Last active admin guard
  if (target.role === 'ADMIN') {
    const remaining = await userRepository.countActiveAdminsExcluding(id);
    if (remaining === 0) {
      throw badRequest('You cannot deactivate the last active administrator.');
    }
  }

  await userRepository.setStatus(id, 'INACTIVE');

  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'Deactivate User',
    recordType: 'USER',
    recordId: target.username,
    result: 'SUCCESS',
  });

  return { id, username: target.username, status: 'INACTIVE' };
}

async function activateUser(id, adminUser) {
  const target = await userRepository.findById(id);
  if (!target) throw notFound();

  await userRepository.setStatus(id, 'ACTIVE');

  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'Activate User',
    recordType: 'USER',
    recordId: target.username,
    result: 'SUCCESS',
  });

  return { id, username: target.username, status: 'ACTIVE' };
}

// -------------------------------------------------------------
// Delete — enforces "deactivate first" and last-admin guard
// -------------------------------------------------------------
async function deleteUser(id, adminUser) {
  const target = await userRepository.findById(id);
  if (!target) throw notFound();

  if (target.id === adminUser.userId) {
    throw badRequest('You cannot delete your own account.');
  }
  if (target.status === 'ACTIVE') {
    throw badRequest('Deactivate this user before deleting.');
  }
  if (target.role === 'ADMIN') {
    const remaining = await userRepository.countActiveAdminsExcluding(id);
    if (remaining === 0) {
      throw badRequest('You cannot delete the last active administrator.');
    }
  }

  await userRepository.remove(id);

  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'Delete User',
    recordType: 'USER',
    recordId: target.username,
    result: 'SUCCESS',
  });

  return { username: target.username };
}

// -------------------------------------------------------------
// System settings
// -------------------------------------------------------------
async function getSettings() {
  const rows = await settingsRepository.getAll();
  const map = {};
  rows.forEach((r) => {
    map[r.key] = r.value;
  });
  return map;
}

async function updateSettings(data, adminUser) {
  for (const [key, value] of Object.entries(data || {})) {
    await settingsRepository.update(key, value);
  }
  clearCache();
  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'Update Settings',
    recordType: 'SETTING',
    recordId: 'system_settings',
    result: 'SUCCESS',
  });
  return { success: true };
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function labelForRole(role) {
  const map = {
    CITIZEN: 'Citizen',
    ADMIN: 'Admin',
    HOME_AFFAIRS: 'Staff',
    TRAFFIC: 'Staff',
    POLICE: 'Staff',
    FINANCE: 'Staff',
    PENSIONS: 'Staff',
    PASSPORT: 'Staff',
  };
  return map[role] || role;
}

function labelForMinistry(role, ministry) {
  if (role === 'CITIZEN') return 'Not applicable';
  if (role === 'ADMIN') return 'Administration';
  const map = {
    HOME_AFFAIRS: 'Home Affairs',
    TRAFFIC: 'Traffic',
    POLICE: 'Police',
    FINANCE: 'Finance',
    PENSIONS: 'Pensions',
    PASSPORT: 'Passport',
  };
  return map[ministry] || ministry || '—';
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}
function notFound() {
  const err = new Error('User not found');
  err.statusCode = 404;
  return err;
}

module.exports = {
  getDashboardStats,
  getHealth,
  getRecentActivity,
  getOptions,
  listUsers,
  getUser,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
  getSettings,
  updateSettings,
};