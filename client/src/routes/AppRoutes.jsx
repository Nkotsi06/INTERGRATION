import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import RoleRoute from '../components/layout/RoleRoute';

// Auth
import Welcome from '../pages/auth/Welcome';
import Register from '../pages/auth/Register';
import RegistrationReceived from '../pages/auth/RegistrationReceived';
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
import Notifications from '../pages/citizen/Notifications';

// Home Affairs
import HAStaffDashboard from '../pages/homeAffairs/StaffDashboard';
import HANewRegistrations from '../pages/homeAffairs/NewRegistrations';
import HACompleteCitizenRecord from '../pages/homeAffairs/CompleteCitizenRecord';
import HARecordSaved from '../pages/homeAffairs/RecordSaved';
import HACitizenSearch from '../pages/homeAffairs/CitizenSearch';
import HACitizenProfile from '../pages/homeAffairs/CitizenProfileStaff';
import HAVerifyCitizen from '../pages/homeAffairs/VerifyCitizen';
import HAReports from '../pages/homeAffairs/Reports';

// Traffic
import TrafficDashboard from '../pages/traffic/TrafficDashboard';
import ViewLicence from '../pages/traffic/ViewLicence';
import RenewLicence from '../pages/traffic/RenewLicence';
import BookDrivingTest from '../pages/traffic/BookDrivingTest';
import MyAppointments from '../pages/traffic/MyAppointments';
import TrafficStaffDashboard from '../pages/traffic/StaffDashboard';
import TrafficApplicationProcessing from '../pages/traffic/ApplicationProcessing';
import IssueLicence from '../pages/traffic/IssueLicence';

// Police
import PoliceDashboard from '../pages/police/PoliceDashboard';
import ReportCase from '../pages/police/ReportCase';
import MyCases from '../pages/police/MyCases';
import CaseDetails from '../pages/police/CaseDetails';
import RequestClearance from '../pages/police/RequestClearance';
import PoliceStaffDashboard from '../pages/police/StaffDashboard';
import ManageCases from '../pages/police/ManageCases';
import CaseUpdate from '../pages/police/CaseUpdate';

// Finance
import FinanceDashboard from '../pages/finance/FinanceDashboard';
import TaxRegistration from '../pages/finance/TaxRegistration';
import TaxProfile from '../pages/finance/TaxProfile';
import MakePayment from '../pages/finance/MakePayment';
import PaymentConfirmation from '../pages/finance/PaymentConfirmation';
import TaxClearanceCertificate from '../pages/finance/TaxClearanceCertificate';
import FinanceStaffDashboard from '../pages/finance/StaffDashboard';
import ProcessTaxRegistration from '../pages/finance/ProcessTaxRegistration';

// Pensions
import PensionsDashboard from '../pages/pensions/PensionsDashboard';
import ViewPensionInfo from '../pages/pensions/ViewPensionInfo';
import ExistenceVerification from '../pages/pensions/ExistenceVerification';
import PensionVerificationSuccess from '../pages/pensions/VerificationSuccess';
import VerificationHistory from '../pages/pensions/VerificationHistory';
import PensionsStaffDashboard from '../pages/pensions/StaffDashboard';
import ProcessVerification from '../pages/pensions/ProcessVerification';

// Passport
import PassportDashboard from '../pages/passport/PassportDashboard';
import ApplyForPassport from '../pages/passport/ApplyForPassport';
import PassportApplicationConfirmation from '../pages/passport/ApplicationConfirmation';
import PassportCheckStatus from '../pages/passport/CheckStatus';
import PassportStaffDashboard from '../pages/passport/StaffDashboard';
import ProcessPassportApplication from '../pages/passport/ProcessApplication';
import PassportApplicationHistory from '../pages/passport/ApplicationHistory';

