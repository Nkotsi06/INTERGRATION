class Document {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.documentTypeCode = row.document_type_code;
    this.filePath = row.file_path;
    this.fileName = row.file_name;
    this.fileType = row.file_type;
    this.fileSize = row.file_size;
    this.status = row.status;
    this.rejectionReason = row.rejection_reason;
    this.uploadedBy = row.uploaded_by;
    this.verifiedBy = row.verified_by;
    this.verifiedAt = row.verified_at;
    this.uploadedAt = row.uploaded_at;
  }

  static fromRow(row) { return row ? new Document(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Document(r)); }
}

module.exports = Document;