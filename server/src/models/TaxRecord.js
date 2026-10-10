class TaxRecord {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.taxId = row.tax_id;
    this.employmentStatus = row.employment_status;
    this.incomeSource = row.income_source;
    this.taxYear = row.tax_year;
    this.status = row.status;
    this.outstandingBalance = row.outstanding_balance;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static fromRow(row) { return row ? new TaxRecord(row) : null; }
  static fromRows(rows) { return rows.map((r) => new TaxRecord(r)); }
}

module.exports = TaxRecord;