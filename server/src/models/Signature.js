class Signature {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.documentTypeCode = row.document_type_code;
    this.signatureData = row.signature_data;
    this.signedAt = row.signed_at;
  }

  static fromRow(row) { return row ? new Signature(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Signature(r)); }
}

module.exports = Signature;