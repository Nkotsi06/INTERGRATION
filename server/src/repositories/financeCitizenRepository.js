const { query } = require('../config/database');

async function listUnpaidApplications(citizenId, executor = query) {
  const result = await executor(
    `SELECT a.id AS "applicationId",
       a.reference_number AS "applicationReference",
       a.service AS ministry,
       COALESCE(a.data->>'serviceCode', a.sub_type) AS "serviceCode",
       COALESCE(a.data->>'serviceName', s.name) AS "serviceName",
       COALESCE(
         NULLIF(a.data->>'fee', '')::numeric,
         fs.amount,
         s.fee,
         0
       ) AS amount,
       COALESCE(fs.currency, s.currency, 'LSL') AS currency,
       a.status AS "applicationStatus",
       a.submitted_at AS "submittedAt"
     FROM applications a
     LEFT JOIN services s
       ON s.ministry = a.service
       AND s.code = COALESCE(a.data->>'serviceCode', a.sub_type)
     LEFT JOIN fee_schedule fs
       ON fs.ministry = a.service
       AND fs.service_code = COALESCE(a.data->>'serviceCode', a.sub_type)
       AND fs.is_active = TRUE
     WHERE a.citizen_id = $1
       AND a.status NOT IN ('REJECTED', 'CANCELLED')
       AND COALESCE(
         NULLIF(a.data->>'fee', '')::numeric,
         fs.amount,
         s.fee,
         0
       ) > 0
       AND NOT EXISTS (
         SELECT 1 FROM payments p
         WHERE p.application_reference = a.reference_number
           AND p.status = 'COMPLETED'
       )
     ORDER BY a.submitted_at DESC`,
    [citizenId]
  );
  return result.rows;
}

async function listCitizenDebts(nationalId, executor = query) {
  const result = await executor(
    `SELECT id, debt_type AS "debtType", amount, status,
       date_cleared AS "dateCleared", created_at AS "createdAt"
     FROM government_debts
     WHERE national_id = $1
     ORDER BY created_at DESC`,
    [nationalId]
  );
  return result.rows;
}

async function listEmploymentDeclarations(citizenId, executor = query) {
  const result = await executor(
    `SELECT id, employer_name AS "employerName",
       position_title AS "positionTitle", employment_type AS "employmentType",
       start_date AS "startDate", end_date AS "endDate", status,
       proof_file_name AS "proofFileName", created_at AS "createdAt",
       reviewed_at AS "reviewedAt", review_notes AS "reviewNotes"
     FROM citizen_finance_employment
     WHERE citizen_id = $1
     ORDER BY created_at DESC`,
    [citizenId]
  );
  return result.rows;
}

async function createEmploymentDeclaration(citizenId, data, proof) {
  const result = await query(
    `INSERT INTO citizen_finance_employment (
       citizen_id, employer_name, position_title, employment_type,
       start_date, end_date, proof_file_path, proof_file_name, proof_file_type
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, employer_name AS "employerName",
       position_title AS "positionTitle", employment_type AS "employmentType",
       start_date AS "startDate", end_date AS "endDate", status,
       proof_file_name AS "proofFileName", created_at AS "createdAt"`,
    [
      citizenId,
      data.employerName,
      data.positionTitle,
      data.employmentType,
      data.startDate,
      data.endDate || null,
      proof.path,
      proof.originalname,
      proof.mimetype,
    ]
  );
  return result.rows[0];
}

async function findEmploymentProof(id, citizenId) {
  const result = await query(
    `SELECT proof_file_path AS "filePath", proof_file_name AS "fileName",
       proof_file_type AS "fileType"
     FROM citizen_finance_employment
     WHERE id = $1 AND citizen_id = $2`,
    [id, citizenId]
  );
  return result.rows[0];
}

async function getApplicationFee(applicationReference, citizenId, executor = query) {
  const result = await executor(
    `SELECT a.reference_number AS "applicationReference",
       a.service AS ministry,
       COALESCE(a.data->>'serviceCode', a.sub_type) AS service,
       COALESCE(a.data->>'serviceName', s.name) AS "serviceName",
       COALESCE(
         NULLIF(a.data->>'fee', '')::numeric,
         fs.amount,
         s.fee,
         0
       ) AS amount,
       COALESCE(fs.currency, s.currency, 'LSL') AS currency
     FROM applications a
     LEFT JOIN services s
       ON s.ministry = a.service
       AND s.code = COALESCE(a.data->>'serviceCode', a.sub_type)
     LEFT JOIN fee_schedule fs
       ON fs.ministry = a.service
       AND fs.service_code = COALESCE(a.data->>'serviceCode', a.sub_type)
       AND fs.is_active = TRUE
     WHERE a.reference_number = $1 AND a.citizen_id = $2
       AND a.status NOT IN ('REJECTED', 'CANCELLED')
     FOR UPDATE OF a`,
    [applicationReference, citizenId]
  );
  return result.rows[0];
}

async function findCompletedPayment(applicationReference, executor = query) {
  const result = await executor(
    `SELECT id FROM payments
     WHERE application_reference = $1 AND status = 'COMPLETED'
     LIMIT 1`,
    [applicationReference]
  );
  return result.rows[0];
}

module.exports = {
  listUnpaidApplications,
  listCitizenDebts,
  listEmploymentDeclarations,
  createEmploymentDeclaration,
  findEmploymentProof,
  getApplicationFee,
  findCompletedPayment,
};
