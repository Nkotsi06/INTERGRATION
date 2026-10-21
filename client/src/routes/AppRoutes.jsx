import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import RoleRoute from '../components/layout/RoleRoute';

// Auth
import Welcome from '../pages/auth/Welcome';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import StaffLogin from '../pages/auth/StaffLogin';
import AdminLogin from '../pages/auth/AdminLogin';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Citizen
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import IdentityVerification from '../pages/citizen/IdentityVerification';
import VerificationSuccess from '../pages/citizen/VerificationSuccess';
import VerificationPending from '../pages/citizen/VerificationPending';
import VerificationFailure from '../pages/citizen/VerificationFailure';
import CitizenProfile from '../pages/citizen/CitizenProfile';
import ChangePassword from '../pages/citizen/ChangePassword';
import ApplicationStatus from '../pages/citizen/ApplicationStatus';
import MyDocuments from '../pages/citizen/MyDocuments';
import MyBiometrics from '../pages/citizen/MyBiometrics';
import MyCertificates from '../pages/citizen/MyCertificates';
import ApplyNationalId from '../pages/citizen/ApplyNationalId'; // ← NEW
import ApplyBirthCertificate from '../pages/citizen/ApplyBirthCertificate';

// Notifications
import Notifications from '../pages/common/Notifications';

import ServiceApply from '../pages/citizen/ServiceApply';
import Services from '../pages/citizen/Services';

// ... (Keep all your Home Affairs, Traffic, Police, Finance, Pensions, Passport, Admin, and Help imports exactly as they are) ...
import HAStaffDashboard from '../pages/homeAffairs/StaffDashboard';
import HANewRegistrations from '../pages/homeAffairs/NewRegistrations';
import HACompleteCitizenRecord from '../pages/homeAffairs/CompleteCitizenRecord';
import HARecordSaved from '../pages/homeAffairs/RecordSaved';
import HACitizenSearch from '../pages/homeAffairs/CitizenSearch';
import HACitizenProfile from '../pages/homeAffairs/CitizenProfileStaff';
import HAVerifyCitizen from '../pages/homeAffairs/VerifyCitizen';
import HAReports from '../pages/homeAffairs/Reports';
import HACertificates from '../pages/homeAffairs/Certificates';
import HAIssueCertificate from '../pages/homeAffairs/IssueCertificate';
import HAEditCertificate from '../pages/homeAffairs/EditCertificate';
import HAApplicationQueue from '../pages/homeAffairs/ApplicationQueue';
import HAApplicationDetail from '../pages/homeAffairs/ApplicationDetail';
import BirthApplicationQueue from '../pages/homeAffairs/BirthApplicationQueue';
import HAEnquiriesQueue from '../pages/homeAffairs/EnquiriesQueue';
import HADocumentVerification from '../pages/homeAffairs/DocumentVerification';
import HAInformationManagement from '../pages/homeAffairs/InformationManagement';
import HAVerifyDocuments from '../pages/homeAffairs/VerifyDocuments';

import TrafficDashboard from '../pages/traffic/TrafficDashboard';
import ViewLicence from '../pages/traffic/ViewLicence';
import RenewLicence from '../pages/traffic/RenewLicence';
import BookDrivingTest from '../pages/traffic/BookDrivingTest';
import MyAppointments from '../pages/traffic/MyAppointments';
import TrafficStaffDashboard from '../pages/traffic/StaffDashboard';
import TrafficApplicationProcessing from '../pages/traffic/ApplicationProcessing';
import IssueLicence from '../pages/traffic/IssueLicence';
import MyVehicles from '../pages/traffic/MyVehicles';
import VehicleForm from '../pages/traffic/VehicleForm';
import ApplyLearnersLicence from '../pages/traffic/ApplyLearnersLicence';
import ApplyDrivingLicence from '../pages/traffic/ApplyDrivingLicence';
import ApplyPublicDrivingPermit from '../pages/traffic/ApplyPublicDrivingPermit';
import MyTrafficApplications from '../pages/traffic/MyTrafficApplications';
import MyInspections from '../pages/traffic/MyInspections';
import BookInspection from '../pages/traffic/BookInspection';
import MyVehicleLicences from '../pages/traffic/MyVehicleLicences';
import ApplyVehicleLicence from '../pages/traffic/ApplyVehicleLicence';
import MyTransportPermits from '../pages/traffic/MyTransportPermits';
import ApplyTransportPermit from '../pages/traffic/ApplyTransportPermit';
import DrivingTestQueue from '../pages/traffic/DrivingTestQueue';

