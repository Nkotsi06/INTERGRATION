class Setting {
  constructor(row) {
    this.id = row.id;
    this.key = row.key;
    this.value = row.value;
    this.category = row.category;
    this.description = row.description;
    this.isPublic = row.is_public;
  }

  static fromRow(row) { return row ? new Setting(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Setting(r)); }
}

module.exports = Setting;