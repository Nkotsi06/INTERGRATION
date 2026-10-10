// Data shape for a User record.
// Note: database column names are snake_case; this model uses camelCase for JS.

class User {
  constructor(row) {
    this.id = row.id;
    this.username = row.username;
    this.email = row.email;
    this.fullName = row.full_name;
    this.role = row.role;
    this.ministry = row.ministry;
    this.citizenId = row.citizen_id;
    this.status = row.status;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static fromRow(row) {
    return row ? new User(row) : null;
  }

  static fromRows(rows) {
    return rows.map((r) => new User(r));
  }
}

module.exports = User;