class PensionRecord {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.pensionType = row.pension_type;
    this.pensionNumber = row.pension_number;
    this.monthlyAmount = row.monthly_amount;
    this.nextPaymentDate = row.next_payment_date;
    this.paymentStatus = row.payment_status;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new PensionRecord(row) : null; }
}

module.exports = PensionRecord;