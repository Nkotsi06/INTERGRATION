const adminService = require('../services/adminService');

async function getStats(req, res, next) {
  try { res.json(await adminService.getDashboardStats()); } catch (e) { next(e); }
}

async function getHealth(req, res, next) {
  try { res.json(await adminService.getHealth()); } catch (e) { next(e); }
}

async function getActivity(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '5', 10);
    res.json(await adminService.getRecentActivity(limit));
  } catch (e) { next(e); }
}

async function getOptions(req, res, next) {
  try { res.json(await adminService.getOptions()); } catch (e) { next(e); }
}

async function getUsers(req, res, next) {
  try {
    const filters = {
      username: req.query.username,
      role: req.query.role,
      status: req.query.status,
      page: parseInt(req.query.page || '1', 10),
      pageSize: Math.min(parseInt(req.query.pageSize || '10', 10), 100),
    };
    res.json(await adminService.listUsers(filters));
  } catch (e) { next(e); }
}

async function getUser(req, res, next) {
  try { res.json(await adminService.getUser(req.params.id)); } catch (e) { next(e); }
}

async function createUser(req, res, next) {
  try {
    const result = await adminService.createUser(req.body, req.user);
    res.status(201).json(result);
  } catch (e) { next(e); }
}

async function updateUser(req, res, next) {
  try {
    res.json(await adminService.updateUser(req.params.id, req.body, req.user));
  } catch (e) { next(e); }
}

async function activateUser(req, res, next) {
  try {
    res.json(await adminService.activateUser(req.params.id, req.user));
  } catch (e) { next(e); }
}

async function deactivateUser(req, res, next) {
  try {
    res.json(await adminService.deactivateUser(req.params.id, req.user));
  } catch (e) { next(e); }
}

async function deleteUser(req, res, next) {
  try {
    res.json(await adminService.deleteUser(req.params.id, req.user));
  } catch (e) { next(e); }
}

async function getSettings(req, res, next) {
  try { res.json(await adminService.getSettings()); } catch (e) { next(e); }
}

async function updateSettings(req, res, next) {
  try {
    res.json(await adminService.updateSettings(req.body, req.user));
  } catch (e) { next(e); }
}

// ─── Biometric settings ─────────────────────────────────────────────
async function getBiometricSettings(req, res, next) {
  try {
    const all = await adminService.getSettings();
    res.json({
      fingerprintEnabled: all.biometric_fingerprint_enabled !== 'false',
      facialEnabled:      all.biometric_facial_enabled !== 'false',
      matchThreshold:     parseInt(all.biometric_match_threshold || '85', 10),
      maxAttempts:        parseInt(all.biometric_max_attempts || '3', 10),
    });
  } catch (e) { next(e); }
}

async function updateBiometricSettings(req, res, next) {
  try {
    const map = {
      fingerprintEnabled: 'biometric_fingerprint_enabled',
      facialEnabled:      'biometric_facial_enabled',
      matchThreshold:     'biometric_match_threshold',
      maxAttempts:        'biometric_max_attempts',
    };
    const patch = {};
    for (const [key, settingKey] of Object.entries(map)) {
      if (req.body[key] !== undefined) patch[settingKey] = String(req.body[key]);
    }
    await adminService.updateSettings(patch, req.user);
    res.json({ success: true });
  } catch (e) { next(e); }
}
// ────────────────────────────────────────────────────────────────────

module.exports = {
  getStats,
  getHealth,
  getActivity,
  getOptions,
  getUsers,
  getUser,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
  getSettings,
  updateSettings,
  getBiometricSettings,
  updateBiometricSettings,
};