class PoliceCase {
  constructor(row) {
    this.id = row.id;
    this.caseNumber = row.case_number;
    this.citizenId = row.citizen_id;
    this.caseType = row.case_type;
    this.incidentDate = row.incident_date;
    this.location = row.location;
    this.description = row.description;
    this.status = row.status;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static fromRow(row) { return row ? new PoliceCase(row) : null; }
  static fromRows(rows) { return rows.map((r) => new PoliceCase(r)); }
}

module.exports = PoliceCase;