import PoliceDashboard from '../pages/police/PoliceDashboard';
import ReportCase from '../pages/police/ReportCase';
import MyCases from '../pages/police/MyCases';
import CaseDetails from '../pages/police/CaseDetails';
import RequestClearance from '../pages/police/RequestClearance';
import PoliceStaffDashboard from '../pages/police/StaffDashboard';
import ManageCases from '../pages/police/ManageCases';
import CaseUpdate from '../pages/police/CaseUpdate';
import RequestCriminalRecord from '../pages/police/RequestCriminalRecord';
import MyCriminalRecords from '../pages/police/MyCriminalRecords';
import ManageClearances from '../pages/police/ManageClearances';
import ManageCriminalRecords from '../pages/police/ManageCriminalRecords';

import FinanceDashboard from '../pages/finance/FinanceDashboard';
import FinanceStaffDashboard from '../pages/finance/StaffDashboard';
import TreasuryView from '../pages/finance/TreasuryView';
import BudgetView from '../pages/finance/BudgetView';
import DebtView from '../pages/finance/DebtView';
import ProcurementView from '../pages/finance/ProcurementView';
import AuditFindingsView from '../pages/finance/AuditFindingsView';
import PaymentsReceived from '../pages/finance/PaymentsReceived';
import FeeSchedule from '../pages/finance/FeeSchedule';

import PensionsDashboard from '../pages/pensions/PensionsDashboard';
import ViewPensionInfo from '../pages/pensions/ViewPensionInfo';
import ExistenceVerification from '../pages/pensions/ExistenceVerification';
import PensionVerificationSuccess from '../pages/pensions/VerificationSuccess';
import VerificationHistory from '../pages/pensions/VerificationHistory';
import PensionsStaffDashboard from '../pages/pensions/StaffDashboard';
import ProcessVerification from '../pages/pensions/ProcessVerification';

import PassportDashboard from '../pages/passport/PassportDashboard';
import ApplyForPassport from '../pages/passport/ApplyForPassport';
import PassportApplicationConfirmation from '../pages/passport/ApplicationConfirmation';
import PassportCheckStatus from '../pages/passport/CheckStatus';
import PassportStaffDashboard from '../pages/passport/StaffDashboard';
import ProcessPassportApplication from '../pages/passport/ProcessApplication';
import PassportApplicationHistory from '../pages/passport/ApplicationHistory';

import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import AddUser from '../pages/admin/AddUser';
import EditUser from '../pages/admin/EditUser';
import AuditLogs from '../pages/admin/AuditLogs';
import SystemSettings from '../pages/admin/SystemSettings';
import MinistryConfig from '../pages/admin/MinistryConfig';
import DocumentTypeConfig from '../pages/admin/DocumentTypeConfig';
import StatusConfig from '../pages/admin/StatusConfig';
import ReferenceFormatConfig from '../pages/admin/ReferenceFormatConfig';
import LanguageConfig from '../pages/admin/LanguageConfig';
import BiometricConfig from '../pages/admin/BiometricConfig';
import BranchManagement from '../pages/admin/BranchManagement';
import ServiceCatalogue from '../pages/admin/ServiceCatalogue';

