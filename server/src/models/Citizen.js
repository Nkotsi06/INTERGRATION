class Citizen {
  constructor(row) {
    this.id = row.id;
    this.nationalId = row.national_id;
    this.firstName = row.first_name;
    this.lastName = row.last_name;
    this.fullName = `${row.first_name} ${row.last_name}`;
    this.dateOfBirth = row.date_of_birth;
    this.gender = row.gender;
    this.placeOfBirth = row.place_of_birth;
    this.address = row.address;
    this.phone = row.phone;
    this.email = row.email;
    this.fatherName = row.father_name;
    this.motherName = row.mother_name;
    this.isVerified = row.is_verified;
    this.verifiedAt = row.verified_at;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static fromRow(row) { return row ? new Citizen(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Citizen(r)); }
}

module.exports = Citizen;