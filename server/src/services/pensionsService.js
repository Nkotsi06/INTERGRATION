const pensionRepository = require('../repositories/pensionRepository');
const pensionVerificationRepository = require('../repositories/pensionVerificationRepository');
const deathCertificateRepository = require('../repositories/deathCertificateRepository');
const citizenRepository = require('../repositories/citizenRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const { query, getClient } = require('../config/database');
const { generateReference } = require('../utils/referenceGenerator');

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

function completedServiceYears(startDate, endDate) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

async function assessEligibility(citizenId, executor = query, options = {}) {
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

  const [facts, pensionRecord, rules] = await Promise.all([
    pensionRepository.getEligibilityFacts(
      citizenId,
      executor,
      options.ignorePendingApplicationId || null
    ),
    pensionRepository.findByCitizen(citizenId, executor),
    pensionRepository.findRulesForCategory(executor),
  ]);
  if (!facts) {
    return baseResult({
      reason: 'NO_RECORD',
      message: 'Citizen record not found.',
    });
  }

  const currentAge = yearsBetween(citizen.date_of_birth);
  const governmentEmployee = Boolean(facts.government_employee_id);
  const isCurrentGovernmentEmployee =
    governmentEmployee && facts.employment_status === 'ACTIVE';
  const governmentServiceYears = governmentEmployee
    ? completedServiceYears(facts.employment_start_date, facts.employment_end_date)
    : 0;
  const hasGovernmentService = governmentServiceYears > 0;
  const hasOutstandingDebt = Number(facts.outstanding_debt_count) > 0;
  const hasExistingPension = Boolean(pensionRecord);
  const hasPendingApplication = Boolean(facts.has_pending_application);

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
    const ageMet = currentAge != null && currentAge >= minimumAge;
    const serviceMet =
      !rule.requires_government_service ||
      governmentServiceYears >= minimumServiceYears;
    const employeeTypeMet = !(
      rule.pension_type === 'OLD_AGE' && isCurrentGovernmentEmployee
    );
    const blockers = [];
    if (!employeeTypeMet) blockers.push('GOVERNMENT_EMPLOYEE');
    if (hasOutstandingDebt) blockers.push('OUTSTANDING_GOVERNMENT_DEBT');
    if (hasExistingPension) blockers.push('EXISTING_PENSION');
    if (hasPendingApplication) blockers.push('PENDING_APPLICATION');
    return {
      category: rule.pension_type,
      minimumAge,
      minimumServiceYears,
      requiresGovernmentService: rule.requires_government_service,
      monthlyAmount: Number(rule.monthly_amount),
      currency: rule.currency,
      ageMet,
      serviceMet,
      employeeTypeMet,
      blockers,
      eligible:
        ageMet &&
        serviceMet &&
        employeeTypeMet &&
        !hasOutstandingDebt &&
        !hasExistingPension &&
        !hasPendingApplication,
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
      governmentEmployee,
      isCurrentGovernmentEmployee,
      employmentStatus: facts.employment_status || null,
      employeeNumber: facts.employee_number || null,
      hasOutstandingDebt,
      outstandingDebtAmount: Number(facts.outstanding_debt_amount),
      hasExistingPension,
      existingPensionStatus: facts.pension_status || null,
      hasPendingApplication,
      evaluatedCategories,
    };
  }

  let blockedReason;
  let blockedMessage;
  if (hasOutstandingDebt) {
    blockedReason = 'OUTSTANDING_GOVERNMENT_DEBT';
    blockedMessage = 'Outstanding government debt must be resolved before a pension application can proceed.';
  } else if (hasExistingPension) {
    blockedReason = 'EXISTING_PENSION';
    blockedMessage = 'A pension entitlement is already recorded. The one-pension rule prevents another application.';
  } else if (hasPendingApplication) {
    blockedReason = 'PENDING_APPLICATION';
    blockedMessage = 'A pension application is already being processed.';
  } else if (
    isCurrentGovernmentEmployee &&
    evaluatedCategories.some((category) => category.category === 'OLD_AGE')
  ) {
    blockedReason = 'GOVERNMENT_EMPLOYEE';
    blockedMessage = 'Government employees cannot receive the Old Age Pension. Check the Civil Service Pension criteria.';
  }

  if (blockedReason) {
    return {
      eligible: false,
      category: null,
      reason: blockedReason,
      message: blockedMessage,
      currentAge,
      minimumAge: 0,
      hasGovernmentService,
      governmentServiceYears,
      minimumServiceYears: 0,
      governmentEmployee,
      isCurrentGovernmentEmployee,
      employmentStatus: facts.employment_status || null,
      employeeNumber: facts.employee_number || null,
      hasOutstandingDebt,
      outstandingDebtAmount: Number(facts.outstanding_debt_amount),
      hasExistingPension,
      existingPensionStatus: facts.pension_status || null,
      hasPendingApplication,
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
      governmentEmployee,
      isCurrentGovernmentEmployee,
      employmentStatus: facts.employment_status || null,
      employeeNumber: facts.employee_number || null,
      hasOutstandingDebt,
      outstandingDebtAmount: Number(facts.outstanding_debt_amount),
      hasExistingPension,
      existingPensionStatus: facts.pension_status || null,
      hasPendingApplication,
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
      governmentEmployee,
      isCurrentGovernmentEmployee,
      employmentStatus: facts.employment_status || null,
      employeeNumber: facts.employee_number || null,
      hasOutstandingDebt,
      outstandingDebtAmount: Number(facts.outstanding_debt_amount),
      hasExistingPension,
      existingPensionStatus: facts.pension_status || null,
      hasPendingApplication,
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
    governmentEmployee,
    isCurrentGovernmentEmployee,
    employmentStatus: facts.employment_status || null,
    employeeNumber: facts.employee_number || null,
    hasOutstandingDebt,
    outstandingDebtAmount: Number(facts.outstanding_debt_amount),
    hasExistingPension,
    existingPensionStatus: facts.pension_status || null,
    hasPendingApplication,
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

async function submitPensionApplication({ citizenId, formData, user }) {
  const referenceNumber = await generateReference('APPLICATION');
  const client = await getClient();
  let application;
  let eligibility;

  try {
    await client.query('BEGIN');
    const executor = client.query.bind(client);
    const lockedCitizen = await executor(
      'SELECT id FROM citizens WHERE id = $1 FOR UPDATE',
      [citizenId]
    );
    if (!lockedCitizen.rows[0]) {
      const error = new Error('Citizen record not found.');
      error.statusCode = 404;
      throw error;
    }

    eligibility = await assessEligibility(citizenId, executor);
    if (!eligibility.eligible) {
      const error = new Error(eligibility.message);
      error.statusCode = 400;
      throw error;
    }

    const requestedType = String(formData.pensionType || '').trim().toUpperCase();
    if (requestedType !== eligibility.category) {
      const error = new Error('Choose the pension type returned by your current eligibility assessment.');
      error.statusCode = 400;
      throw error;
    }

    const result = await executor(
      `INSERT INTO applications
        (reference_number, citizen_id, service, status, data, submitted_at)
       VALUES ($1, $2, 'PENSIONS', 'SUBMITTED', $3::jsonb, NOW())
       RETURNING *`,
      [
        referenceNumber,
        citizenId,
        JSON.stringify({
          serviceCode: 'PENSION_APPLICATION',
          serviceName: 'Pension application',
          formData,
        }),
      ]
    );
    application = result.rows[0];
    await executor(
      `INSERT INTO application_status_history (application_id, status, changed_by, notes)
       VALUES ($1, 'SUBMITTED', $2, 'Pension application submitted')`,
      [application.id, user.userId]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'PENSION_APPLICATION_SUBMITTED',
    recordType: 'APPLICATION',
    recordId: application.id,
    result: 'SUCCESS',
  });
  await notifyCitizen(
    citizenId,
    'Pension application received',
    `Your ${humanCategory(eligibility.category)} application ${referenceNumber} has been received.`
  );
  return { referenceNumber, application, eligibility };
}

async function getPensionApplications(filters) {
  return pensionRepository.findApplications(filters || {});
}

async function processPensionApplication(id, input, staffUser) {
  const action = String(input.action || '').trim().toUpperCase();
  if (!['APPROVE', 'REJECT'].includes(action)) {
    const error = new Error('Choose approve or reject.');
    error.statusCode = 400;
    throw error;
  }
  const reason = String(input.reason || '').trim();
  if (action === 'REJECT' && !reason) {
    const error = new Error('A reason is required when rejecting an application.');
    error.statusCode = 400;
    throw error;
  }
  const client = await getClient();
  let application;
  let approvedPension;
  let nextStatus;
  try {
    await client.query('BEGIN');
    const executor = client.query.bind(client);
    const applicationResult = await executor(
      `SELECT * FROM applications
       WHERE id = $1 AND service = 'PENSIONS'
         AND data->>'serviceCode' = 'PENSION_APPLICATION'
       FOR UPDATE`,
      [id]
    );
    application = applicationResult.rows[0];
    if (!application) {
      const error = new Error('Pension application not found.');
      error.statusCode = 404;
      throw error;
    }
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(application.status)) {
      const error = new Error('This pension application has already been processed.');
      error.statusCode = 409;
      throw error;
    }

    nextStatus = action === 'REJECT' ? 'REJECTED' : 'APPROVED';
    if (action === 'APPROVE') {
      await executor('SELECT id FROM citizens WHERE id = $1 FOR UPDATE', [
        application.citizen_id,
      ]);
      const eligibility = await assessEligibility(application.citizen_id, executor, {
        ignorePendingApplicationId: application.id,
      });
      const requestedType = String(
        application.data?.formData?.pensionType || ''
      ).trim().toUpperCase();
      if (!eligibility.eligible || eligibility.category !== requestedType) {
        const error = new Error(
          eligibility.eligible
            ? 'The eligible pension type no longer matches this application.'
            : eligibility.message
        );
        error.statusCode = 409;
        throw error;
      }

      const rule = (await pensionRepository.findRulesForCategory(executor))
        .find((item) => item.pension_type === requestedType);
      const monthlyAmount = Number(rule?.monthly_amount);
      if (!rule || !Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
        const error = new Error(
          'The monthly amount for this pension type is not configured. Pensions staff must resolve the policy configuration before approval.'
        );
        error.statusCode = 409;
        throw error;
      }

      const generatedNumber = await executor(
        `SELECT 'LS-PEN-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' ||
           CASE WHEN serial < 1000000 THEN LPAD(serial::text, 6, '0')
                ELSE serial::text END AS pension_number
         FROM (SELECT nextval('pension_number_seq') AS serial) generated`
      );
      const pensionNumber = generatedNumber.rows[0].pension_number;
      approvedPension = await pensionRepository.create({
        citizenId: application.citizen_id,
        pensionType: requestedType,
        pensionNumber,
        monthlyAmount,
        nextPaymentDate: null,
      }, executor);
    }

    await executor(
      `UPDATE applications
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
      [nextStatus, application.id]
    );
    await executor(
      `INSERT INTO application_status_history (application_id, status, changed_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [
        application.id,
        nextStatus,
        staffUser.userId,
        action === 'APPROVE'
          ? `Pension application approved. Assigned pension number ${approvedPension.pension_number}.`
          : reason || null,
      ]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      const conflict = new Error(
        'A pension entitlement or pension number already exists. The one-pension rule prevents this approval.'
      );
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  } finally {
    client.release();
  }

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `PENSION_APPLICATION_${nextStatus}`,
    recordType: 'APPLICATION',
    recordId: application.id,
    result: 'SUCCESS',
  });
  await notifyCitizen(
    application.citizen_id,
    `Pension application ${nextStatus.toLowerCase()}`,
    action === 'APPROVE'
      ? `Your pension application ${application.reference_number} was approved. Your pension number is ${approvedPension.pension_number}.`
      : `Your pension application ${application.reference_number} was rejected. Reason: ${reason}`
  );
  return { status: nextStatus, pension: approvedPension || null };
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

  const pension = await pensionRepository.findByCitizen(citizenId);
  if (!pension || !['ACTIVE', 'SUSPENDED'].includes(pension.payment_status)) {
    const e = new Error('An active or suspended pension record is required for life verification.');
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

  return { verification, pension };
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
  submitPensionApplication,
  getPensionApplications,
  processPensionApplication,
  checkDeathCertificate,
  verifyExistence,
  getVerificationHistory,
  getStaffVerifications,
  processVerification,
};