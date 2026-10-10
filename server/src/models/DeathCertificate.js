class DeathCertificate {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.certificateNumber = row.certificate_number;
    this.dateOfDeath = row.date_of_death;
    this.placeOfDeath = row.place_of_death;
    this.causeOfDeath = row.cause_of_death;
    this.registeredAt = row.registered_at;
  }

  static fromRow(row) { return row ? new DeathCertificate(row) : null; }
}

module.exports = DeathCertificate;