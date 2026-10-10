class Vehicle {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.registrationNumber = row.registration_number;
    this.make = row.make;
    this.model = row.model;
    this.year = row.year;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new Vehicle(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Vehicle(r)); }
}

module.exports = Vehicle;