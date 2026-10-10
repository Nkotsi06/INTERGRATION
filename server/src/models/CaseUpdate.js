class CaseUpdate {
  constructor(row) {
    this.id = row.id;
    this.caseId = row.case_id;
    this.status = row.status;
    this.notes = row.notes;
    this.updatedBy = row.updated_by;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new CaseUpdate(row) : null; }
  static fromRows(rows) { return rows.map((r) => new CaseUpdate(r)); }
}

module.exports = CaseUpdate;