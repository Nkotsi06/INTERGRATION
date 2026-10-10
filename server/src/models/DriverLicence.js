class DriverLicence {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.licenceNumber = row.licence_number;
    this.licenceType = row.licence_type;
    this.issueDate = row.issue_date;
    this.expiryDate = row.expiry_date;
    this.isValid = row.is_valid;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new DriverLicence(row) : null; }
  static fromRows(rows) { return rows.map((r) => new DriverLicence(r)); }
}

module.exports = DriverLicence;