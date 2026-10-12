const driverLicenceRepository = require('../repositories/driverLicenceRepository');
const drivingTestRepository = require('../repositories/drivingTestRepository');
const applicationRepository = require('../repositories/applicationRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const { generateReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

async function getLicence(citizenId) {
  return driverLicenceRepository.findByCitizen(citizenId);
}

async function renewLicence(citizenId, user) {
  const referenceNumber = await generateReference('TRAFFIC_RENEWAL');

  const application = await applicationRepository.create({
    referenceNumber,
    citizenId,
    service: 'TRAFFIC',
    data: { type: 'LICENCE_RENEWAL' },
  });

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'LICENCE_RENEWAL_SUBMITTED',
    recordType: 'APPLICATION',
    recordId: application.id,
    result: 'SUCCESS',
  });

  await notifyCitizen(
    citizenId,
    'Licence renewal received',
    `Your renewal request ${referenceNumber} has been received.`
  );

  return { referenceNumber, application };
}

async function bookDrivingTest(citizenId, data, user) {
  const existing = await drivingTestRepository.findByCitizen(citizenId);
  const conflict = existing.find(
    (t) => t.test_date === data.date && t.time_slot === data.time && t.status === 'BOOKED'
  );
  if (conflict) throw new Error('You already have a booking at this time');

  const booking = await drivingTestRepository.create({ ...data, citizenId });

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'DRIVING_TEST_BOOKED',
    recordType: 'DRIVING_TEST',
    recordId: booking.id,
    result: 'SUCCESS',
  });

  await notifyCitizen(
    citizenId,
    'Driving test booked',
    `Your driving test is booked for ${data.date} at ${data.time}.`
  );

  return booking;
}

async function getAppointments(citizenId) {
  return drivingTestRepository.findByCitizen(citizenId);
}

async function cancelAppointment(id, citizenId) {
  const appointments = await drivingTestRepository.findByCitizen(citizenId);
  const found = appointments.find((a) => a.id === id);
  if (!found) throw new Error('Appointment not found');
  await drivingTestRepository.cancel(id);
}

async function getStaffApplications(filters) {
  return applicationRepository.findByService('TRAFFIC', filters);
}

async function processApplication(applicationId, action, staffUser) {
  const status =
    action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';

  await applicationRepository.updateStatus(applicationId, status, staffUser.userId, action);

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `TRAFFIC_APPLICATION_${status}`,
    recordType: 'APPLICATION',
    recordId: applicationId,
    result: 'SUCCESS',
  });

  const app = await applicationRepository.findById(applicationId);
  if (app) {
    await notifyCitizen(
      app.citizen_id,
      'Traffic application update',
      `Your application ${app.reference_number} is now ${status.toLowerCase()}.`
    );
  }
}

module.exports = {
  getLicence,
  renewLicence,
  bookDrivingTest,
  getAppointments,
  cancelAppointment,
  getStaffApplications,
  processApplication,
};