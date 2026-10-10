class Language {
  constructor(row) {
    this.id = row.id;
    this.code = row.code;
    this.name = row.name;
    this.isDefault = row.is_default;
    this.isActive = row.is_active;
  }

  static fromRow(row) { return row ? new Language(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Language(r)); }
}

module.exports = Language;