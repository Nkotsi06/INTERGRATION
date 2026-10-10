class HomeAffairsRecord {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.recordType = row.record_type;
    this.recordNumber = row.record_number;
    this.issuedAt = row.issued_at;
    this.data = row.data;
  }

  static fromRow(row) { return row ? new HomeAffairsRecord(row) : null; }
  static fromRows(rows) { return rows.map((r) => new HomeAffairsRecord(r)); }
}

module.exports = HomeAffairsRecord;