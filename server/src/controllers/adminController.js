const adminService = require('../services/adminService');
const settingsRepository = require('../repositories/settingsRepository');
const documentTypeRepository = require('../repositories/documentTypeRepository');
const referenceFormatRepository = require('../repositories/referenceFormatRepository');
const languageRepository = require('../repositories/languageRepository');

// ─── Existing handlers (unchanged) ──────────────────────────────────
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
  try { res.status(201).json(await adminService.createUser(req.body, req.user)); } catch (e) { next(e); }
}

async function updateUser(req, res, next) {
  try { res.json(await adminService.updateUser(req.params.id, req.body, req.user)); } catch (e) { next(e); }
}

async function activateUser(req, res, next) {
  try { res.json(await adminService.activateUser(req.params.id, req.user)); } catch (e) { next(e); }
}

async function deactivateUser(req, res, next) {
  try { res.json(await adminService.deactivateUser(req.params.id, req.user)); } catch (e) { next(e); }
}

async function deleteUser(req, res, next) {
  try { res.json(await adminService.deleteUser(req.params.id, req.user)); } catch (e) { next(e); }
}

async function getSettings(req, res, next) {
  try { res.json(await adminService.getSettings()); } catch (e) { next(e); }
}

async function updateSettings(req, res, next) {
  try { res.json(await adminService.updateSettings(req.body, req.user)); } catch (e) { next(e); }
}

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

// ─── Config-page handlers (previously missing) ──────────────────────
// These were called by the frontend but no backend route existed, so
// MinistryConfig / DocumentTypeConfig / StatusConfig / ReferenceFormatConfig
// / LanguageConfig all 404'd on save. Each just delegates to an
// existing repository method.

async function updateMinistry(req, res, next) {
  try {
    const updated = await settingsRepository.updateMinistry(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Ministry not found' });
    res.json(updated);
  } catch (e) { next(e); }
}

async function updateDocumentType(req, res, next) {
  try {
    // documentTypeRepository has only findByCode / findAll. We use a
    // direct query here since the frontend's DocumentTypeConfig page
    // is the only writer of document_types rows.
    const { query } = require('../config/database');
    const fields = [];
    const params = [];
    const allowed = ['name', 'accepted_formats', 'max_size_mb', 'is_required', 'display_order', 'is_active'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        params.push(req.body[key]);
        fields.push(`${key} = $${params.length}`);
      }
    }
    if (fields.length === 0) {
      const existing = await documentTypeRepository.findAll();
      const match = existing.find((d) => d.id === req.params.id);
      if (!match) return res.status(404).json({ message: 'Document type not found' });
      return res.json(match);
    }
    params.push(req.params.id);
    const result = await query(
      `UPDATE document_types SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Document type not found' });
    res.json(result.rows[0]);
  } catch (e) { next(e); }
}

async function updateStatusType(req, res, next) {
  try {
    const { query } = require('../config/database');
    const fields = [];
    const params = [];
    const allowed = ['name', 'colour_hex', 'applies_to', 'display_order', 'is_active'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        params.push(req.body[key]);
        fields.push(`${key} = $${params.length}`);
      }
    }
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    params.push(req.params.id);
    const result = await query(
      `UPDATE status_types SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Status type not found' });
    res.json(result.rows[0]);
  } catch (e) { next(e); }
}

async function updateReferenceFormat(req, res, next) {
  try {
    // referenceFormatRepository.update expects snake_case keys:
    // prefix, year_format, sequence_length.
    const data = {
      prefix: req.body.prefix,
      year_format: req.body.year_format,
      sequence_length: req.body.sequence_length,
    };
    const updated = await referenceFormatRepository.update(req.params.id, data);
    if (!updated) return res.status(404).json({ message: 'Reference format not found' });
    res.json(updated);
  } catch (e) { next(e); }
}

async function updateLanguage(req, res, next) {
  try {
    const { query } = require('../config/database');
    const fields = [];
    const params = [];
    const allowed = ['code', 'name', 'is_default', 'is_active'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        params.push(req.body[key]);
        fields.push(`${key} = $${params.length}`);
      }
    }
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    params.push(req.params.id);
    const result = await query(
      `UPDATE languages SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Language not found' });
    res.json(result.rows[0]);
  } catch (e) { next(e); }
}

module.exports = {
  getStats, getHealth, getActivity, getOptions,
  getUsers, getUser, createUser, updateUser,
  activateUser, deactivateUser, deleteUser,
  getSettings, updateSettings,
  getBiometricSettings, updateBiometricSettings,
  updateMinistry, updateDocumentType, updateStatusType,
  updateReferenceFormat, updateLanguage,
};