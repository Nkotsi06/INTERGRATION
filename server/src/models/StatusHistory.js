class StatusHistory {
  constructor(row) {
    this.id = row.id;
    this.applicationId = row.application_id;
    this.status = row.status;
    this.notes = row.notes;
    this.changedBy = row.changed_by;
    this.changedAt = row.changed_at;
  }

  static fromRow(row) { return row ? new StatusHistory(row) : null; }
  static fromRows(rows) { return rows.map((r) => new StatusHistory(r)); }
}

module.exports = StatusHistory;