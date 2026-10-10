class Appointment {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.service = row.service;
    this.appointmentDate = row.appointment_date;
    this.appointmentTime = row.appointment_time;
    this.location = row.location;
    this.status = row.status;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new Appointment(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Appointment(r)); }
}

module.exports = Appointment;