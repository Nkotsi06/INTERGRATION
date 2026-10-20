const { query, getClient } = require('../config/database');

function lifecycleError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function withTransaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function create(app) {
  const result = await query(
    `INSERT INTO passport_applications
       (application_id, citizen_id, passport_type, reason, status,
        passport_number, collection_office, is_renewal, previous_passport_number)
     VALUES ($1, $2, $3, $4, 'SUBMITTED', $5, $6, $7, $8) RETURNING *`,
    [
      app.applicationId,
      app.citizenId,
      app.passportType,
      app.reason,
      app.passportNumber,
      app.collectionOffice,
      app.isRenewal,
      app.previousPassportNumber || null,
    ]
  );
  return result.rows[0];
}

async function findByApplicationId(applicationId) {
  const result = await query(
    'SELECT * FROM passport_applications WHERE application_id = $1',
    [applicationId]
  );
  return result.rows[0];
}

async function updateStatus(applicationId, status) {
  const result = await query(
    `UPDATE passport_applications
     SET status = $2
     WHERE application_id = $1
     RETURNING *`,
    [applicationId, status]
  );
  return result.rows[0];
}

async function updateApplicationStatus(applicationId, status, changedBy, notes) {
  return withTransaction(async (client) => {
    const existing = await client.query(
      `SELECT a.status, a.service
       FROM applications a
       JOIN passport_applications pa ON pa.application_id = a.id
       WHERE a.id = $1
       FOR UPDATE OF a, pa`,
      [applicationId]
    );
    if (!existing.rows[0] || existing.rows[0].service !== 'PASSPORT') {
      throw lifecycleError('Passport application not found.', 404);
    }
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(existing.rows[0].status)) {
      throw lifecycleError(
        `Passport application cannot be processed from ${existing.rows[0].status}.`,
        409
      );
    }

    await client.query(
      `UPDATE applications
       SET status = $2, updated_at = NOW()
       WHERE id = $1`,
      [applicationId, status]
    );
    await client.query(
      `UPDATE passport_applications SET status = $2
       WHERE application_id = $1`,
      [applicationId, status]
    );
    await client.query(
      `INSERT INTO application_status_history
         (application_id, status, changed_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [applicationId, status, changedBy, notes || null]
    );

    return existing.rows[0];
  });
}

async function markReadyForCollection(applicationId, passportNumber, issuedBy) {
  return withTransaction(async (client) => {
    const result = await client.query(
      `SELECT a.citizen_id,
              a.reference_number,
              a.status AS application_status,
              pa.status AS passport_status,
              pa.passport_number,
              pa.collection_office,
              b.name AS branch_name,
              b.address AS branch_address,
              b.district AS branch_district
       FROM applications a
       JOIN passport_applications pa ON pa.application_id = a.id
       LEFT JOIN branches b ON b.id::text = pa.collection_office
       WHERE a.id = $1 AND a.service = 'PASSPORT'
       FOR UPDATE OF a, pa`,
      [applicationId]
    );
    const application = result.rows[0];
    if (!application) {
      throw lifecycleError('Passport application not found.', 404);
    }
    if (application.application_status === 'READY_FOR_COLLECTION' &&
        application.passport_status === 'READY_FOR_COLLECTION' &&
        application.passport_number) {
      return { ...application, alreadyReady: true };
    }
    if (application.application_status !== 'APPROVED' ||
        !['APPROVED', 'SUBMITTED', 'UNDER_REVIEW'].includes(application.passport_status)) {
      throw lifecycleError('Only approved passport applications can be marked ready.', 409);
    }

    await client.query(
      `UPDATE passport_applications
       SET status = 'READY_FOR_COLLECTION',
           passport_number = $2,
           issued_at = NOW(),
           issued_by = $3,
           issue_date = CURRENT_DATE
       WHERE application_id = $1`,
      [applicationId, passportNumber, issuedBy]
    );
    await client.query(
      `UPDATE applications
       SET status = 'READY_FOR_COLLECTION', updated_at = NOW()
       WHERE id = $1`,
      [applicationId]
    );
    await client.query(
      `INSERT INTO application_status_history
         (application_id, status, changed_by, notes)
       VALUES ($1, 'READY_FOR_COLLECTION', $2, $3)`,
      [applicationId, issuedBy, 'Passport marked ready for collection.']
    );

    return application;
  });
}

async function recordCollection(applicationId, collection, staffUserId) {
  return withTransaction(async (client) => {
    const result = await client.query(
      `SELECT a.citizen_id,
              a.reference_number,
              a.status AS application_status,
              pa.status AS passport_status
       FROM applications a
       JOIN passport_applications pa ON pa.application_id = a.id
       WHERE a.id = $1 AND a.service = 'PASSPORT'
       FOR UPDATE OF a, pa`,
      [applicationId]
    );
    const application = result.rows[0];
    if (!application) {
      throw lifecycleError('Passport application not found.', 404);
    }
    if (application.application_status !== 'READY_FOR_COLLECTION' ||
        application.passport_status !== 'READY_FOR_COLLECTION') {
      throw lifecycleError('Only passports ready for collection can be collected.', 409);
    }

    await client.query(
      `UPDATE passport_applications
       SET status = 'COLLECTED',
           collected_at = NOW(),
           collected_by_name = $2,
           id_checked = $3,
           signature_id = $4
       WHERE application_id = $1`,
      [
        applicationId,
        collection.collectedByName,
        collection.idChecked,
        collection.signatureId,
      ]
    );
    await client.query(
      `UPDATE applications
       SET status = 'COLLECTED', updated_at = NOW()
       WHERE id = $1`,
      [applicationId]
    );
    await client.query(
      `INSERT INTO application_status_history
         (application_id, status, changed_by, notes)
       VALUES ($1, 'COLLECTED', $2, $3)`,
      [applicationId, staffUserId, `Passport collected by ${collection.collectedByName}.`]
    );
    return application;
  });
}

async function findForStaff(filters = {}) {
  const params = [];
  let conditions = "a.service = 'PASSPORT'";
  if (filters.status) {
    params.push(filters.status);
    conditions += ` AND a.status = $${params.length}`;
  }
  if (filters.from) {
    params.push(filters.from);
    conditions += ` AND a.submitted_at >= $${params.length}::date`;
  }
  if (filters.to) {
    params.push(filters.to);
    conditions += ` AND a.submitted_at < ($${params.length}::date + INTERVAL '1 day')`;
  }
  const result = await query(
    `SELECT a.id,
            a.reference_number AS "referenceNumber",
            a.status,
            a.submitted_at AS "dateSubmitted",
            a.updated_at AS "dateUpdated",
            a.data,
            COALESCE(c.first_name || ' ' || c.last_name, 'Unknown citizen') AS "citizenName",
            c.national_id AS "nationalId",
            pa.passport_type AS "passportType",
            pa.passport_number AS "passportNumber",
            pa.issued_at AS "issuedAt",
            pa.expiry_date AS "expiryDate",
            pa.is_renewal AS "isRenewal",
            pa.collection_office AS "collectionOffice"
     FROM applications a
     LEFT JOIN citizens c ON c.id = a.citizen_id
     LEFT JOIN passport_applications pa ON pa.application_id = a.id
     WHERE ${conditions}
     ORDER BY a.submitted_at DESC`,
    params
  );
  return result.rows;
}

async function findCurrentByCitizen(citizenId) {
  const result = await query(
    `SELECT pa.passport_number, pa.passport_type,
            COALESCE(b.name, pa.collection_office) AS collection_office,
            pa.created_at, pa.is_renewal, a.status
     FROM passport_applications pa
     JOIN applications a ON a.id = pa.application_id
     LEFT JOIN branches b ON b.id::text = pa.collection_office
     WHERE pa.citizen_id = $1
       AND pa.passport_number IS NOT NULL
       AND (
         (a.status = 'COLLECTED' AND pa.status = 'COLLECTED')
         OR a.status = 'COMPLETED'
       )
     ORDER BY pa.created_at DESC
     LIMIT 1`,
    [citizenId]
  );
  return result.rows[0] || null;
}

module.exports = {
  create,
  findByApplicationId,
  findForStaff,
  updateStatus,
  updateApplicationStatus,
  markReadyForCollection,
  recordCollection,
  findCurrentByCitizen,
};