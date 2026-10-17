const pensionRepository = require('../repositories/pensionRepository');
const pensionVerificationRepository = require('../repositories/pensionVerificationRepository');
const deathCertificateRepository = require('../repositories/deathCertificateRepository');
const employmentHistoryRepository = require('../repositories/employmentHistoryRepository');
const citizenRepository = require('../repositories/citizenRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

// ── Age helper ────────────────────────────────────────────────────
function yearsBetween(dob, now = new Date()) {
  if (!dob) return null;
  const birth = new Date(dob);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

// ── Eligibility ───────────────────────────────────────────────────
// Decides, from the database, whether the citizen qualifies for a
// pension right now. Reads the rules from `pension_rules` and the
// citizen's age from `citizens.date_of_birth`; reads government
// service from `citizen_employment_history`.
//
// Result shape:
//   {
//     eligible: boolean,
//     category: 'OLD_AGE' | 'CIVIL_SERVICE' | null,
//     reason: 'ELIGIBLE' | 'NO_RECORD' | 'TOO_YOUNG' |
//             'NO_GOVERNMENT_SERVICE' | 'INSUFFICIENT_SERVICE' |
//             'DEATH_CERTIFICATE',
//     message: human-readable explanation,
//     currentAge: integer | null,
//     minimumAge: integer,
//     hasGovernmentService: boolean,
//     governmentServiceYears: integer,
//     minimumServiceYears: integer,
//     evaluatedCategories: [ { category, ...detail } ]
//   }
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
  const governmentServiceYears =
    await employmentHistoryRepository.totalGovernmentServiceYears(citizenId);
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
    const young = currentAge != null && currentAge >= rule.minimum_age;
    const serviceMet =
      !rule.requires_government_service ||
      governmentServiceYears >= rule.minimum_service_years;
    return {
      category: rule.pension_type,
      minimumAge: rule.minimum_age,
      minimumServiceYears: rule.minimum_service_years,
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

  // Pick the single best explanation. Prefer "too young" when every
  // category is blocked by age; otherwise explain the service gap.
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

// ── Rules (for staff dashboards) ──────────────────────────────────
async function getRules() {
  return pensionRepository.findRulesForCategory();
}

// ── Citizen-facing reads ─────────────────────────────────────────
async function getPensionInfo(citizenId) {
  return pensionRepository.findByCitizen(citizenId);
}

async function checkDeathCertificate(nationalId) {
  const dc = await deathCertificateRepository.findByNationalId(nationalId);
  return dc ? { found: true, date: dc.date_of_death } : { found: false };
}

// ── Life verification ────────────────────────────────────────────
// Two gates:
//   1. The submitted answer must match the citizen's recorded place
//      of birth (case-insensitive, trimmed). This is the security
//      check the master prompt flagged as missing.
//   2. The citizen must be eligible for at least one pension
//      category. If not, refuse with the specific eligibility reason.
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
  assessEligibility,
  getRules,
  getPensionInfo,
  checkDeathCertificate,
  verifyExistence,
  getVerificationHistory,
  getStaffVerifications,
  processVerification,
};