class AuditLog {
  constructor(row) {
    this.id = row.id;
    this.userId = row.user_id;
    this.username = row.username;
    this.action = row.action;
    this.recordType = row.record_type;
    this.recordId = row.record_id;
    this.result = row.result;
    this.ipAddress = row.ip_address;
    this.userAgent = row.user_agent;
    this.createdAt = row.created_at;
  }

  static fromRow(row) { return row ? new AuditLog(row) : null; }
  static fromRows(rows) { return rows.map((r) => new AuditLog(r)); }
}

module.exports = AuditLog;