import HelpHome from '../pages/help/HelpHome';
import HelpGettingStarted from '../pages/help/GettingStarted';
import HelpVerification from '../pages/help/Verification';
import HelpServices from '../pages/help/Services';
import HelpDocuments from '../pages/help/Documents';
import HelpOffices from '../pages/help/Offices';
import HelpAccessibility from '../pages/help/Accessibility';

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Welcome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/birth-certificate/apply" element={<ApplyBirthCertificate />} />
      <Route path="/login" element={<Login />} />
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Notifications — any authenticated user */}
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Citizen */}
      <Route path="/citizen/dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/verify" element={<ProtectedRoute><IdentityVerification /></ProtectedRoute>} />
      <Route path="/citizen/verify/success" element={<ProtectedRoute><VerificationSuccess /></ProtectedRoute>} />
      <Route path="/citizen/verify/pending" element={<ProtectedRoute><VerificationPending /></ProtectedRoute>} />
      <Route path="/citizen/verify/failure" element={<ProtectedRoute><VerificationFailure /></ProtectedRoute>} />
      <Route path="/citizen/profile" element={<ProtectedRoute><CitizenProfile /></ProtectedRoute>} />
      <Route path="/citizen/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/citizen/applications" element={<ProtectedRoute><ApplicationStatus /></ProtectedRoute>} />
      <Route path="/citizen/documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
      <Route path="/citizen/certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
      <Route path="/citizen/biometrics" element={<ProtectedRoute><MyBiometrics /></ProtectedRoute>} />
      <Route path="/citizen/notifications" element={<Navigate to="/notifications" replace />} />
      <Route path="/citizen/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
      
      {/* National ID Application */}
      <Route path="/citizen/services/national-id/apply" element={<ProtectedRoute><ApplyNationalId /></ProtectedRoute>} />
      <Route path="/citizen/services/:id/apply" element={<ProtectedRoute><ServiceApply /></ProtectedRoute>} />

      {/* Home Affairs staff */}
      <Route path="/home-affairs/dashboard" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAStaffDashboard /></RoleRoute>} />
      <Route path="/home-affairs/enquiries" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAEnquiriesQueue /></RoleRoute>} />
      <Route path="/home-affairs/verify-document" element={<RoleRoute roles={['HOME_AFFAIRS']}><HADocumentVerification /></RoleRoute>} />
      <Route path="/home-affairs/information" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAInformationManagement /></RoleRoute>} />
      <Route path="/home-affairs/registrations" element={<RoleRoute roles={['HOME_AFFAIRS']}><HANewRegistrations /></RoleRoute>} />
      <Route path="/home-affairs/registrations/:id" element={<RoleRoute roles={['HOME_AFFAIRS']}><HACompleteCitizenRecord /></RoleRoute>} />
      <Route path="/home-affairs/record/:id/saved" element={<RoleRoute roles={['HOME_AFFAIRS']}><HARecordSaved /></RoleRoute>} />
      <Route path="/home-affairs/search" element={<RoleRoute roles={['HOME_AFFAIRS']}><HACitizenSearch /></RoleRoute>} />
      <Route path="/home-affairs/citizen/:id" element={<RoleRoute roles={['HOME_AFFAIRS']}><HACitizenProfile /></RoleRoute>} />
      <Route path="/home-affairs/citizen/:id/documents" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAVerifyDocuments /></RoleRoute>} />
      <Route path="/home-affairs/verify/:id" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAVerifyCitizen /></RoleRoute>} />
      <Route path="/home-affairs/reports" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAReports /></RoleRoute>} />
      <Route path="/home-affairs/certificates" element={<RoleRoute roles={['HOME_AFFAIRS']}><HACertificates /></RoleRoute>} />
      <Route path="/home-affairs/citizen/:id/certificates" element={<RoleRoute roles={['HOME_AFFAIRS']}><HACertificates /></RoleRoute>} />
      <Route path="/home-affairs/citizen/:id/certificates/new" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAIssueCertificate /></RoleRoute>} />
      <Route path="/home-affairs/certificates/:type/:id/edit" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAEditCertificate /></RoleRoute>} />
      // ... inside the Home Affairs routes ...
      <Route path="/home-affairs/applications" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAApplicationQueue /></RoleRoute>} />
      <Route path="/home-affairs/applications/:id" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAApplicationDetail /></RoleRoute>} />
      <Route path="/home-affairs/birth-applications" element={<RoleRoute roles={['HOME_AFFAIRS']}><BirthApplicationQueue /></RoleRoute>} />

      {/* ... (Keep Traffic, Police, Finance, Pensions, Passport, Admin, Help routes exactly as they are) ... */}
      {/* Traffic — citizen */}
      <Route path="/traffic/dashboard" element={<ProtectedRoute><TrafficDashboard /></ProtectedRoute>} />
      <Route path="/traffic/licence" element={<ProtectedRoute><ViewLicence /></ProtectedRoute>} />
      <Route path="/traffic/licence/learners" element={<ProtectedRoute><ApplyLearnersLicence /></ProtectedRoute>} />
      <Route path="/traffic/licence/driving" element={<ProtectedRoute><ApplyDrivingLicence /></ProtectedRoute>} />
      <Route path="/traffic/licence/pdp" element={<ProtectedRoute><ApplyPublicDrivingPermit /></ProtectedRoute>} />
      <Route path="/traffic/renew" element={<ProtectedRoute><RenewLicence /></ProtectedRoute>} />
      <Route path="/traffic/book-test" element={<ProtectedRoute><BookDrivingTest /></ProtectedRoute>} />
      <Route path="/traffic/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
      <Route path="/traffic/applications" element={<ProtectedRoute><MyTrafficApplications /></ProtectedRoute>} />
      <Route path="/traffic/vehicles" element={<ProtectedRoute><MyVehicles /></ProtectedRoute>} />
      <Route path="/traffic/vehicles/new" element={<ProtectedRoute><VehicleForm /></ProtectedRoute>} />
      <Route path="/traffic/vehicles/edit/:id" element={<ProtectedRoute><VehicleForm /></ProtectedRoute>} />
      <Route path="/traffic/inspections" element={<ProtectedRoute><MyInspections /></ProtectedRoute>} />
      <Route path="/traffic/inspections/new" element={<ProtectedRoute><BookInspection /></ProtectedRoute>} />
      <Route path="/traffic/vehicle-licences" element={<ProtectedRoute><MyVehicleLicences /></ProtectedRoute>} />
      <Route path="/traffic/vehicle-licences/new" element={<ProtectedRoute><ApplyVehicleLicence /></ProtectedRoute>} />
      <Route path="/traffic/permits" element={<ProtectedRoute><MyTransportPermits /></ProtectedRoute>} />
      <Route path="/traffic/permits/new" element={<ProtectedRoute><ApplyTransportPermit /></ProtectedRoute>} />

      {/* Traffic — staff */}
      <Route path="/traffic/staff" element={<RoleRoute roles={['TRAFFIC']}><TrafficStaffDashboard /></RoleRoute>} />
      <Route path="/traffic/processing" element={<RoleRoute roles={['TRAFFIC']}><TrafficApplicationProcessing /></RoleRoute>} />
      <Route path="/traffic/tests" element={<RoleRoute roles={['TRAFFIC']}><DrivingTestQueue /></RoleRoute>} />
      <Route path="/traffic/issue-licence/:id" element={<RoleRoute roles={['TRAFFIC']}><IssueLicence /></RoleRoute>} />

      {/* Police — citizen */}
      <Route path="/police/dashboard" element={<ProtectedRoute><PoliceDashboard /></ProtectedRoute>} />
      <Route path="/police/report" element={<ProtectedRoute><ReportCase /></ProtectedRoute>} />
      <Route path="/police/cases" element={<ProtectedRoute><MyCases /></ProtectedRoute>} />
      <Route path="/police/cases/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
      <Route path="/police/clearance" element={<ProtectedRoute><RequestClearance /></ProtectedRoute>} />
      <Route path="/police/criminal-records" element={<ProtectedRoute><MyCriminalRecords /></ProtectedRoute>} />
      <Route path="/police/criminal-records/new" element={<ProtectedRoute><RequestCriminalRecord /></ProtectedRoute>} />

      {/* Police — staff */}
      <Route path="/police/staff" element={<RoleRoute roles={['POLICE']}><PoliceStaffDashboard /></RoleRoute>} />
      <Route path="/police/manage" element={<RoleRoute roles={['POLICE']}><ManageCases /></RoleRoute>} />
      <Route path="/police/staff/clearances" element={<RoleRoute roles={['POLICE']}><ManageClearances /></RoleRoute>} />
      <Route path="/police/staff/criminal-records" element={<RoleRoute roles={['POLICE']}><ManageCriminalRecords /></RoleRoute>} />
      <Route path="/police/update/:id" element={<RoleRoute roles={['POLICE']}><CaseUpdate /></RoleRoute>} />

      {/* Finance — citizen */}
      <Route path="/finance/dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />

      {/* Finance — staff */}
      <Route path="/finance/staff" element={<RoleRoute roles={['FINANCE']}><FinanceStaffDashboard /></RoleRoute>} />
      <Route path="/finance/treasury" element={<RoleRoute roles={['FINANCE']}><TreasuryView /></RoleRoute>} />
      <Route path="/finance/budget" element={<RoleRoute roles={['FINANCE']}><BudgetView /></RoleRoute>} />
      <Route path="/finance/debt" element={<RoleRoute roles={['FINANCE']}><DebtView /></RoleRoute>} />
      <Route path="/finance/procurement" element={<RoleRoute roles={['FINANCE']}><ProcurementView /></RoleRoute>} />
      <Route path="/finance/audit" element={<RoleRoute roles={['FINANCE']}><AuditFindingsView /></RoleRoute>} />
      <Route path="/finance/payments" element={<RoleRoute roles={['FINANCE']}><PaymentsReceived /></RoleRoute>} />
      <Route path="/finance/fee-schedule" element={<RoleRoute roles={['FINANCE']}><FeeSchedule /></RoleRoute>} />

      {/* Pensions */}
      <Route path="/pensions/dashboard" element={<ProtectedRoute><PensionsDashboard /></ProtectedRoute>} />
      <Route path="/pensions/info" element={<ProtectedRoute><ViewPensionInfo /></ProtectedRoute>} />
      <Route path="/pensions/verify" element={<ProtectedRoute><ExistenceVerification /></ProtectedRoute>} />
      <Route path="/pensions/verify/success" element={<ProtectedRoute><PensionVerificationSuccess /></ProtectedRoute>} />
      <Route path="/pensions/history" element={<ProtectedRoute><VerificationHistory /></ProtectedRoute>} />
      <Route path="/pensions/staff" element={<RoleRoute roles={['PENSIONS']}><PensionsStaffDashboard /></RoleRoute>} />
      <Route path="/pensions/process" element={<RoleRoute roles={['PENSIONS']}><ProcessVerification /></RoleRoute>} />

      {/* Passport */}
      <Route path="/passport/dashboard" element={<ProtectedRoute><PassportDashboard /></ProtectedRoute>} />
      <Route path="/passport/apply" element={<ProtectedRoute><ApplyForPassport /></ProtectedRoute>} />
      <Route path="/passport/confirmation" element={<ProtectedRoute><PassportApplicationConfirmation /></ProtectedRoute>} />
      <Route path="/passport/status" element={<ProtectedRoute><PassportCheckStatus /></ProtectedRoute>} />
      <Route path="/passport/staff" element={<RoleRoute roles={['PASSPORT']}><PassportStaffDashboard /></RoleRoute>} />
      <Route path="/passport/process" element={<RoleRoute roles={['PASSPORT']}><ProcessPassportApplication /></RoleRoute>} />
      <Route path="/passport/history" element={<RoleRoute roles={['PASSPORT']}><PassportApplicationHistory /></RoleRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<RoleRoute roles={['ADMIN']}><AdminDashboard /></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute roles={['ADMIN']}><UserManagement /></RoleRoute>} />
      <Route path="/admin/users/add" element={<RoleRoute roles={['ADMIN']}><AddUser /></RoleRoute>} />
      <Route path="/admin/users/edit/:id" element={<RoleRoute roles={['ADMIN']}><EditUser /></RoleRoute>} />
      <Route path="/admin/audit-logs" element={<RoleRoute roles={['ADMIN']}><AuditLogs /></RoleRoute>} />
      <Route path="/admin/settings" element={<RoleRoute roles={['ADMIN']}><SystemSettings /></RoleRoute>} />
      <Route path="/admin/settings/ministries" element={<RoleRoute roles={['ADMIN']}><MinistryConfig /></RoleRoute>} />
      <Route path="/admin/settings/document-types" element={<RoleRoute roles={['ADMIN']}><DocumentTypeConfig /></RoleRoute>} />
      <Route path="/admin/settings/statuses" element={<RoleRoute roles={['ADMIN']}><StatusConfig /></RoleRoute>} />
      <Route path="/admin/settings/reference-formats" element={<RoleRoute roles={['ADMIN']}><ReferenceFormatConfig /></RoleRoute>} />
      <Route path="/admin/settings/languages" element={<RoleRoute roles={['ADMIN']}><LanguageConfig /></RoleRoute>} />
      <Route path="/admin/settings/biometrics" element={<RoleRoute roles={['ADMIN']}><BiometricConfig /></RoleRoute>} />
      <Route path="/admin/branches" element={<RoleRoute roles={['ADMIN']}><BranchManagement /></RoleRoute>} />
      <Route path="/admin/service-catalogue" element={<RoleRoute roles={['ADMIN']}><ServiceCatalogue /></RoleRoute>} />

      {/* Help — public */}
      <Route path="/help" element={<HelpHome />} />
      <Route path="/help/getting-started" element={<HelpGettingStarted />} />
      <Route path="/help/verification" element={<HelpVerification />} />
      <Route path="/help/services" element={<HelpServices />} />
      <Route path="/help/documents" element={<HelpDocuments />} />
      <Route path="/help/offices" element={<HelpOffices />} />
      <Route path="/help/accessibility" element={<HelpAccessibility />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;