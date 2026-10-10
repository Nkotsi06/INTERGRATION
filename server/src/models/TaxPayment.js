class TaxPayment {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.taxRecordId = row.tax_record_id;
    this.referenceNumber = row.reference_number;
    this.amount = row.amount;
    this.paymentMethod = row.payment_method;
    this.paidAt = row.paid_at;
  }

  static fromRow(row) { return row ? new TaxPayment(row) : null; }
  static fromRows(rows) { return rows.map((r) => new TaxPayment(r)); }
}

module.exports = TaxPayment;