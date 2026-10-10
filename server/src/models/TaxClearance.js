class TaxClearance {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.certificateId = row.certificate_id;
    this.tin = row.tin;
    this.legalName = row.legal_name;
    this.tradingName = row.trading_name;
    this.natureOfBusiness = row.nature_of_business;
    this.address = row.address;
    this.dateIssued = row.date_issued;
    this.validUntil = row.valid_until;
    this.verificationUrl = row.verification_url;
  }

  static fromRow(row) { return row ? new TaxClearance(row) : null; }
}

module.exports = TaxClearance;