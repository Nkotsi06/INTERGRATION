class StatusType {
  constructor(row) {
    this.id = row.id;
    this.code = row.code;
    this.name = row.name;
    this.colourHex = row.colour_hex;
    this.appliesTo = row.applies_to;
    this.displayOrder = row.display_order;
    this.isActive = row.is_active;
  }

  static fromRow(row) { return row ? new StatusType(row) : null; }
  static fromRows(rows) { return rows.map((r) => new StatusType(r)); }
}

module.exports = StatusType;