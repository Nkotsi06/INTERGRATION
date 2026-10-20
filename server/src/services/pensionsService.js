const pensionRepository = require('../repositories/pensionRepository');
const pensionVerificationRepository = require('../repositories/pensionVerificationRepository');
const deathCertificateRepository = require('../repositories/deathCertificateRepository');
const employmentHistoryRepository = require('../repositories/employmentHistoryRepository');
const citizenRepository = require('../repositories/citizenRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const { query } = require('../config/database');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

// ─── Dashboard stats ──────────────────────────────────────────────
async function getStaffStats() {
  const [activePensioners, verificationsDue, paymentsProcessed] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS c
       FROM pension_records
       WHERE payment_status = 'ACTIVE'`
    ),
    // "Due" = no verification in the last 180 days.
    query(
      `SELECT COUNT(*)::int AS c
       FROM pension_records pr
       WHERE pr.payment_status = 'ACTIVE'
         AND NOT EXISTS (
           SELECT 1 FROM pension_verifications pv
           WHERE pv.citizen_id = pr.citizen_id
             AND pv.verified_at > (NOW() - INTERVAL '180 days')
         )`
    ),
    // "Processed" = verification rows on record, a direct count.
    query(
      `SELECT COUNT(*)::int AS c
       FROM pension_verifications`
    ),
  ]);

  return {
    activePensioners: activePensioners.rows[0].c,
    verificationsDue: verificationsDue.rows[0].c,
    paymentsProcessed: paymentsProcessed.rows[0].c,
  };
}

function yearsBetween(dob, now = new Date()) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

async function assessEligibility(citizenId) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) {
    return baseResult({
      reason: 'NO_RECORD',
      message: 'Citizen record not found.',
    });
  }

  const dc = await deathCertificateRepository.findByCitizen(citizenId);
  if (dc) {
    return baseResult({
      reason: 'DEATH_CERTIFICATE',
      message: 'A death certificate is on record. Pensions cannot be assessed.',
    });
  }

  const currentAge = yearsBetween(citizen.date_of_birth);
  const governmentServiceYears = Number(
    await employmentHistoryRepository.totalGovernmentServiceYears(citizenId)
  ) || 0;
  const hasGovernmentService = governmentServiceYears > 0;

  const rules = await pensionRepository.findRulesForCategory();
  if (!rules || rules.length === 0) {
    return baseResult({
      reason: 'NO_RULES',
      message: 'Pension rules are not configured. Contact Pensions staff.',
      currentAge,
    });
  }

  const evaluatedCategories = rules.map((rule) => {
    const minimumAge = Number(rule.minimum_age) || 0;
    const minimumServiceYears = Number(rule.minimum_service_years) || 0;
    const young = currentAge != null && currentAge >= minimumAge;
    const serviceMet =
      !rule.requires_government_service ||
      governmentServiceYears >= minimumServiceYears;
    return {
      category: rule.pension_type,
      minimumAge,
      minimumServiceYears,
      requiresGovernmentService: rule.requires_government_service,
      monthlyAmount: Number(rule.monthly_amount),
      currency: rule.currency,
      ageMet: young,
      serviceMet,
      eligible: young && serviceMet,
    };
  });

  const winner = evaluatedCategories.find((c) => c.eligible);
  if (winner) {
    return {
      eligible: true,
      category: winner.category,
      reason: 'ELIGIBLE',
      message: `You qualify for the ${humanCategory(winner.category)}.`,
      currentAge,
      minimumAge: winner.minimumAge,
      hasGovernmentService,
      governmentServiceYears,
      minimumServiceYears: winner.minimumServiceYears,
      evaluatedCategories,
    };
  }

  const oldestMinAge = Math.max(...evaluatedCategories.map((c) => c.minimumAge));
  const anyAgeMet = evaluatedCategories.some((c) => c.ageMet);

  if (!anyAgeMet) {
    return {
      eligible: false,
      category: null,
      reason: 'TOO_YOUNG',
      message: `You must be at least ${oldestMinAge} years old to qualify. Your current age is ${
        currentAge != null ? currentAge : 'unknown'
      }.`,
      currentAge,
      minimumAge: oldestMinAge,
      hasGovernmentService,
      governmentServiceYears,
      minimumServiceYears: 0,
      evaluatedCategories,
    };
  }

  const requiringService = evaluatedCategories.find(
    (c) => c.requiresGovernmentService
  );
  if (requiringService && !hasGovernmentService) {
    return {
      eligible: false,
      category: null,
      reason: 'NO_GOVERNMENT_SERVICE',
      message:
        'The remaining pension category requires prior government service. No government employment is on your record.',
      currentAge,
      minimumAge: requiringService.minimumAge,
      hasGovernmentService,
      governmentServiceYears,
      minimumServiceYears: requiringService.minimumServiceYears,
      evaluatedCategories,
    };
  }

  return {
    eligible: false,
    category: null,
    reason: 'INSUFFICIENT_SERVICE',
    message: `The remaining pension category requires at least ${requiringService?.minimumServiceYears || 0} years of government service. Your record shows ${governmentServiceYears}.`,
    currentAge,
    minimumAge: requiringService?.minimumAge || oldestMinAge,
    hasGovernmentService,
    governmentServiceYears,
    minimumServiceYears: requiringService?.minimumServiceYears || 0,
    evaluatedCategories,
  };
}

function baseResult({ reason, message, currentAge = null }) {
  return {
    eligible: false,
    category: null,
    reason,
    message,
    currentAge,
    minimumAge: 0,
    hasGovernmentService: false,
    governmentServiceYears: 0,
    minimumServiceYears: 0,
    evaluatedCategories: [],
  };
}

function humanCategory(code) {
  if (code === 'OLD_AGE') return 'Old Age Pension';
  if (code === 'CIVIL_SERVICE') return 'Civil Service Pension';
  return 'pension';
}

async function getRules() {
  return pensionRepository.findRulesForCategory();
}

async function getPensionInfo(citizenId) {
  return pensionRepository.findByCitizen(citizenId);
}

async function checkDeathCertificate(nationalId) {
  const dc = await deathCertificateRepository.findByNationalId(nationalId);
  return dc ? { found: true, date: dc.date_of_death } : { found: false };
}

async function verifyExistence(citizenId, answer, user) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) {
    const e = new Error('Citizen record not found.');
    e.statusCode = 404;
    throw e;
  }

  const dc = await deathCertificateRepository.findByCitizen(citizenId);
  if (dc) {
    const e = new Error('A death certificate is on record. Verification is blocked.');
    e.statusCode = 400;
    throw e;
  }

  const submitted = String(answer || '').trim().toLowerCase();
  const expected = String(citizen.place_of_birth || '').trim().toLowerCase();
  if (!submitted || !expected || submitted !== expected) {
    const e = new Error(
      'Your answer does not match our records. Check your place of birth and try again.'
    );
    e.statusCode = 400;
    throw e;
  }

  const eligibility = await assessEligibility(citizenId);
  if (!eligibility.eligible) {
    const e = new Error(eligibility.message);
    e.statusCode = 400;
    throw e;
  }

  const verification = await pensionVerificationRepository.create({
    citizenId,
    status: 'VERIFIED',
    method: 'SECURITY_QUESTION',
  });

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'PENSION_EXISTENCE_VERIFIED',
    recordType: 'PENSION_VERIFICATION',
    recordId: verification.id,
    result: 'SUCCESS',
  });

  await notifyCitizen(
    citizenId,
    'Existence verification successful',
    'Your pension existence check has been recorded.'
  );

  return { verification, eligibility };
}

async function getVerificationHistory(citizenId) {
  return pensionVerificationRepository.findByCitizen(citizenId);
}

async function getStaffVerifications(filters) {
  return pensionVerificationRepository.findAll(filters);
}

async function processVerification(id, action, staffUser) {
  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `PENSION_VERIFICATION_${action}`,
    recordType: 'PENSION_VERIFICATION',
    recordId: id,
    result: 'SUCCESS',
  });
}

module.exports = {
  getStaffStats,
  assessEligibility,
  getRules,
  getPensionInfo,
  checkDeathCertificate,
  verifyExistence,
  getVerificationHistory,
  getStaffVerifications,
  processVerification,
};