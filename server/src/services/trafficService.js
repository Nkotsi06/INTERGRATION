const driverLicenceRepository = require('../repositories/driverLicenceRepository');
const drivingTestRepository = require('../repositories/drivingTestRepository');
const applicationRepository = require('../repositories/applicationRepository');
const vehicleRepository = require('../repositories/vehicleRepository');
const vehicleInspectionRepository = require('../repositories/vehicleInspectionRepository');
const vehicleLicenceRepository = require('../repositories/vehicleLicenceRepository');
const transportPermitRepository = require('../repositories/transportPermitRepository');
const licenceApplicationRepository = require('../repositories/licenceApplicationRepository');
const notificationService = require('./notificationService');
const signatureService = require('./signatureService');
const paymentService = require('./paymentService');
const userRepository = require('../repositories/userRepository');
const { generateReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');
const { query } = require('../config/database');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}
function notFound(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

// ─── Dashboard stats ──────────────────────────────────────────────
// All values come from database queries, not from the client.
// - pending: applications in the traffic service queue awaiting a
//   staff decision.
// - todayAppointments: driving test bookings scheduled for today.
// - licencesIssued: total driver licences recorded.
async function getStaffStats() {
  const [pending, todayAppointments, licencesIssued] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS c
       FROM applications
       WHERE service = 'TRAFFIC'
         AND status IN ('SUBMITTED', 'UNDER_REVIEW')`
    ),
    query(
      `SELECT COUNT(*)::int AS c
       FROM driving_tests
       WHERE test_date = CURRENT_DATE
         AND status = 'BOOKED'`
    ),
    query(
      `SELECT COUNT(*)::int AS c
       FROM driver_licences`
    ),
  ]);

  return {
    pending: pending.rows[0].c,
    todayAppointments: todayAppointments.rows[0].c,
    licencesIssued: licencesIssued.rows[0].c,
  };
}

// ─── Licence ──────────────────────────────────────────────────────────
async function getLicence(citizenId) {
  const licence = await driverLicenceRepository.findByCitizen(citizenId);
  return licence || null;
}

async function renewLicence(citizenId, user, data = {}) {
  const licence = await driverLicenceRepository.findByCitizen(citizenId);
  if (!licence) throw badRequest('You need an issued driving licence before you can renew it.');
  const referenceNumber = await generateReference('TRAFFIC_RENEWAL');
  const application = await applicationRepository.create({
    referenceNumber, citizenId, service: 'TRAFFIC',
    data: {
      type: 'LICENCE_RENEWAL',
      licenceId: licence.id,
      licenceNumber: licence.licence_number,
    },
  });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'LICENCE_RENEWAL',
    applicationReference: referenceNumber,
    amount: data.amount || 250,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'LICENCE_RENEWAL_SUBMITTED',
    recordType: 'APPLICATION', recordId: application.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Licence renewal received',
    `Your renewal request ${referenceNumber} has been received.`);
  return { referenceNumber, application };
}

async function bookDrivingTest(citizenId, data, user) {
  const existing = await drivingTestRepository.findByCitizen(citizenId);
  const conflict = existing.find(
    (t) => t.test_date === data.date && t.time_slot === data.time && t.status === 'BOOKED'
  );
  if (conflict) throw badRequest('You already have a booking at this time');
  const booking = await drivingTestRepository.create({ ...data, citizenId });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'DRIVING_TEST_BOOKING',
    applicationReference: String(booking.id),
    amount: data.amount || 100,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'DRIVING_TEST_BOOKED',
    recordType: 'DRIVING_TEST', recordId: booking.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Driving test booked',
    `Your driving test is booked for ${data.date} at ${data.time}.`);
  return booking;
}

async function getAppointments(citizenId) {
  return drivingTestRepository.findByCitizen(citizenId);
}

async function cancelAppointment(id, citizenId) {
  const appointments = await drivingTestRepository.findByCitizen(citizenId);
  const found = appointments.find((a) => a.id === id);
  if (!found) throw notFound('Appointment not found');
  await drivingTestRepository.cancel(id);
}

async function getStaffApplications(filters) {
  return applicationRepository.findByService('TRAFFIC', filters);
}

async function generateLicenceNumber() {
  const result = await query(
    "SELECT nextval('driver_licence_number_seq') AS number"
  );
  const year = new Date().getFullYear();
  return `DLN-${year}-${String(result.rows[0].number).padStart(6, '0')}`;
}

async function approveTrafficApplication(applicationId, subType, staffUser, citizenSignatureDataUrl) {
  const app = await applicationRepository.findById(applicationId);
  if (!app) throw notFound('Application not found');

  if (app.status === 'APPROVED' || app.status === 'COMPLETED') {
    throw badRequest('This application has already been approved.');
  }

  const licenceNumber = await generateLicenceNumber();
  const issueDate = new Date().toISOString().slice(0, 10);
  const expiryDate = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);
  const isPublicTransport = subType === 'PUBLIC_DRIVING_PERMIT';

  const licence = await driverLicenceRepository.create({
    citizenId: app.citizen_id,
    licenceNumber,
    licenceType: isPublicTransport ? 'PDP' : 'ORDINARY',
    issueDate,
    expiryDate,
    applicationId: app.id,
    issuedBy: staffUser.userId,
    isPublicTransport,
  });

  if (citizenSignatureDataUrl) {
    const signature = await signatureService.save(
      {
        citizenId: app.citizen_id,
        documentTypeCode: isPublicTransport ? 'PUBLIC_DRIVING_PERMIT' : 'DRIVERS_LICENCE',
        signatureData: citizenSignatureDataUrl,
      },
      staffUser
    );
    await driverLicenceRepository.attachSignature(licence.id, signature.id);
  }

  await applicationRepository.updateStatus(
    applicationId, 'COMPLETED', staffUser.userId, 'Licence issued'
  );

  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: 'DRIVING_LICENCE_ISSUED',
    recordType: 'DRIVER_LICENCE', recordId: licence.id, result: 'SUCCESS',
  });

  await notifyCitizen(app.citizen_id, 'Licence issued',
    `Your licence ${licenceNumber} has been issued.`);

  return { licence, application: app };
}

async function processApplication(applicationId, action, body, staffUser) {
  const status =
    action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';

  const app = await applicationRepository.findById(applicationId);
  if (!app) throw notFound('Application not found');

  if (action === 'APPROVE' && (app.sub_type === 'DRIVING_LICENCE' || app.sub_type === 'PUBLIC_DRIVING_PERMIT')) {
    return approveTrafficApplication(
      applicationId, app.sub_type, staffUser, body?.citizenSignature
    );
  }

  await applicationRepository.updateStatus(applicationId, status, staffUser.userId, action);

  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: `TRAFFIC_APPLICATION_${status}`,
    recordType: 'APPLICATION', recordId: applicationId, result: 'SUCCESS',
  });

  await notifyCitizen(app.citizen_id, 'Traffic application update',
    `Your application ${app.reference_number} is now ${status.toLowerCase()}.`);

  return { status };
}

// ─── Vehicles ────────────────────────────────────────────────────────
async function getVehicles(citizenId) {
  return vehicleRepository.findByCitizen(citizenId);
}

async function registerVehicle(citizenId, data, user) {
  if (!data.registrationNumber) throw badRequest('Registration number is required.');
  if (!data.make) throw badRequest('Make is required.');
  if (!data.model) throw badRequest('Model is required.');

  const existing = await vehicleRepository.findByRegistrationNumber(
    data.registrationNumber.trim().toUpperCase()
  );
  if (existing) throw badRequest('A vehicle with this registration number already exists.');

  const created = await vehicleRepository.create({
    citizenId,
    registrationNumber: data.registrationNumber.trim().toUpperCase(),
    make: data.make,
    model: data.model,
    year: data.year,
    colour: data.colour,
    vin: data.vin,
    engineNumber: data.engineNumber,
    origin: data.origin || 'NEW',
    previousCountry: data.previousCountry,
    previousRegistration: data.previousRegistration,
  });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'VEHICLE_REGISTRATION',
    applicationReference: created.registration_number,
    amount: data.amount || 350,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'VEHICLE_REGISTERED',
    recordType: 'VEHICLE', recordId: created.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Vehicle registered',
    `Your vehicle ${created.registration_number} has been registered.`);
  return created;
}

async function updateVehicle(citizenId, id, data, user) {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle || vehicle.citizen_id !== citizenId) throw notFound('Vehicle not found');
  const updated = await vehicleRepository.update(id, data);
  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'VEHICLE_UPDATED',
    recordType: 'VEHICLE', recordId: id, result: 'SUCCESS',
  });
  return updated;
}

async function deleteVehicle(citizenId, id, user) {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle || vehicle.citizen_id !== citizenId) {
    throw notFound('Vehicle not found');
  }
  await vehicleRepository.removeWithGuard(id, user.userId);
}

// ─── Inspections ─────────────────────────────────────────────────────
async function bookInspection(citizenId, data, user) {
  if (!data.inspectionType) throw badRequest('Inspection type is required.');
  if (!data.inspectionDate) throw badRequest('Inspection date is required.');
  const referenceNumber = await generateReference('VEHICLE_INSPECTION');
  const created = await vehicleInspectionRepository.create({
    citizenId,
    vehicleId: data.vehicleId || null,
    referenceNumber,
    inspectionType: data.inspectionType,
    inspectionDate: data.inspectionDate,
    timeSlot: data.timeSlot,
    location: data.location,
  });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'VEHICLE_INSPECTION',
    applicationReference: referenceNumber,
    amount: data.amount || 120,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'VEHICLE_INSPECTION_BOOKED',
    recordType: 'VEHICLE_INSPECTION', recordId: created.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Inspection booked',
    `Your ${data.inspectionType.toLowerCase()} inspection is booked for ${data.inspectionDate}.`);
  return created;
}

async function getInspections(citizenId) {
  return vehicleInspectionRepository.findByCitizen(citizenId);
}

async function cancelInspection(citizenId, id) {
  const inspection = await vehicleInspectionRepository.findById(id);
  if (!inspection || inspection.citizen_id !== citizenId) throw notFound('Inspection not found');
  await vehicleInspectionRepository.cancel(id);
}

async function getStaffInspections(filters) {
  return vehicleInspectionRepository.findAll(filters);
}

async function processInspection(id, data, staffUser) {
  const inspection = await vehicleInspectionRepository.findById(id);
  if (!inspection) throw notFound('Inspection not found');
  let certificateNumber = null;
  let certificateExpiry = null;
  if (data.result === 'PASSED') {
    certificateNumber = `CF-${Date.now()}`;
    certificateExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);
  }
  const updated = await vehicleInspectionRepository.complete(id, {
    result: data.result, notes: data.notes, certificateNumber, certificateExpiry,
  });
  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: `VEHICLE_INSPECTION_${data.result}`,
    recordType: 'VEHICLE_INSPECTION', recordId: id, result: 'SUCCESS',
  });
  await notifyCitizen(inspection.citizen_id, 'Inspection result',
    `Your inspection is ${data.result.toLowerCase()}.${certificateNumber ? ` Certificate: ${certificateNumber}` : ''}`);
  return updated;
}

// ─── Vehicle licensing ────────────────────────────────────────────────
async function applyVehicleLicence(citizenId, data, user) {
  if (!data.vehicleId) throw badRequest('Vehicle is required.');
  const vehicle = await vehicleRepository.findById(data.vehicleId);
  if (!vehicle || vehicle.citizen_id !== citizenId) {
    throw notFound('Vehicle not found.');
  }
  const referenceNumber = await generateReference('VEHICLE_LICENCE');
  const feeAmount = data.feeAmount || 150.00;
  const created = await vehicleLicenceRepository.create({
    citizenId, vehicleId: data.vehicleId, referenceNumber, feeAmount,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'VEHICLE_LICENCE',
    applicationReference: referenceNumber,
    amount: feeAmount,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'VEHICLE_LICENCE_APPLIED',
    recordType: 'VEHICLE_LICENCE', recordId: created.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Vehicle licence application received',
    `Your vehicle licence application ${referenceNumber} has been received.`);
  return created;
}

async function getVehicleLicences(citizenId) {
  return vehicleLicenceRepository.findByCitizen(citizenId);
}

async function renewVehicleLicence(citizenId, licenceId, data, user) {
  const licence = await vehicleLicenceRepository.findById(licenceId);
  if (!licence || licence.citizen_id !== citizenId) {
    throw notFound('Vehicle licence not found.');
  }
  if (licence.status === 'PENDING') {
    throw badRequest('This vehicle licence already has a pending application.');
  }
  const latestForVehicle = await vehicleLicenceRepository.findByVehicle(licence.vehicle_id);
  if (latestForVehicle?.status === 'PENDING') {
    throw badRequest('This vehicle already has a pending licence application.');
  }

  return applyVehicleLicence(citizenId, {
    ...data,
    vehicleId: licence.vehicle_id,
  }, user);
}

// ─── Transport permits ────────────────────────────────────────────────
async function applyTransportPermit(citizenId, data, user) {
  if (!data.permitCategory) throw badRequest('Permit category is required.');
  if (!data.permitType) throw badRequest('Permit type is required.');
  if (!data.validFrom) throw badRequest('Valid-from date is required.');
  if (!data.validUntil) throw badRequest('Valid-until date is required.');
  const referenceNumber = await generateReference('TRANSPORT_PERMIT');
  const created = await transportPermitRepository.create({
    citizenId, referenceNumber,
    permitCategory: data.permitCategory,
    permitType: data.permitType,
    vehicleId: data.vehicleId,
    routeDescription: data.routeDescription,
    validFrom: data.validFrom,
    validUntil: data.validUntil,
  });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'TRANSPORT_PERMIT',
    applicationReference: referenceNumber,
    amount: data.amount || 400,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'TRANSPORT_PERMIT_APPLIED',
    recordType: 'TRANSPORT_PERMIT', recordId: created.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Transport permit application received',
    `Your application ${referenceNumber} has been submitted.`);
  return created;
}

async function getTransportPermits(citizenId) {
  return transportPermitRepository.findByCitizen(citizenId);
}
async function getStaffTransportPermits(filters) {
  return transportPermitRepository.findAll(filters);
}
async function processTransportPermit(id, action, staffUser) {
  const updated = await transportPermitRepository.process(id, action, staffUser);
  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: `TRANSPORT_PERMIT_${action}`,
    recordType: 'TRANSPORT_PERMIT', recordId: id, result: 'SUCCESS',
  });
  await notifyCitizen(updated.citizen_id, 'Transport permit update',
    `Your transport permit application is now ${updated.status.toLowerCase()}.`);
  return updated;
}

// ─── Licence applications ─────────────────────────────────────────────
async function applyForLearnersLicence(citizenId, data, user) {
  const referenceNumber = await generateReference('LEARNERS_LICENCE');
  const app = await licenceApplicationRepository.create({
    referenceNumber, citizenId, subType: 'LEARNERS_LICENCE',
    data: { examCentre: data.examCentre },
  });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'LEARNERS_LICENCE',
    applicationReference: referenceNumber,
    amount: data.amount || 100,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'LEARNERS_LICENCE_APPLIED',
    recordType: 'APPLICATION', recordId: app.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, "Learner's licence application received",
    `Your application ${referenceNumber} has been submitted.`);
  return app;
}

async function applyForDrivingLicence(citizenId, data, user) {
  if (!data.licenceType) throw badRequest('Licence type is required.');
  if (!data.testReference) throw badRequest('Test reference number is required.');
  const referenceNumber = await generateReference('DRIVING_LICENCE');
  const app = await licenceApplicationRepository.create({
    referenceNumber, citizenId, subType: 'DRIVING_LICENCE',
    data: { licenceType: data.licenceType, testReference: data.testReference },
  });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'DRIVING_LICENCE',
    applicationReference: referenceNumber,
    amount: data.amount || 300,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'DRIVING_LICENCE_APPLIED',
    recordType: 'APPLICATION', recordId: app.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Driving licence application received',
    `Your application ${referenceNumber} has been submitted.`);
  return app;
}

async function applyForPublicDrivingPermit(citizenId, data, user) {
  if (!data.purpose) throw badRequest('Purpose is required.');
  if (!data.testReference) throw badRequest('Test reference number is required.');
  const referenceNumber = await generateReference('PUBLIC_DRIVING_PERMIT');
  const app = await licenceApplicationRepository.create({
    referenceNumber, citizenId, subType: 'PUBLIC_DRIVING_PERMIT',
    data: { purpose: data.purpose, testReference: data.testReference, licenceNumber: data.licenceNumber },
  });

  await paymentService.recordPayment({
    citizenId,
    ministry: 'TRAFFIC',
    service: 'PUBLIC_DRIVING_PERMIT',
    applicationReference: referenceNumber,
    amount: data.amount || 400,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    receivedBy: user.userId,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'PUBLIC_DRIVING_PERMIT_APPLIED',
    recordType: 'APPLICATION', recordId: app.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Public driving permit received',
    `Your application ${referenceNumber} has been submitted.`);
  return app;
}

async function getMyApplications(citizenId) {
  return licenceApplicationRepository.findByCitizen(citizenId);
}
async function getApplicationByReference(referenceNumber, citizenId) {
  const app = await licenceApplicationRepository.findByReference(referenceNumber);
  if (!app) return null;
  if (citizenId && app.citizen_id !== citizenId) return null;
  const history = await licenceApplicationRepository.getHistory(app.id);
  return { ...app, history };
}

module.exports = {
  getStaffStats,
  getLicence, renewLicence, bookDrivingTest, getAppointments, cancelAppointment,
  getStaffApplications, processApplication,
  getVehicles, registerVehicle, updateVehicle, deleteVehicle,
  bookInspection, getInspections, cancelInspection, getStaffInspections, processInspection,
  applyVehicleLicence, getVehicleLicences,
  renewVehicleLicence,
  applyTransportPermit, getTransportPermits, getStaffTransportPermits, processTransportPermit,
  applyForLearnersLicence, applyForDrivingLicence, applyForPublicDrivingPermit,
  getMyApplications, getApplicationByReference,
};