// Admin
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
import LogoUpload from '../pages/admin/LogoUpload';
import BiometricConfig from '../pages/admin/BiometricConfig';

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Welcome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registration-received" element={<RegistrationReceived />} />
      <Route path="/login" element={<Login />} />
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Citizen (requires auth) */}
      <Route path="/citizen/dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/verify" element={<ProtectedRoute><IdentityVerification /></ProtectedRoute>} />
      <Route path="/citizen/verify/success" element={<ProtectedRoute><VerificationSuccess /></ProtectedRoute>} />
      <Route path="/citizen/verify/pending" element={<ProtectedRoute><VerificationPending /></ProtectedRoute>} />
      <Route path="/citizen/verify/failure" element={<ProtectedRoute><VerificationFailure /></ProtectedRoute>} />
      <Route path="/citizen/profile" element={<ProtectedRoute><CitizenProfile /></ProtectedRoute>} />
      <Route path="/citizen/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/citizen/applications" element={<ProtectedRoute><ApplicationStatus /></ProtectedRoute>} />
      <Route path="/citizen/documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
      <Route path="/citizen/biometrics" element={<ProtectedRoute><MyBiometrics /></ProtectedRoute>} />
      <Route path="/citizen/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Home Affairs staff */}
      <Route path="/home-affairs/dashboard" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAStaffDashboard /></RoleRoute>} />
      <Route path="/home-affairs/registrations" element={<RoleRoute roles={['HOME_AFFAIRS']}><HANewRegistrations /></RoleRoute>} />
      <Route path="/home-affairs/registrations/:id" element={<RoleRoute roles={['HOME_AFFAIRS']}><HACompleteCitizenRecord /></RoleRoute>} />
      <Route path="/home-affairs/record/:id/saved" element={<RoleRoute roles={['HOME_AFFAIRS']}><HARecordSaved /></RoleRoute>} />
      <Route path="/home-affairs/search" element={<RoleRoute roles={['HOME_AFFAIRS']}><HACitizenSearch /></RoleRoute>} />
      <Route path="/home-affairs/citizen/:id" element={<RoleRoute roles={['HOME_AFFAIRS']}><HACitizenProfile /></RoleRoute>} />
      <Route path="/home-affairs/verify/:id" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAVerifyCitizen /></RoleRoute>} />
      <Route path="/home-affairs/reports" element={<RoleRoute roles={['HOME_AFFAIRS']}><HAReports /></RoleRoute>} />

      {/* Traffic — citizen */}
      <Route path="/traffic/dashboard" element={<ProtectedRoute><TrafficDashboard /></ProtectedRoute>} />
      <Route path="/traffic/licence" element={<ProtectedRoute><ViewLicence /></ProtectedRoute>} />
      <Route path="/traffic/renew" element={<ProtectedRoute><RenewLicence /></ProtectedRoute>} />
      <Route path="/traffic/book-test" element={<ProtectedRoute><BookDrivingTest /></ProtectedRoute>} />
      <Route path="/traffic/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
      {/* Traffic — staff */}
      <Route path="/traffic/staff" element={<RoleRoute roles={['TRAFFIC']}><TrafficStaffDashboard /></RoleRoute>} />
      <Route path="/traffic/processing" element={<RoleRoute roles={['TRAFFIC']}><TrafficApplicationProcessing /></RoleRoute>} />
      <Route path="/traffic/issue-licence/:id" element={<RoleRoute roles={['TRAFFIC']}><IssueLicence /></RoleRoute>} />

      {/* Police — citizen */}
      <Route path="/police/dashboard" element={<ProtectedRoute><PoliceDashboard /></ProtectedRoute>} />
      <Route path="/police/report" element={<ProtectedRoute><ReportCase /></ProtectedRoute>} />
      <Route path="/police/cases" element={<ProtectedRoute><MyCases /></ProtectedRoute>} />
      <Route path="/police/cases/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
      <Route path="/police/clearance" element={<ProtectedRoute><RequestClearance /></ProtectedRoute>} />
      {/* Police — staff */}
      <Route path="/police/staff" element={<RoleRoute roles={['POLICE']}><PoliceStaffDashboard /></RoleRoute>} />
      <Route path="/police/manage" element={<RoleRoute roles={['POLICE']}><ManageCases /></RoleRoute>} />
      <Route path="/police/update/:id" element={<RoleRoute roles={['POLICE']}><CaseUpdate /></RoleRoute>} />

      {/* Finance — citizen */}
      <Route path="/finance/dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/finance/tax/register" element={<ProtectedRoute><TaxRegistration /></ProtectedRoute>} />
      <Route path="/finance/tax/profile" element={<ProtectedRoute><TaxProfile /></ProtectedRoute>} />
      <Route path="/finance/payment" element={<ProtectedRoute><MakePayment /></ProtectedRoute>} />
      <Route path="/finance/payment/success" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
      <Route path="/finance/tax/clearance" element={<ProtectedRoute><TaxClearanceCertificate /></ProtectedRoute>} />
      {/* Finance — staff */}
      <Route path="/finance/staff" element={<RoleRoute roles={['FINANCE']}><FinanceStaffDashboard /></RoleRoute>} />
      <Route path="/finance/processing" element={<RoleRoute roles={['FINANCE']}><ProcessTaxRegistration /></RoleRoute>} />

      {/* Pensions — citizen */}
      <Route path="/pensions/dashboard" element={<ProtectedRoute><PensionsDashboard /></ProtectedRoute>} />
      <Route path="/pensions/info" element={<ProtectedRoute><ViewPensionInfo /></ProtectedRoute>} />
      <Route path="/pensions/verify" element={<ProtectedRoute><ExistenceVerification /></ProtectedRoute>} />
      <Route path="/pensions/verify/success" element={<ProtectedRoute><PensionVerificationSuccess /></ProtectedRoute>} />
      <Route path="/pensions/history" element={<ProtectedRoute><VerificationHistory /></ProtectedRoute>} />
      {/* Pensions — staff */}
      <Route path="/pensions/staff" element={<RoleRoute roles={['PENSIONS']}><PensionsStaffDashboard /></RoleRoute>} />
      <Route path="/pensions/process" element={<RoleRoute roles={['PENSIONS']}><ProcessVerification /></RoleRoute>} />

      {/* Passport — citizen */}
      <Route path="/passport/dashboard" element={<ProtectedRoute><PassportDashboard /></ProtectedRoute>} />
      <Route path="/passport/apply" element={<ProtectedRoute><ApplyForPassport /></ProtectedRoute>} />
      <Route path="/passport/confirmation" element={<ProtectedRoute><PassportApplicationConfirmation /></ProtectedRoute>} />
      <Route path="/passport/status" element={<ProtectedRoute><PassportCheckStatus /></ProtectedRoute>} />
      {/* Passport — staff */}
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
      <Route path="/admin/settings/logo" element={<RoleRoute roles={['ADMIN']}><LogoUpload /></RoleRoute>} />
      <Route path="/admin/settings/biometrics" element={<RoleRoute roles={['ADMIN']}><BiometricConfig /></RoleRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;