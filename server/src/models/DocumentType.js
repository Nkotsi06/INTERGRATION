class DocumentType {
  constructor(row) {
    this.id = row.id;
    this.code = row.code;
    this.name = row.name;
    this.acceptedFormats = row.accepted_formats;
    this.maxSizeMb = row.max_size_mb;
    this.isRequired = row.is_required;
    this.displayOrder = row.display_order;
    this.isActive = row.is_active;
  }

  static fromRow(row) { return row ? new DocumentType(row) : null; }
  static fromRows(rows) { return rows.map((r) => new DocumentType(r)); }
}

module.exports = DocumentType;