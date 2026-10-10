class Ministry {
  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.code = row.code;
    this.colourHex = row.colour_hex;
    this.iconName = row.icon_name;
    this.displayOrder = row.display_order;
    this.isActive = row.is_active;
  }

  static fromRow(row) { return row ? new Ministry(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Ministry(r)); }
}

module.exports = Ministry;