class PassportApplication {
  constructor(row) {
    this.id = row.id;
    this.applicationId = row.application_id;
    this.citizenId = row.citizen_id;
    this.passportType = row.passport_type;
    this.reason = row.reason;
    this.status = row.status;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new PassportApplication(row) : null; }
}

module.exports = PassportApplication;