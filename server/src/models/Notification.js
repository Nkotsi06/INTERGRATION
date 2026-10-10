class Notification {
  constructor(row) {
    this.id = row.id;
    this.userId = row.user_id;
    this.title = row.title;
    this.message = row.message;
    this.isRead = row.is_read;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new Notification(row) : null; }
  static fromRows(rows) { return rows.map((r) => new Notification(r)); }
}

module.exports = Notification;