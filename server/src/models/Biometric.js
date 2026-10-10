class Biometric {
  constructor(row) {
    this.id = row.id;
    this.citizenId = row.citizen_id;
    this.fingerprintLeftThumb = row.fingerprint_left_thumb;
    this.fingerprintLeftIndex = row.fingerprint_left_index;
    this.fingerprintRightThumb = row.fingerprint_right_thumb;
    this.fingerprintRightIndex = row.fingerprint_right_index;
    this.facialImage = row.facial_image;
    this.enrolledBy = row.enrolled_by;
    this.enrolledAt = row.enrolled_at;
    this.updatedAt = row.updated_at;
  }

  static fromRow(row) { return row ? new Biometric(row) : null; }
}

module.exports = Biometric;