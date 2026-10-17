const { query } = require('../config/database');

const TABLE_BY_TYPE = {
  BIRTH: 'birth_certificates',
  DEATH: 'death_certificates_new',
  MARRIAGE: 'marriage_certificates',
  DIVORCE: 'divorce_certificates',
};

const FIELD_MAP = {
  BIRTH: {
    child_full_name: 'childFullName',
    child_date_of_birth: 'childDateOfBirth',
    child_gender: 'childGender',
    place_of_birth: 'placeOfBirth',
    mother_full_name: 'motherFullName',
    mother_national_id: 'motherNationalId',
    father_full_name: 'fatherFullName',
    father_national_id: 'fatherNationalId',
    request_type: 'requestType',
  },
  DEATH: {
    deceased_full_name: 'deceasedFullName',
    deceased_national_id: 'deceasedNationalId',
    date_of_death: 'dateOfDeath',
    place_of_death: 'placeOfDeath',
    cause_of_death: 'causeOfDeath',
    informant_full_name: 'informantFullName',
    informant_relationship: 'informantRelationship',
  },
  MARRIAGE: {
    spouse1_full_name: 'spouse1FullName',
    spouse1_national_id: 'spouse1NationalId',
    spouse2_full_name: 'spouse2FullName',
    spouse2_national_id: 'spouse2NationalId',
    marriage_date: 'marriageDate',
    marriage_place: 'marriagePlace',
    marriage_officiant: 'marriageOfficiant',
    request_type: 'requestType',
  },
  DIVORCE: {
    spouse1_full_name: 'spouse1FullName',
    spouse1_national_id: 'spouse1NationalId',
    spouse2_full_name: 'spouse2FullName',
    spouse2_national_id: 'spouse2NationalId',
    divorce_date: 'divorceDate',
    court_name: 'courtName',
    case_number: 'caseNumber',
  },
};

function shapeRow(type, data) {
  const mapping = FIELD_MAP[type];
  const out = {};
  Object.entries(mapping).forEach(([column, key]) => {
    out[column] = data[key] === undefined ? null : data[key];
  });
  return out;
}

async function create(type, { applicationId, citizenId, certificateNumber, formData, issuedBy }) {
  const table = TABLE_BY_TYPE[type];
  if (!table) throw new Error(`Unknown certificate type: ${type}`);

  const mapped = shapeRow(type, formData || {});
  const columns = ['application_id', 'citizen_id', 'certificate_number', 'issued_by'];
  const values = [applicationId, citizenId, certificateNumber, issuedBy || null];

  Object.entries(mapped).forEach(([col, val]) => {
    columns.push(col);
    values.push(val);
  });

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const result = await query(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return result.rows[0];
}

async function updateFields(type, id, data) {
  const table = TABLE_BY_TYPE[type];
  if (!table) throw new Error(`Unknown certificate type: ${type}`);

  const mapping = FIELD_MAP[type];
  const fields = [];
  const params = [];

  Object.entries(mapping).forEach(([column, key]) => {
    if (data[key] !== undefined) {
      params.push(data[key]);
      fields.push(`${column} = $${params.length}`);
    }
  });

  if (fields.length === 0) {
    const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.rows[0];
  }

  params.push(id);
  const result = await query(
    `UPDATE ${table} SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function findByApplication(type, applicationId) {
  const table = TABLE_BY_TYPE[type];
  const result = await query(
    `SELECT * FROM ${table} WHERE application_id = $1`,
    [applicationId]
  );
  return result.rows[0];
}

async function findById(type, id) {
  const table = TABLE_BY_TYPE[type];
  const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0];
}

async function findByCitizen(type, citizenId) {
  const table = TABLE_BY_TYPE[type];
  const result = await query(
    `SELECT * FROM ${table} WHERE citizen_id = $1 ORDER BY created_at DESC`,
    [citizenId]
  );
  return result.rows;
}

// Returns every row that matches the filters. No silent LIMIT.
// The Home Affairs Certificates page paginates in the browser
// (25 rows per page in HACertificates.jsx), so the server returns
// the full filtered set.
async function findAll(type, filters = {}) {
  const table = TABLE_BY_TYPE[type];
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}::date`);
  }
  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= ($${params.length}::date + INTERVAL '1 day')`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `SELECT * FROM ${table} ${where} ORDER BY created_at DESC`,
    params
  );
  return result.rows;
}

async function markIssued(type, id, issuedBy) {
  const table = TABLE_BY_TYPE[type];
  const result = await query(
    `UPDATE ${table}
     SET status = 'ISSUED', issued_by = $2, issued_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, issuedBy]
  );
  return result.rows[0];
}

async function markRejected(type, id, reason, issuedBy) {
  const table = TABLE_BY_TYPE[type];
  const result = await query(
    `UPDATE ${table}
     SET status = 'REJECTED', rejection_reason = $2, issued_by = $3, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, reason, issuedBy]
  );
  return result.rows[0];
}

module.exports = {
  create,
  updateFields,
  findByApplication,
  findById,
  findByCitizen,
  findAll,
  markIssued,
  markRejected,
  TABLE_BY_TYPE,
};