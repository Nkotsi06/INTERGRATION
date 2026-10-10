class PensionVerification {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.status = row.status;
    this.method = row.method;
    this.notes = row.notes;
    this.verifiedAt = row.verified_at;
  }

  static fromRow(row) { return row ? new PensionVerification(row) : null; }
  static fromRows(rows) { return rows.map((r) => new PensionVerification(r)); }
}

module.exports = PensionVerification;