const serviceRepository = require('../repositories/serviceRepository');
const applicationRepository = require('../repositories/applicationRepository');
const notificationService = require('./notificationService');
const paymentService = require('./paymentService');
const feeScheduleService = require('./feeScheduleService');
const certificateService = require('./certificateService');
const userRepository = require('../repositories/userRepository');
const { generateReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');

function notFound(msg) { const e = new Error(msg); e.statusCode = 404; return e; }
function badRequest(msg) { const e = new Error(msg); e.statusCode = 400; return e; }

async function listPublic(ministry) {
  const services = await serviceRepository.findAll({ ministry, is_enabled: true });
  const enriched = await Promise.all(
    services.map(async (s) => {
      const fee = await feeScheduleService.getFeeForService(s.ministry, s.code);
      return {
        ...s,
        fee: fee ? Number(fee.amount) : Number(s.fee),
        fee_currency: fee ? fee.currency : s.currency,
        fee_active: fee ? fee.is_active : true,
      };
    })
  );
  return enriched;
}

async function listAll(filters) {
  return serviceRepository.findAll(filters);
}

async function getById(id) {
  const service = await serviceRepository.findById(id);
  if (!service) throw notFound('Service not found');
  const fee = await feeScheduleService.getFeeForService(service.ministry, service.code);
  return {
    ...service,
    fee: fee ? Number(fee.amount) : Number(service.fee),
    fee_currency: fee ? fee.currency : service.currency,
    fee_active: fee ? fee.is_active : true,
  };
}

async function updateService(id, data, adminUser) {
  const updated = await serviceRepository.update(id, data);
  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'SERVICE_UPDATED',
    recordType: 'SERVICE',
    recordId: id,
    result: 'SUCCESS',
  });
  return updated;
}

async function submitApplication({ serviceId, citizenId, formData, user }) {
  const service = await serviceRepository.findById(serviceId);
  if (!service) throw notFound('Service not found');
  if (!service.is_enabled) throw badRequest('This service is currently unavailable.');

  const fields = Array.isArray(service.form_fields) ? service.form_fields : [];
  const missing = fields
    .filter((f) => f.required && !formData?.[f.key])
    .map((f) => f.label || f.key);
  if (missing.length > 0) throw badRequest(`Please complete: ${missing.join(', ')}`);

  const fee = await feeScheduleService.getFeeForService(service.ministry, service.code);
  const feeAmount = fee ? Number(fee.amount) : Number(service.fee);
  const referenceNumber = await generateReference('APPLICATION');

  if (feeAmount > 0) {
    await paymentService.recordPayment({
      citizenId,
      ministry: service.ministry,
      service: service.code,
      applicationReference: referenceNumber,
      amount: feeAmount,
      method: formData?.method || 'MOBILE_MONEY',
      mobile: formData?.mobile,
      receivedBy: user.userId,
    });
  }

  const application = await applicationRepository.create({
    referenceNumber,
    citizenId,
    service: service.ministry,
    data: {
      serviceCode: service.code,
      serviceName: service.name,
      formData: formData || {},
      fee: feeAmount,
    },
  });

  // Certificate services: create the backing certificate row.
  try {
    await certificateService.recordCertificateApplication({
      application,
      formData: formData || {},
      citizenId,
    });
  } catch (err) {
    // Certificate hook is best-effort. The application still exists.
    // eslint-disable-next-line no-console
    console.error('Certificate hook failed:', err.message);
  }

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'SERVICE_APPLICATION_SUBMITTED',
    recordType: 'APPLICATION',
    recordId: application.id,
    result: 'SUCCESS',
  });

  const owner = await userRepository.findByCitizenId(citizenId);
  if (owner) {
    const feeText = feeAmount > 0 ? ` Payment received for ${feeAmount}.` : '';
    await notificationService.notify(
      owner.id,
      `${service.name} received`,
      `Your application ${referenceNumber} has been received.${feeText}`
    );
  }

  return { referenceNumber, application, fee: feeAmount };
}

async function listApplicationsForService({ serviceCode, ministry, filters }) {
  const rows = await applicationRepository.findByService(ministry, filters || {});
  return rows.filter((r) => !serviceCode || r.data?.serviceCode === serviceCode);
}

module.exports = {
  listPublic,
  listAll,
  getById,
  updateService,
  submitApplication,
  listApplicationsForService,
};