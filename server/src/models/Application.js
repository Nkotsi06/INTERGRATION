class Application {
  constructor(row) {
    this.id = row.id;
    this.referenceNumber = row.reference_number;
    this.citizenId = row.citizen_id;
    this.service = row.service;
    this.status = row.status;
    this.data = row.data;
    this.submittedAt = row.submitted_at;
    this.updatedAt = row.updated_at;
  }

  static fromRow(row) { return row ? new Application(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Application(r)); }
}

module.exports = Application;