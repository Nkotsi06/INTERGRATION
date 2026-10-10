const auditService = require('../services/auditService');

async function list(req, res, next) {
  try {
    const filters = {
      user: req.query.user,
      action: req.query.action,
      from: req.query.from,
      to: req.query.to,
      page: parseInt(req.query.page || '1', 10),
      pageSize: Math.min(parseInt(req.query.pageSize || '20', 10), 100),
    };
    res.json(await auditService.list(filters));
  } catch (e) { next(e); }
}

async function exportCsv(req, res, next) {
  try {
    const csv = await auditService.exportCsv({
      user: req.query.user,
      action: req.query.action,
      from: req.query.from,
      to: req.query.to,
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    res.send(csv);
  } catch (e) { next(e); }
}

module.exports = { list, exportCsv };