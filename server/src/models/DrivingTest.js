class DrivingTest {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.testType = row.test_type;
    this.testDate = row.test_date;
    this.timeSlot = row.time_slot;
    this.location = row.location;
    this.status = row.status;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new DrivingTest(row) : null; }
  static fromRows(rows) { return rows.map((r) => new DrivingTest(r)); }
}

module.exports = DrivingTest;