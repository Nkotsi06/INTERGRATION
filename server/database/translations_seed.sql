-- ============================================================
-- Integrated Government Services System (Lesotho)
-- translations_seed.sql
-- ============================================================
-- This file completely replaces the contents of the
-- `translations` table with EN and ST dictionaries covering
-- every code-level label in the application.
--
-- Rules applied:
--   - Keys are dot-separated lowercase: <area>.<screen>.<element>
--   - Dynamic values use {curly} placeholders.
--   - Sesotho uses a single form for plural and singular.
--   - Ministry/status/document type names are NOT translated.
--   - Footer "Lesotho Government System" is NOT translated.
--   - Where no established Sesotho term exists, the English
--     word is used (e.g. Audit Logs, Dashboard, API, URL).
-- ============================================================

BEGIN;

DELETE FROM translations;

-- ============================================================
-- AUTH AREA
-- ============================================================

-- auth.welcome.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.welcome.title', 'Welcome to the Integrated Government Services System'),
('EN', 'auth.welcome.tagline', 'Access government services quickly and securely.'),
('EN', 'auth.welcome.login_button', 'Login'),
('EN', 'auth.welcome.register_button', 'Register'),

('ST', 'auth.welcome.title', 'Rea u amohela ho Sistimi e Kopanetsweng ya Ditshebeletso tsa Mmuso'),
('ST', 'auth.welcome.tagline', 'Fumana ditshebeletso tsa mmuso kapele le ka polokeho.'),
('ST', 'auth.welcome.login_button', 'Kena'),
('ST', 'auth.welcome.register_button', 'Ngolisa');

-- auth.register.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.register.title', 'Create an Account'),
('EN', 'auth.register.subtitle', 'Register to access government services.'),
('EN', 'auth.register.username', 'Username'),
('EN', 'auth.register.email', 'Email'),
('EN', 'auth.register.password', 'Password'),
('EN', 'auth.register.confirm_password', 'Confirm Password'),
('EN', 'auth.register.password_hint', 'At least 8 characters, including one number.'),
('EN', 'auth.register.submit', 'Register'),
('EN', 'auth.register.link_login', 'Already have an account? Login'),

('ST', 'auth.register.title', 'Theha Akhaonte'),
('ST', 'auth.register.subtitle', 'Ngolisa ho fumana ditshebeletso tsa mmuso.'),
('ST', 'auth.register.username', 'Lebitso la mosebedisi'),
('ST', 'auth.register.email', 'Imeile'),
('ST', 'auth.register.password', 'Phasewete'),
('ST', 'auth.register.confirm_password', 'Netefatsa phasewete'),
('ST', 'auth.register.password_hint', 'Bonyane ditlhaku tse 8, ho kenyeletswa nomoro e le nngwe.'),
('ST', 'auth.register.submit', 'Ngolisa'),
('ST', 'auth.register.link_login', 'O se o na le akhaonte? Kena');

-- auth.login.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.login.title', 'Login'),
('EN', 'auth.login.subtitle', 'Enter your credentials to continue.'),
('EN', 'auth.login.username', 'Username'),
('EN', 'auth.login.password', 'Password'),
('EN', 'auth.login.submit', 'Login'),
('EN', 'auth.login.forgot_link', 'Forgot password?'),
('EN', 'auth.login.register_link', 'Create an account'),
('EN', 'auth.login.staff_link', 'Staff login'),
('EN', 'auth.login.admin_link', 'Admin login'),

('ST', 'auth.login.title', 'Kena'),
('ST', 'auth.login.subtitle', 'Kenya lintlha tsa hao ho tswela pele.'),
('ST', 'auth.login.username', 'Lebitso la mosebedisi'),
('ST', 'auth.login.password', 'Phasewete'),
('ST', 'auth.login.submit', 'Kena'),
('ST', 'auth.login.forgot_link', 'O lebetse phasewete?'),
('ST', 'auth.login.register_link', 'Theha akhaonte'),
('ST', 'auth.login.staff_link', 'Kena ha basebetsi'),
('ST', 'auth.login.admin_link', 'Kena ha admin');

-- auth.staff_login.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.staff_login.title', 'Staff Login'),
('EN', 'auth.staff_login.subtitle', 'Sign in with your government staff account.'),
('EN', 'auth.staff_login.username', 'Username'),
('EN', 'auth.staff_login.password', 'Password'),
('EN', 'auth.staff_login.submit', 'Login'),
('EN', 'auth.staff_login.back_link', 'Back to citizen login'),

('ST', 'auth.staff_login.title', 'Kena ha Basebetsi'),
('ST', 'auth.staff_login.subtitle', 'Kena ka akhaonte ya hao ya mmuso.'),
('ST', 'auth.staff_login.username', 'Lebitso la mosebedisi'),
('ST', 'auth.staff_login.password', 'Phasewete'),
('ST', 'auth.staff_login.submit', 'Kena'),
('ST', 'auth.staff_login.back_link', 'Khutlela ho kena ha baahi');

-- auth.admin_login.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.admin_login.title', 'Administrator Login'),
('EN', 'auth.admin_login.subtitle', 'Sign in with your administrator account.'),
('EN', 'auth.admin_login.username', 'Username'),
('EN', 'auth.admin_login.password', 'Password'),
('EN', 'auth.admin_login.submit', 'Login'),
('EN', 'auth.admin_login.back_link', 'Back to staff login'),

('ST', 'auth.admin_login.title', 'Kena ha Molaodi'),
('ST', 'auth.admin_login.subtitle', 'Kena ka akhaonte ya hao ya molaodi.'),
('ST', 'auth.admin_login.username', 'Lebitso la mosebedisi'),
('ST', 'auth.admin_login.password', 'Phasewete'),
('ST', 'auth.admin_login.submit', 'Kena'),
('ST', 'auth.admin_login.back_link', 'Khutlela ho kena ha basebetsi');

-- auth.forgot_password.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.forgot_password.title', 'Reset Your Password'),
('EN', 'auth.forgot_password.subtitle', 'Enter your email address and we will send you reset instructions.'),
('EN', 'auth.forgot_password.email', 'Email'),
('EN', 'auth.forgot_password.submit', 'Submit'),
('EN', 'auth.forgot_password.back_link', 'Back to login'),

('ST', 'auth.forgot_password.title', 'Seta phasewete ya hao botjha'),
('ST', 'auth.forgot_password.subtitle', 'Kenya aterese ya hao ya imeile mme re tla romela ditaelo tsa ho e seta botjha.'),
('ST', 'auth.forgot_password.email', 'Imeile'),
('ST', 'auth.forgot_password.submit', 'Romela'),
('ST', 'auth.forgot_password.back_link', 'Khutlela ho kena');

-- auth.registration_received.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.registration_received.title', 'Registration Received'),
('EN', 'auth.registration_received.message', 'Your account has been created. You can now login.'),
('EN', 'auth.registration_received.login_button', 'Login'),
('EN', 'auth.registration_received.explainer_button', 'What happens next?'),
('EN', 'auth.registration_received.explainer_step_1', 'Login to your account.'),
('EN', 'auth.registration_received.explainer_step_2', 'Complete your identity verification at a Home Affairs office.'),
('EN', 'auth.registration_received.explainer_step_3', 'Access government services online.'),

('ST', 'auth.registration_received.title', 'Ngoliso e amohetsoe'),
('ST', 'auth.registration_received.message', 'Akhaonte ya hao e thehiloe. O ka kena hona jwale.'),
('ST', 'auth.registration_received.login_button', 'Kena'),
('ST', 'auth.registration_received.explainer_button', 'Ho tla etsahalang kamora moo?'),
('ST', 'auth.registration_received.explainer_step_1', 'Kena akhaonteng ya hao.'),
('ST', 'auth.registration_received.explainer_step_2', 'Phetha netefatso ya boitsebiso ofising ya tsa Lehae.'),
('ST', 'auth.registration_received.explainer_step_3', 'Fumana ditshebeletso tsa mmuso inthaneteng.');

-- auth.errors.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.errors.required', 'This field is required.'),
('EN', 'auth.errors.invalid_email', 'Please enter a valid email address.'),
('EN', 'auth.errors.password_short', 'Password must be at least 8 characters.'),
('EN', 'auth.errors.password_no_number', 'Password must contain at least one number.'),
('EN', 'auth.errors.password_mismatch', 'Passwords do not match.'),
('EN', 'auth.errors.username_taken', 'This username is already taken.'),
('EN', 'auth.errors.email_taken', 'This email is already registered.'),

('ST', 'auth.errors.required', 'Sebaka sena sea hlokahala.'),
('ST', 'auth.errors.invalid_email', 'Ka kopo kenya aterese ya imeile e nepahetseng.'),
('ST', 'auth.errors.password_short', 'Phasewete e lokela ho ba bonyane ditlhaku tse 8.'),
('ST', 'auth.errors.password_no_number', 'Phasewete e lokela ho ba le bonyane nomoro e le nngwe.'),
('ST', 'auth.errors.password_mismatch', 'Diphasewete ha di tshwane.'),
('ST', 'auth.errors.username_taken', 'Lebitso lena la mosebedisi le se le nkiloe.'),
('ST', 'auth.errors.email_taken', 'Imeile ena e se e ngolisitswe.');

-- ============================================================
-- NAVIGATION
-- ============================================================

-- nav.citizen.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.citizen.dashboard', 'Dashboard'),
('EN', 'nav.citizen.profile', 'Profile'),
('EN', 'nav.citizen.applications', 'Applications'),
('EN', 'nav.citizen.documents', 'Documents'),
('EN', 'nav.citizen.notifications', 'Notifications'),

('ST', 'nav.citizen.dashboard', 'Dashboard'),
('ST', 'nav.citizen.profile', 'Profaele'),
('ST', 'nav.citizen.applications', 'Dikopo'),
('ST', 'nav.citizen.documents', 'Ditokomane'),
('ST', 'nav.citizen.notifications', 'Litsebiso');

-- nav.admin.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.admin.dashboard', 'Dashboard'),
('EN', 'nav.admin.users', 'Users'),
('EN', 'nav.admin.audit_logs', 'Audit Logs'),
('EN', 'nav.admin.settings', 'Settings'),

('ST', 'nav.admin.dashboard', 'Dashboard'),
('ST', 'nav.admin.users', 'Basebedisi'),
('ST', 'nav.admin.audit_logs', 'Audit Logs'),
('ST', 'nav.admin.settings', 'Litlhophiso');

-- nav.home_affairs.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.home_affairs.dashboard', 'Dashboard'),
('EN', 'nav.home_affairs.registrations', 'Registrations'),
('EN', 'nav.home_affairs.search', 'Search'),
('EN', 'nav.home_affairs.reports', 'Reports'),

('ST', 'nav.home_affairs.dashboard', 'Dashboard'),
('ST', 'nav.home_affairs.registrations', 'Dingoliso'),
('ST', 'nav.home_affairs.search', 'Batla'),
('ST', 'nav.home_affairs.reports', 'Ditlaleho');

-- nav.traffic.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.traffic.dashboard', 'Dashboard'),
('EN', 'nav.traffic.processing', 'Processing'),

('ST', 'nav.traffic.dashboard', 'Dashboard'),
('ST', 'nav.traffic.processing', 'Tsamaiso');

-- nav.police.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.police.dashboard', 'Dashboard'),
('EN', 'nav.police.cases', 'Cases'),

('ST', 'nav.police.dashboard', 'Dashboard'),
('ST', 'nav.police.cases', 'Dinyewe');

-- nav.finance.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.finance.dashboard', 'Dashboard'),
('EN', 'nav.finance.processing', 'Processing'),

('ST', 'nav.finance.dashboard', 'Dashboard'),
('ST', 'nav.finance.processing', 'Tsamaiso');

-- nav.pensions.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.pensions.dashboard', 'Dashboard'),
('EN', 'nav.pensions.process', 'Process'),

('ST', 'nav.pensions.dashboard', 'Dashboard'),
('ST', 'nav.pensions.process', 'Sebetsa');

-- nav.passport.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.passport.dashboard', 'Dashboard'),
('EN', 'nav.passport.process', 'Process'),
('EN', 'nav.passport.history', 'History'),

('ST', 'nav.passport.dashboard', 'Dashboard'),
('ST', 'nav.passport.process', 'Sebetsa'),
('ST', 'nav.passport.history', 'Histori');

-- nav.sidebar_label.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.sidebar_label.citizen', 'Citizen'),
('EN', 'nav.sidebar_label.admin', 'Administrator'),
('EN', 'nav.sidebar_label.home_affairs', 'Home Affairs'),
('EN', 'nav.sidebar_label.traffic', 'Traffic'),
('EN', 'nav.sidebar_label.police', 'Police'),
('EN', 'nav.sidebar_label.finance', 'Finance'),
('EN', 'nav.sidebar_label.pensions', 'Pensions'),
('EN', 'nav.sidebar_label.passport', 'Passport'),

('ST', 'nav.sidebar_label.citizen', 'Moahi'),
('ST', 'nav.sidebar_label.admin', 'Molaodi'),
('ST', 'nav.sidebar_label.home_affairs', 'Tsa Lehae'),
('ST', 'nav.sidebar_label.traffic', 'Tsa Sephethephethe'),
('ST', 'nav.sidebar_label.police', 'Sepolesa'),
('ST', 'nav.sidebar_label.finance', 'Tsa Ditjhelete'),
('ST', 'nav.sidebar_label.pensions', 'Tsa Phenjhene'),
('ST', 'nav.sidebar_label.passport', 'Pasepoto');

-- ============================================================
-- COMMON LABELS
-- ============================================================

-- btn.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'btn.save', 'Save'),
('EN', 'btn.cancel', 'Cancel'),
('EN', 'btn.delete', 'Delete'),
('EN', 'btn.edit', 'Edit'),
('EN', 'btn.add', 'Add'),
('EN', 'btn.update', 'Update'),
('EN', 'btn.view', 'View'),
('EN', 'btn.print', 'Print'),
('EN', 'btn.download', 'Download'),
('EN', 'btn.upload', 'Upload'),
('EN', 'btn.submit', 'Submit'),
('EN', 'btn.close', 'Close'),
('EN', 'btn.back', 'Back'),
('EN', 'btn.next', 'Next'),
('EN', 'btn.continue', 'Continue'),
('EN', 'btn.confirm', 'Confirm'),
('EN', 'btn.yes', 'Yes'),
('EN', 'btn.no', 'No'),
('EN', 'btn.search', 'Search'),
('EN', 'btn.filter', 'Filter'),
('EN', 'btn.clear_filters', 'Clear Filters'),
('EN', 'btn.logout', 'Logout'),
('EN', 'btn.login', 'Login'),
('EN', 'btn.register', 'Register'),

('ST', 'btn.save', 'Boloka'),
('ST', 'btn.cancel', 'Hlakola'),
('ST', 'btn.delete', 'Hlakola'),
('ST', 'btn.edit', 'Fetola'),
('ST', 'btn.add', 'Kenya'),
('ST', 'btn.update', 'Ntjhafatsa'),
('ST', 'btn.view', 'Sheba'),
('ST', 'btn.print', 'Hatisa'),
('ST', 'btn.download', 'Khoasolla'),
('ST', 'btn.upload', 'Kenya'),
('ST', 'btn.submit', 'Romela'),
('ST', 'btn.close', 'Kwala'),
('ST', 'btn.back', 'Khutlela'),
('ST', 'btn.next', 'E latelang'),
('ST', 'btn.continue', 'Tsoela pele'),
('ST', 'btn.confirm', 'Tiisa'),
('ST', 'btn.yes', 'E'),
('ST', 'btn.no', 'Che'),
('ST', 'btn.search', 'Batla'),
('ST', 'btn.filter', 'Sefa'),
('ST', 'btn.clear_filters', 'Hlakola dikgetho'),
('ST', 'btn.logout', 'Tsoa'),
('ST', 'btn.login', 'Kena'),
('ST', 'btn.register', 'Ngolisa');

-- common.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'common.loading', 'Loading'),
('EN', 'common.no_results', 'No results found.'),
('EN', 'common.all', 'All'),
('EN', 'common.none', 'None'),
('EN', 'common.other', 'Other'),
('EN', 'common.select', 'Select'),
('EN', 'common.choose', 'Choose'),
('EN', 'common.actions', 'Actions'),
('EN', 'common.status', 'Status'),
('EN', 'common.date', 'Date'),
('EN', 'common.time', 'Time'),
('EN', 'common.name', 'Name'),
('EN', 'common.email', 'Email'),
('EN', 'common.phone', 'Phone'),
('EN', 'common.address', 'Address'),
('EN', 'common.role', 'Role'),
('EN', 'common.ministry', 'Ministry'),
('EN', 'common.created_at', 'Created At'),
('EN', 'common.updated_at', 'Updated At'),
('EN', 'common.notes', 'Notes'),
('EN', 'common.reason', 'Reason'),
('EN', 'common.confirm_action', 'Confirm Action'),
('EN', 'common.are_you_sure', 'Are you sure?'),
('EN', 'common.please_wait', 'Please wait'),

('ST', 'common.loading', 'E ntse e kenya'),
('ST', 'common.no_results', 'Ha ho diphetho tse fumanweng.'),
('ST', 'common.all', 'Tsohle'),
('ST', 'common.none', 'Ha ho letho'),
('ST', 'common.other', 'Tse ding'),
('ST', 'common.select', 'Kgetha'),
('ST', 'common.choose', 'Kgetha'),
('ST', 'common.actions', 'Diketso'),
('ST', 'common.status', 'Boemo'),
('ST', 'common.date', 'Letsatsi'),
('ST', 'common.time', 'Nako'),
('ST', 'common.name', 'Lebitso'),
('ST', 'common.email', 'Imeile'),
('ST', 'common.phone', 'Mohala'),
('ST', 'common.address', 'Aterese'),
('ST', 'common.role', 'Karolo'),
('ST', 'common.ministry', 'Lefapha'),
('ST', 'common.created_at', 'E thehiloe ka'),
('ST', 'common.updated_at', 'E ntjhafaditsweng ka'),
('ST', 'common.notes', 'Dintlha'),
('ST', 'common.reason', 'Lebaka'),
('ST', 'common.confirm_action', 'Tiisa ketso'),
('ST', 'common.are_you_sure', 'Na o na le bonnete?'),
('ST', 'common.please_wait', 'Emela hanyane');

-- err.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'err.generic', 'Something went wrong. Please try again.'),
('EN', 'err.not_found', 'The requested item was not found.'),
('EN', 'err.unauthorized', 'You are not authorised to perform this action.'),
('EN', 'err.forbidden', 'Access denied.'),
('EN', 'err.network', 'Network error. Please check your connection.'),
('EN', 'err.timeout', 'The request timed out. Please try again.'),
('EN', 'err.invalid_credentials', 'Invalid username or password.'),

('ST', 'err.generic', 'Ho na le ho phoso. Ka kopo leka hape.'),
('ST', 'err.not_found', 'Ntho e kopilweng ha ea fumanoa.'),
('ST', 'err.unauthorized', 'Ha o a dumellwa ho etsa ketso ena.'),
('ST', 'err.forbidden', 'Ho kena ho hanetswe.'),
('ST', 'err.network', 'Phoso ya netweke. Ka kopo hlahloba kgokelo ya hao.'),
('ST', 'err.timeout', 'Kopo e fetile nako. Ka kopo leka hape.'),
('ST', 'err.invalid_credentials', 'Lebitso la mosebedisi kapa phasewete ha e nepahetse.');

-- alert.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'alert.success', 'Success'),
('EN', 'alert.warning', 'Warning'),
('EN', 'alert.error', 'Error'),
('EN', 'alert.info', 'Information'),

('ST', 'alert.success', 'Katleho'),
('ST', 'alert.warning', 'Temoso'),
('ST', 'alert.error', 'Phoso'),
('ST', 'alert.info', 'Tlhahisoleseding');

-- status.* (shared status labels)
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'status.approved', 'Approved'),
('EN', 'status.rejected', 'Rejected'),
('EN', 'status.pending', 'Pending'),
('EN', 'status.in_review', 'Under Review'),
('EN', 'status.completed', 'Completed'),
('EN', 'status.submitted', 'Submitted'),
('EN', 'status.failed', 'Failed'),
('EN', 'status.draft', 'Draft'),
('EN', 'status.awaiting', 'Awaiting'),
('EN', 'status.captured', 'Captured'),
('EN', 'status.verified', 'Verified'),

('ST', 'status.approved', 'E amohetsoe'),
('ST', 'status.rejected', 'E lahliloe'),
('ST', 'status.pending', 'E emetse'),
('ST', 'status.in_review', 'E hlahlobjoa'),
('ST', 'status.completed', 'E phethiloe'),
('ST', 'status.submitted', 'E rometsoe'),
('ST', 'status.failed', 'E hlotsoe'),
('ST', 'status.draft', 'Morero'),
('ST', 'status.awaiting', 'E emetse'),
('ST', 'status.captured', 'E nkiloe'),
('ST', 'status.verified', 'E netefaditswe');

-- ============================================================
-- CITIZEN AREA
-- ============================================================

-- citizen.dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.dashboard.title', 'Citizen Dashboard'),
('EN', 'citizen.dashboard.welcome', 'Welcome, {name}'),
('EN', 'citizen.dashboard.identity_verified', 'Your identity has been verified.'),
('EN', 'citizen.dashboard.verified_by', 'Verified by {ministry}'),
('EN', 'citizen.dashboard.verify_now', 'Verify Now'),
('EN', 'citizen.dashboard.waiting_for_home_affairs', 'Waiting for Home Affairs'),
('EN', 'citizen.dashboard.waiting_subtitle', 'Your identity verification is pending.'),
('EN', 'citizen.dashboard.services_title', 'Available Services'),
('EN', 'citizen.dashboard.applications_title', 'My Applications'),
('EN', 'citizen.dashboard.view_applications', 'View Applications'),

('ST', 'citizen.dashboard.title', 'Dashboard ya Moahi'),
('ST', 'citizen.dashboard.welcome', 'Rea u amohela, {name}'),
('ST', 'citizen.dashboard.identity_verified', 'Boitsebiso ba hao bo netefaditswe.'),
('ST', 'citizen.dashboard.verified_by', 'E netefaditswe ke {ministry}'),
('ST', 'citizen.dashboard.verify_now', 'Netefatsa hona jwale'),
('ST', 'citizen.dashboard.waiting_for_home_affairs', 'E emetse tsa Lehae'),
('ST', 'citizen.dashboard.waiting_subtitle', 'Netefatso ya boitsebiso ba hao e emetse.'),
('ST', 'citizen.dashboard.services_title', 'Ditshebeletso tse fumanehang'),
('ST', 'citizen.dashboard.applications_title', 'Dikopo tsa ka'),
('ST', 'citizen.dashboard.view_applications', 'Sheba dikopo');

-- citizen.profile.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.profile.title', 'My Profile'),
('EN', 'citizen.profile.subtitle', 'Your personal information on file.'),
('EN', 'citizen.profile.personal_info', 'Personal Information'),
('EN', 'citizen.profile.contact_info', 'Contact Information'),
('EN', 'citizen.profile.last_updated', 'Last updated {date}'),
('EN', 'citizen.profile.change_password', 'Change Password'),
('EN', 'citizen.profile.visit_home_affairs', 'Visit a Home Affairs office to update your record.'),

('ST', 'citizen.profile.title', 'Profaele ya ka'),
('ST', 'citizen.profile.subtitle', 'Boitsebiso ba hao ba botho bo bolokilweng.'),
('ST', 'citizen.profile.personal_info', 'Boitsebiso ba botho'),
('ST', 'citizen.profile.contact_info', 'Boitsebiso ba ho ikopanya'),
('ST', 'citizen.profile.last_updated', 'E ntjhafaditsweng la {date}'),
('ST', 'citizen.profile.change_password', 'Fetola phasewete'),
('ST', 'citizen.profile.visit_home_affairs', 'Etela ofisi ya tsa Lehae ho ntjhafatsa rekoto ya hao.');

-- citizen.verify.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.verify.title', 'Identity Verification'),
('EN', 'citizen.verify.explanation', 'Enter your password to begin verification.'),
('EN', 'citizen.verify.password_label', 'Password'),
('EN', 'citizen.verify.continue', 'Continue'),
('EN', 'citizen.verify.success_title', 'Verification Successful'),
('EN', 'citizen.verify.success_message', 'Your identity has been verified.'),
('EN', 'citizen.verify.access_service', 'Access Service'),
('EN', 'citizen.verify.pending_title', 'Verification Pending'),
('EN', 'citizen.verify.pending_message', 'Your verification is being processed.'),
('EN', 'citizen.verify.back_to_dashboard', 'Back to Dashboard'),
('EN', 'citizen.verify.find_office', 'Find an Office'),
('EN', 'citizen.verify.failure_title', 'Verification Failed'),
('EN', 'citizen.verify.failure_wrong_password', 'The password you entered is incorrect.'),
('EN', 'citizen.verify.failure_message', 'We could not verify your identity.'),
('EN', 'citizen.verify.try_again', 'Try Again'),

('ST', 'citizen.verify.title', 'Netefatso ya boitsebiso'),
('ST', 'citizen.verify.explanation', 'Kenya phasewete ya hao ho qala netefatso.'),
('ST', 'citizen.verify.password_label', 'Phasewete'),
('ST', 'citizen.verify.continue', 'Tsoela pele'),
('ST', 'citizen.verify.success_title', 'Netefatso e atlehile'),
('ST', 'citizen.verify.success_message', 'Boitsebiso ba hao bo netefaditswe.'),
('ST', 'citizen.verify.access_service', 'Fumana tshebeletso'),
('ST', 'citizen.verify.pending_title', 'Netefatso e emetse'),
('ST', 'citizen.verify.pending_message', 'Netefatso ya hao e ntse e sebetswa.'),
('ST', 'citizen.verify.back_to_dashboard', 'Khutlela ho Dashboard'),
('ST', 'citizen.verify.find_office', 'Fumana ofisi'),
('ST', 'citizen.verify.failure_title', 'Netefatso e hlotsoe'),
('ST', 'citizen.verify.failure_wrong_password', 'Phasewete eo o e kentseng ha e nepahetse.'),
('ST', 'citizen.verify.failure_message', 'Ha re a ka ra netefatsa boitsebiso ba hao.'),
('ST', 'citizen.verify.try_again', 'Leka hape');

-- citizen.change_password.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.change_password.title', 'Change Password'),
('EN', 'citizen.change_password.subtitle', 'Enter your current password and choose a new one.'),
('EN', 'citizen.change_password.current_password', 'Current Password'),
('EN', 'citizen.change_password.new_password', 'New Password'),
('EN', 'citizen.change_password.confirm_password', 'Confirm New Password'),
('EN', 'citizen.change_password.save_password', 'Save Password'),
('EN', 'citizen.change_password.password_hint', 'At least 8 characters, including one number.'),

('ST', 'citizen.change_password.title', 'Fetola phasewete'),
('ST', 'citizen.change_password.subtitle', 'Kenya phasewete ya hao ya hajoale mme o kgetha e ntjha.'),
('ST', 'citizen.change_password.current_password', 'Phasewete ya hajoale'),
('ST', 'citizen.change_password.new_password', 'Phasewete e ntjha'),
('ST', 'citizen.change_password.confirm_password', 'Netefatsa phasewete e ntjha'),
('ST', 'citizen.change_password.save_password', 'Boloka phasewete'),
('ST', 'citizen.change_password.password_hint', 'Bonyane ditlhaku tse 8, ho kenyeletswa nomoro e le nngwe.');

-- citizen.applications.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.applications.title', 'My Applications'),
('EN', 'citizen.applications.reference', 'Reference'),
('EN', 'citizen.applications.service', 'Service'),
('EN', 'citizen.applications.date_submitted', 'Date Submitted'),
('EN', 'citizen.applications.status', 'Status'),
('EN', 'citizen.applications.no_results', 'You have no applications yet.'),

('ST', 'citizen.applications.title', 'Dikopo tsa ka'),
('ST', 'citizen.applications.reference', 'Referense'),
('ST', 'citizen.applications.service', 'Tshebeletso'),
('ST', 'citizen.applications.date_submitted', 'Letsatsi le rometsweng'),
('ST', 'citizen.applications.status', 'Boemo'),
('ST', 'citizen.applications.no_results', 'Ha o so be le dikopo.');

-- citizen.documents.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.documents.title', 'My Documents'),
('EN', 'citizen.documents.no_documents', 'You have no documents on file.'),
('EN', 'citizen.documents.upload_button', 'Upload Document'),
('EN', 'citizen.documents.delete_confirm', 'Are you sure you want to delete this document?'),

('ST', 'citizen.documents.title', 'Ditokomane tsa ka'),
('ST', 'citizen.documents.no_documents', 'Ha o na ditokomane tse bolokilweng.'),
('ST', 'citizen.documents.upload_button', 'Kenya tokomane'),
('ST', 'citizen.documents.delete_confirm', 'Na o na le bonnete ba hore o batla ho hlakola tokomane ena?');

-- citizen.notifications.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.notifications.title', 'Notifications'),
('EN', 'citizen.notifications.no_notifications', 'You have no notifications.'),
('EN', 'citizen.notifications.delete_confirm', 'Are you sure you want to delete this notification?'),

('ST', 'citizen.notifications.title', 'Litsebiso'),
('ST', 'citizen.notifications.no_notifications', 'Ha o na litsebiso.'),
('ST', 'citizen.notifications.delete_confirm', 'Na o na le bonnete ba hore o batla ho hlakola tsebiso ena?');

-- ============================================================
-- HOME AFFAIRS AREA
-- ============================================================

-- home_affairs.dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'home_affairs.dashboard.title', 'Home Affairs Dashboard'),
('EN', 'home_affairs.dashboard.new_registrations', 'New Registrations'),
('EN', 'home_affairs.dashboard.details_captured', 'Details Captured'),
('EN', 'home_affairs.dashboard.verified_citizens', 'Verified Citizens'),
('EN', 'home_affairs.dashboard.updated_today', 'Updated Today'),
('EN', 'home_affairs.dashboard.review_button', 'Review'),
('EN', 'home_affairs.dashboard.search_button', 'Search Citizens'),

('ST', 'home_affairs.dashboard.title', 'Dashboard ya tsa Lehae'),
('ST', 'home_affairs.dashboard.new_registrations', 'Dingoliso tse ntjha'),
('ST', 'home_affairs.dashboard.details_captured', 'Dintlha tse nkilweng'),
('ST', 'home_affairs.dashboard.verified_citizens', 'Baahi ba netefaditsweng'),
('ST', 'home_affairs.dashboard.updated_today', 'E ntjhafaditsweng kajeno'),
('ST', 'home_affairs.dashboard.review_button', 'Hlahloba'),
('ST', 'home_affairs.dashboard.search_button', 'Batla baahi');

-- home_affairs.registrations.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'home_affairs.registrations.title', 'New Registrations'),
('EN', 'home_affairs.registrations.subtitle', 'Citizens awaiting record completion.'),
('EN', 'home_affairs.registrations.filter_status', 'Status'),
('EN', 'home_affairs.registrations.filter_date', 'Date'),
('EN', 'home_affairs.registrations.filter_search', 'Search'),
('EN', 'home_affairs.registrations.clear_filters', 'Clear Filters'),
('EN', 'home_affairs.registrations.table_username', 'Username'),
('EN', 'home_affairs.registrations.table_date', 'Date Registered'),
('EN', 'home_affairs.registrations.table_status', 'Status'),
('EN', 'home_affairs.registrations.table_national_id', 'National ID'),
('EN', 'home_affairs.registrations.table_actions', 'Actions'),
('EN', 'home_affairs.registrations.open_button', 'Open'),
('EN', 'home_affairs.registrations.no_results', 'No registrations found.'),

('ST', 'home_affairs.registrations.title', 'Dingoliso tse ntjha'),
('ST', 'home_affairs.registrations.subtitle', 'Baahi ba emetseng ho phethwa ha rekoto.'),
('ST', 'home_affairs.registrations.filter_status', 'Boemo'),
('ST', 'home_affairs.registrations.filter_date', 'Letsatsi'),
('ST', 'home_affairs.registrations.filter_search', 'Batla'),
('ST', 'home_affairs.registrations.clear_filters', 'Hlakola dikgetho'),
('ST', 'home_affairs.registrations.table_username', 'Lebitso la mosebedisi'),
('ST', 'home_affairs.registrations.table_date', 'Letsatsi la ngoliso'),
('ST', 'home_affairs.registrations.table_status', 'Boemo'),
('ST', 'home_affairs.registrations.table_national_id', 'Nomoro ya boitsebiso'),
('ST', 'home_affairs.registrations.table_actions', 'Diketso'),
('ST', 'home_affairs.registrations.open_button', 'Bula'),
('ST', 'home_affairs.registrations.no_results', 'Ha ho dingoliso tse fumanweng.');

-- home_affairs.complete_record.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'home_affairs.complete_record.title', 'Complete Citizen Record'),
('EN', 'home_affairs.complete_record.username', 'Username'),
('EN', 'home_affairs.complete_record.date_registered', 'Date Registered'),
('EN', 'home_affairs.complete_record.national_id_label', 'National ID'),
('EN', 'home_affairs.complete_record.national_id_auto', 'Generated automatically on save.'),
('EN', 'home_affairs.complete_record.section_personal', 'Personal Details'),
('EN', 'home_affairs.complete_record.section_contact', 'Contact Details'),
('EN', 'home_affairs.complete_record.section_documents', 'Documents'),
('EN', 'home_affairs.complete_record.section_biometrics', 'Biometrics'),
('EN', 'home_affairs.complete_record.full_name', 'Full Name'),
('EN', 'home_affairs.complete_record.date_of_birth', 'Date of Birth'),
('EN', 'home_affairs.complete_record.gender', 'Gender'),
('EN', 'home_affairs.complete_record.place_of_birth', 'Place of Birth'),
('EN', 'home_affairs.complete_record.nationality', 'Nationality'),
('EN', 'home_affairs.complete_record.phone', 'Phone'),
('EN', 'home_affairs.complete_record.email', 'Email'),
('EN', 'home_affairs.complete_record.village', 'Village'),
('EN', 'home_affairs.complete_record.district', 'District'),
('EN', 'home_affairs.complete_record.postal_address', 'Postal Address'),
('EN', 'home_affairs.complete_record.upload_national_id', 'Upload National ID'),
('EN', 'home_affairs.complete_record.upload_birth_certificate', 'Upload Birth Certificate'),
('EN', 'home_affairs.complete_record.upload_photo', 'Upload Photo'),
('EN', 'home_affairs.complete_record.biometric_instruction', 'Capture fingerprints and facial image.'),
('EN', 'home_affairs.complete_record.save_record', 'Save Record'),
('EN', 'home_affairs.complete_record.cancel', 'Cancel'),
('EN', 'home_affairs.complete_record.ready_to_save', 'Ready to save'),
('EN', 'home_affairs.complete_record.prints_captured', 'Fingerprints captured'),
('EN', 'home_affairs.complete_record.capture_required', 'Capture required'),

('ST', 'home_affairs.complete_record.title', 'Phetha rekoto ya moahi'),
('ST', 'home_affairs.complete_record.username', 'Lebitso la mosebedisi'),
('ST', 'home_affairs.complete_record.date_registered', 'Letsatsi la ngoliso'),
('ST', 'home_affairs.complete_record.national_id_label', 'Nomoro ya boitsebiso'),
('ST', 'home_affairs.complete_record.national_id_auto', 'E hlahiswa ka bo eona ha e bolokwa.'),
('ST', 'home_affairs.complete_record.section_personal', 'Dintlha tsa botho'),
('ST', 'home_affairs.complete_record.section_contact', 'Dintlha tsa ho ikopanya'),
('ST', 'home_affairs.complete_record.section_documents', 'Ditokomane'),
('ST', 'home_affairs.complete_record.section_biometrics', 'Biometrics'),
('ST', 'home_affairs.complete_record.full_name', 'Lebitso le felletseng'),
('ST', 'home_affairs.complete_record.date_of_birth', 'Letsatsi la tsoalo'),
('ST', 'home_affairs.complete_record.gender', 'Bong'),
('ST', 'home_affairs.complete_record.place_of_birth', 'Sebaka sa tsoalo'),
('ST', 'home_affairs.complete_record.nationality', 'Boichabelo'),
('ST', 'home_affairs.complete_record.phone', 'Mohala'),
('ST', 'home_affairs.complete_record.email', 'Imeile'),
('ST', 'home_affairs.complete_record.village', 'Motse'),
('ST', 'home_affairs.complete_record.district', 'Setereke'),
('ST', 'home_affairs.complete_record.postal_address', 'Aterese ya poso'),
('ST', 'home_affairs.complete_record.upload_national_id', 'Kenya nomoro ya boitsebiso'),
('ST', 'home_affairs.complete_record.upload_birth_certificate', 'Kenya setifikeiti sa tsoalo'),
('ST', 'home_affairs.complete_record.upload_photo', 'Kenya senepe'),
('ST', 'home_affairs.complete_record.biometric_instruction', 'Nka dikgati le setshwantsho sa sefahleho.'),
('ST', 'home_affairs.complete_record.save_record', 'Boloka rekoto'),
('ST', 'home_affairs.complete_record.cancel', 'Hlakola'),
('ST', 'home_affairs.complete_record.ready_to_save', 'E loketse ho bolokwa'),
('ST', 'home_affairs.complete_record.prints_captured', 'Dikgati di nkiloe'),
('ST', 'home_affairs.complete_record.capture_required', 'Ho hlokahala ho nka');

-- home_affairs.record_saved.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'home_affairs.record_saved.title', 'Record Saved'),
('EN', 'home_affairs.record_saved.message', 'The citizen record has been saved successfully.'),
('EN', 'home_affairs.record_saved.national_id_label', 'National ID'),
('EN', 'home_affairs.record_saved.print_slip', 'Print Slip'),
('EN', 'home_affairs.record_saved.continue_to_verification', 'Continue to Verification'),
('EN', 'home_affairs.record_saved.back_to_registrations', 'Back to Registrations'),

('ST', 'home_affairs.record_saved.title', 'Rekoto e bolokilwe'),
('ST', 'home_affairs.record_saved.message', 'Rekoto ya moahi e bolokilwe ka katleho.'),
('ST', 'home_affairs.record_saved.national_id_label', 'Nomoro ya boitsebiso'),
('ST', 'home_affairs.record_saved.print_slip', 'Hatisa setlankana'),
('ST', 'home_affairs.record_saved.continue_to_verification', 'Tsoela pele ho netefatso'),
('ST', 'home_affairs.record_saved.back_to_registrations', 'Khutlela ho dingoliso');

-- home_affairs.verify.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'home_affairs.verify.title', 'Verify Citizen'),
('EN', 'home_affairs.verify.checklist_id', 'National ID document checked'),
('EN', 'home_affairs.verify.checklist_birth', 'Birth certificate checked'),
('EN', 'home_affairs.verify.checklist_address', 'Proof of address checked'),
('EN', 'home_affairs.verify.checklist_photo', 'Photo matches citizen'),
('EN', 'home_affairs.verify.confirm_verification', 'Confirm Verification'),
('EN', 'home_affairs.verify.notes_label', 'Notes'),
('EN', 'home_affairs.verify.verified_by_message', 'Verified by {name} on {date}'),

('ST', 'home_affairs.verify.title', 'Netefatsa moahi'),
('ST', 'home_affairs.verify.checklist_id', 'Tokomane ya nomoro ya boitsebiso e hlahlobilwe'),
('ST', 'home_affairs.verify.checklist_birth', 'Setifikeiti sa tsoalo se hlahlobilwe'),
('ST', 'home_affairs.verify.checklist_address', 'Bopaki ba aterese bo hlahlobilwe'),
('ST', 'home_affairs.verify.checklist_photo', 'Senepe se tshwana le moahi'),
('ST', 'home_affairs.verify.confirm_verification', 'Tiisa netefatso'),
('ST', 'home_affairs.verify.notes_label', 'Dintlha'),
('ST', 'home_affairs.verify.verified_by_message', 'E netefaditswe ke {name} ka {date}');

-- home_affairs.search.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'home_affairs.search.title', 'Search Citizens'),
('EN', 'home_affairs.search.search_label', 'Search by name or National ID'),
('EN', 'home_affairs.search.search_hint', 'Enter at least three characters.'),
('EN', 'home_affairs.search.search_button', 'Search'),
('EN', 'home_affairs.search.citizen_found', 'Citizen found'),
('EN', 'home_affairs.search.view_profile', 'View Profile'),
('EN', 'home_affairs.search.no_citizen', 'No citizen found matching your search.'),

('ST', 'home_affairs.search.title', 'Batla baahi'),
('ST', 'home_affairs.search.search_label', 'Batla ka lebitso kapa nomoro ya boitsebiso'),
('ST', 'home_affairs.search.search_hint', 'Kenya bonyane ditlhaku tse tharo.'),
('ST', 'home_affairs.search.search_button', 'Batla'),
('ST', 'home_affairs.search.citizen_found', 'Moahi o fumanoe'),
('ST', 'home_affairs.search.view_profile', 'Sheba profaele'),
('ST', 'home_affairs.search.no_citizen', 'Ha ho moahi ya fumanweng ho latela patlisiso ya hao.');

-- home_affairs.reports.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'home_affairs.reports.title', 'Reports'),
('EN', 'home_affairs.reports.subtitle', 'Generate and export registration reports.'),
('EN', 'home_affairs.reports.report_type', 'Report Type'),
('EN', 'home_affairs.reports.date_range', 'Date Range'),
('EN', 'home_affairs.reports.generate_preview', 'Generate Preview'),
('EN', 'home_affairs.reports.clear_filters', 'Clear Filters'),
('EN', 'home_affairs.reports.citizens_registered', 'Citizens Registered'),
('EN', 'home_affairs.reports.citizens_verified', 'Citizens Verified'),
('EN', 'home_affairs.reports.pending', 'Pending'),
('EN', 'home_affairs.reports.export_button', 'Export'),
('EN', 'home_affairs.reports.print_button', 'Print'),

('ST', 'home_affairs.reports.title', 'Ditlaleho'),
('ST', 'home_affairs.reports.subtitle', 'Hlahisa le ho romela ditlaleho tsa ngoliso.'),
('ST', 'home_affairs.reports.report_type', 'Mofuta wa tlaleho'),
('ST', 'home_affairs.reports.date_range', 'Nako ya matsatsi'),
('ST', 'home_affairs.reports.generate_preview', 'Hlahisa ponelopele'),
('ST', 'home_affairs.reports.clear_filters', 'Hlakola dikgetho'),
('ST', 'home_affairs.reports.citizens_registered', 'Baahi ba ngolisitsweng'),
('ST', 'home_affairs.reports.citizens_verified', 'Baahi ba netefaditsweng'),
('ST', 'home_affairs.reports.pending', 'E emetse'),
('ST', 'home_affairs.reports.export_button', 'Romela'),
('ST', 'home_affairs.reports.print_button', 'Hatisa');

-- ============================================================
-- TRAFFIC AREA
-- ============================================================

-- traffic.dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.dashboard.title', 'Traffic Services'),
('EN', 'traffic.dashboard.subtitle', 'Manage your licence and appointments.'),
('EN', 'traffic.dashboard.view_licence', 'View Licence'),
('EN', 'traffic.dashboard.renew_licence', 'Renew Licence'),
('EN', 'traffic.dashboard.book_test', 'Book Test'),
('EN', 'traffic.dashboard.my_appointments', 'My Appointments'),

('ST', 'traffic.dashboard.title', 'Ditshebeletso tsa Sephethephethe'),
('ST', 'traffic.dashboard.subtitle', 'Laola laesense ya hao le dikopano.'),
('ST', 'traffic.dashboard.view_licence', 'Sheba laesense'),
('ST', 'traffic.dashboard.renew_licence', 'Ntjhafatsa laesense'),
('ST', 'traffic.dashboard.book_test', 'Beha tlhahlobo'),
('ST', 'traffic.dashboard.my_appointments', 'Dikopano tsa ka');

-- traffic.licence.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.licence.title', 'Driving Licence'),
('EN', 'traffic.licence.licence_number', 'Licence Number'),
('EN', 'traffic.licence.full_name', 'Full Name'),
('EN', 'traffic.licence.licence_type', 'Licence Type'),
('EN', 'traffic.licence.issue_date', 'Issue Date'),
('EN', 'traffic.licence.expiry_date', 'Expiry Date'),
('EN', 'traffic.licence.status_valid', 'Valid'),
('EN', 'traffic.licence.status_expired', 'Expired'),
('EN', 'traffic.licence.renew_button', 'Renew'),
('EN', 'traffic.licence.back_button', 'Back'),

('ST', 'traffic.licence.title', 'Laesense ya ho kgweetsa'),
('ST', 'traffic.licence.licence_number', 'Nomoro ya laesense'),
('ST', 'traffic.licence.full_name', 'Lebitso le felletseng'),
('ST', 'traffic.licence.licence_type', 'Mofuta wa laesense'),
('ST', 'traffic.licence.issue_date', 'Letsatsi la ho ntshwa'),
('ST', 'traffic.licence.expiry_date', 'Letsatsi la ho fela'),
('ST', 'traffic.licence.status_valid', 'E sebetsa'),
('ST', 'traffic.licence.status_expired', 'E fedile'),
('ST', 'traffic.licence.renew_button', 'Ntjhafatsa'),
('ST', 'traffic.licence.back_button', 'Khutlela');

-- traffic.renew.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.renew.title', 'Renew Licence'),
('EN', 'traffic.renew.step_review', 'Review'),
('EN', 'traffic.renew.step_payment', 'Payment'),
('EN', 'traffic.renew.step_confirmation', 'Confirmation'),
('EN', 'traffic.renew.review_title', 'Review Your Details'),
('EN', 'traffic.renew.review_subtitle', 'Confirm your information before payment.'),
('EN', 'traffic.renew.continue_payment', 'Continue to Payment'),
('EN', 'traffic.renew.payment_title', 'Payment'),
('EN', 'traffic.renew.mobile_number', 'Mobile Number'),
('EN', 'traffic.renew.pay_button', 'Pay'),
('EN', 'traffic.renew.confirmation_title', 'Payment Confirmed'),
('EN', 'traffic.renew.reference_number', 'Reference Number'),
('EN', 'traffic.renew.download_receipt', 'Download Receipt'),
('EN', 'traffic.renew.view_licence', 'View Licence'),

('ST', 'traffic.renew.title', 'Ntjhafatsa laesense'),
('ST', 'traffic.renew.step_review', 'Hlahloba'),
('ST', 'traffic.renew.step_payment', 'Tefo'),
('ST', 'traffic.renew.step_confirmation', 'Netefatso'),
('ST', 'traffic.renew.review_title', 'Hlahloba dintlha tsa hao'),
('ST', 'traffic.renew.review_subtitle', 'Netefatsa boitsebiso ba hao pele ho tefo.'),
('ST', 'traffic.renew.continue_payment', 'Tsoela pele ho tefo'),
('ST', 'traffic.renew.payment_title', 'Tefo'),
('ST', 'traffic.renew.mobile_number', 'Nomoro ya mohala'),
('ST', 'traffic.renew.pay_button', 'Lefa'),
('ST', 'traffic.renew.confirmation_title', 'Tefo e netefaditswe'),
('ST', 'traffic.renew.reference_number', 'Nomoro ya referense'),
('ST', 'traffic.renew.download_receipt', 'Khoasolla risiti'),
('ST', 'traffic.renew.view_licence', 'Sheba laesense');

-- traffic.book_test.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.book_test.title', 'Book a Test'),
('EN', 'traffic.book_test.test_type', 'Test Type'),
('EN', 'traffic.book_test.test_type_learner', 'Learner'),
('EN', 'traffic.book_test.test_type_driver', 'Driver'),
('EN', 'traffic.book_test.date', 'Date'),
('EN', 'traffic.book_test.time_slot', 'Time Slot'),
('EN', 'traffic.book_test.location', 'Location'),
('EN', 'traffic.book_test.book_button', 'Book'),
('EN', 'traffic.book_test.cancel_button', 'Cancel'),

('ST', 'traffic.book_test.title', 'Beha tlhahlobo'),
('ST', 'traffic.book_test.test_type', 'Mofuta wa tlhahlobo'),
('ST', 'traffic.book_test.test_type_learner', 'Moithuti'),
('ST', 'traffic.book_test.test_type_driver', 'Mokgweetsi'),
('ST', 'traffic.book_test.date', 'Letsatsi'),
('ST', 'traffic.book_test.time_slot', 'Nako'),
('ST', 'traffic.book_test.location', 'Sebaka'),
('ST', 'traffic.book_test.book_button', 'Beha'),
('ST', 'traffic.book_test.cancel_button', 'Hlakola');

-- traffic.appointments.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.appointments.title', 'My Appointments'),
('EN', 'traffic.appointments.filter_status', 'Status'),
('EN', 'traffic.appointments.filter_date', 'Date'),
('EN', 'traffic.appointments.clear_filters', 'Clear Filters'),
('EN', 'traffic.appointments.table_date', 'Date'),
('EN', 'traffic.appointments.table_time', 'Time'),
('EN', 'traffic.appointments.table_type', 'Type'),
('EN', 'traffic.appointments.table_location', 'Location'),
('EN', 'traffic.appointments.table_status', 'Status'),
('EN', 'traffic.appointments.table_actions', 'Actions'),
('EN', 'traffic.appointments.cancel_button', 'Cancel'),
('EN', 'traffic.appointments.no_results', 'No appointments found.'),

('ST', 'traffic.appointments.title', 'Dikopano tsa ka'),
('ST', 'traffic.appointments.filter_status', 'Boemo'),
('ST', 'traffic.appointments.filter_date', 'Letsatsi'),
('ST', 'traffic.appointments.clear_filters', 'Hlakola dikgetho'),
('ST', 'traffic.appointments.table_date', 'Letsatsi'),
('ST', 'traffic.appointments.table_time', 'Nako'),
('ST', 'traffic.appointments.table_type', 'Mofuta'),
('ST', 'traffic.appointments.table_location', 'Sebaka'),
('ST', 'traffic.appointments.table_status', 'Boemo'),
('ST', 'traffic.appointments.table_actions', 'Diketso'),
('ST', 'traffic.appointments.cancel_button', 'Hlakola'),
('ST', 'traffic.appointments.no_results', 'Ha ho dikopano tse fumanweng.');

-- traffic.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.staff_dashboard.title', 'Traffic Staff Dashboard'),
('EN', 'traffic.staff_dashboard.pending_applications', 'Pending Applications'),
('EN', 'traffic.staff_dashboard.today_appointments', 'Today''s Appointments'),
('EN', 'traffic.staff_dashboard.licences_issued', 'Licences Issued'),
('EN', 'traffic.staff_dashboard.process_button', 'Process'),

('ST', 'traffic.staff_dashboard.title', 'Dashboard ya basebetsi ba Sephethephethe'),
('ST', 'traffic.staff_dashboard.pending_applications', 'Dikopo tse emetseng'),
('ST', 'traffic.staff_dashboard.today_appointments', 'Dikopano tsa kajeno'),
('ST', 'traffic.staff_dashboard.licences_issued', 'Dilaesense tse ntshitsweng'),
('ST', 'traffic.staff_dashboard.process_button', 'Sebetsa');

-- traffic.processing.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.processing.title', 'Process Applications'),
('EN', 'traffic.processing.subtitle', 'Review and action pending licence applications.'),
('EN', 'traffic.processing.filter_status', 'Status'),
('EN', 'traffic.processing.filter_date', 'Date'),
('EN', 'traffic.processing.clear_filters', 'Clear Filters'),
('EN', 'traffic.processing.table_reference', 'Reference'),
('EN', 'traffic.processing.table_citizen', 'Citizen'),
('EN', 'traffic.processing.table_national_id', 'National ID'),
('EN', 'traffic.processing.table_date', 'Date'),
('EN', 'traffic.processing.table_status', 'Status'),
('EN', 'traffic.processing.table_actions', 'Actions'),
('EN', 'traffic.processing.approve', 'Approve'),
('EN', 'traffic.processing.request_info', 'Request Info'),
('EN', 'traffic.processing.reject', 'Reject'),
('EN', 'traffic.processing.no_results', 'No applications found.'),

('ST', 'traffic.processing.title', 'Sebetsa dikopo'),
('ST', 'traffic.processing.subtitle', 'Hlahloba le ho sebetsa dikopo tse emetseng tsa laesense.'),
('ST', 'traffic.processing.filter_status', 'Boemo'),
('ST', 'traffic.processing.filter_date', 'Letsatsi'),
('ST', 'traffic.processing.clear_filters', 'Hlakola dikgetho'),
('ST', 'traffic.processing.table_reference', 'Referense'),
('ST', 'traffic.processing.table_citizen', 'Moahi'),
('ST', 'traffic.processing.table_national_id', 'Nomoro ya boitsebiso'),
('ST', 'traffic.processing.table_date', 'Letsatsi'),
('ST', 'traffic.processing.table_status', 'Boemo'),
('ST', 'traffic.processing.table_actions', 'Diketso'),
('ST', 'traffic.processing.approve', 'Amohela'),
('ST', 'traffic.processing.request_info', 'Kopa tlhahisoleseding'),
('ST', 'traffic.processing.reject', 'Lahla'),
('ST', 'traffic.processing.no_results', 'Ha ho dikopo tse fumanweng.');

-- traffic.issue.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.issue.title', 'Issue Licence'),
('EN', 'traffic.issue.subtitle', 'Confirm details and issue the licence.'),
('EN', 'traffic.issue.sign_below', 'Sign below'),
('EN', 'traffic.issue.issue_button', 'Issue'),
('EN', 'traffic.issue.cancel_button', 'Cancel'),

('ST', 'traffic.issue.title', 'Ntsha laesense'),
('ST', 'traffic.issue.subtitle', 'Netefatsa dintlha mme o ntshe laesense.'),
('ST', 'traffic.issue.sign_below', 'Saina ka tlase'),
('ST', 'traffic.issue.issue_button', 'Ntsha'),
('ST', 'traffic.issue.cancel_button', 'Hlakola');

-- ============================================================
-- POLICE AREA
-- ============================================================

-- police.dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.dashboard.title', 'Police Services'),
('EN', 'police.dashboard.subtitle', 'Report cases and request clearances.'),
('EN', 'police.dashboard.report_case', 'Report a Case'),
('EN', 'police.dashboard.my_cases', 'My Cases'),
('EN', 'police.dashboard.request_clearance', 'Request Clearance'),

('ST', 'police.dashboard.title', 'Ditshebeletso tsa Sepolesa'),
('ST', 'police.dashboard.subtitle', 'Tlaleha dinyewe le ho kopa mangolo a tumello.'),
('ST', 'police.dashboard.report_case', 'Tlaleha nyeoe'),
('ST', 'police.dashboard.my_cases', 'Dinyewe tsa ka'),
('ST', 'police.dashboard.request_clearance', 'Kopa tumello');

-- police.report.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.report.title', 'Report a Case'),
('EN', 'police.report.emergency_note', 'For emergencies, call 112 immediately.'),
('EN', 'police.report.case_type', 'Case Type'),
('EN', 'police.report.case_type_theft', 'Theft'),
('EN', 'police.report.case_type_assault', 'Assault'),
('EN', 'police.report.case_type_fraud', 'Fraud'),
('EN', 'police.report.case_type_missing', 'Missing Person'),
('EN', 'police.report.case_type_other', 'Other'),
('EN', 'police.report.incident_date', 'Incident Date'),
('EN', 'police.report.location', 'Location'),
('EN', 'police.report.description', 'Description'),
('EN', 'police.report.upload_evidence', 'Upload Evidence'),
('EN', 'police.report.declaration', 'Declaration'),
('EN', 'police.report.declaration_text', 'I declare that the information provided is true.'),
('EN', 'police.report.submit_button', 'Submit'),
('EN', 'police.report.cancel_button', 'Cancel'),

('ST', 'police.report.title', 'Tlaleha nyeoe'),
('ST', 'police.report.emergency_note', 'Bakeng sa tshohanyetso, letsetsa 112 hang-hang.'),
('ST', 'police.report.case_type', 'Mofuta wa nyeoe'),
('ST', 'police.report.case_type_theft', 'Bosholu'),
('ST', 'police.report.case_type_assault', 'Tlhaselo'),
('ST', 'police.report.case_type_fraud', 'Bomenemene'),
('ST', 'police.report.case_type_missing', 'Motho ya lahlehileng'),
('ST', 'police.report.case_type_other', 'Tse ding'),
('ST', 'police.report.incident_date', 'Letsatsi la ketsahalo'),
('ST', 'police.report.location', 'Sebaka'),
('ST', 'police.report.description', 'Tlhaloso'),
('ST', 'police.report.upload_evidence', 'Kenya bopaki'),
('ST', 'police.report.declaration', 'Boitlamo'),
('ST', 'police.report.declaration_text', 'Ke tiisa hore tlhahisoleseding e fanweng ke ya nnete.'),
('ST', 'police.report.submit_button', 'Romela'),
('ST', 'police.report.cancel_button', 'Hlakola');

-- police.cases.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.cases.title', 'My Cases'),
('EN', 'police.cases.filter_status', 'Status'),
('EN', 'police.cases.filter_date', 'Date'),
('EN', 'police.cases.clear_filters', 'Clear Filters'),
('EN', 'police.cases.table_number', 'Case Number'),
('EN', 'police.cases.table_type', 'Type'),
('EN', 'police.cases.table_date', 'Date'),
('EN', 'police.cases.table_status', 'Status'),
('EN', 'police.cases.table_actions', 'Actions'),
('EN', 'police.cases.view_button', 'View'),
('EN', 'police.cases.no_results', 'No cases found.'),

('ST', 'police.cases.title', 'Dinyewe tsa ka'),
('ST', 'police.cases.filter_status', 'Boemo'),
('ST', 'police.cases.filter_date', 'Letsatsi'),
('ST', 'police.cases.clear_filters', 'Hlakola dikgetho'),
('ST', 'police.cases.table_number', 'Nomoro ya nyeoe'),
('ST', 'police.cases.table_type', 'Mofuta'),
('ST', 'police.cases.table_date', 'Letsatsi'),
('ST', 'police.cases.table_status', 'Boemo'),
('ST', 'police.cases.table_actions', 'Diketso'),
('ST', 'police.cases.view_button', 'Sheba'),
('ST', 'police.cases.no_results', 'Ha ho dinyewe tse fumanweng.');

-- police.case_details.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.case_details.title', 'Case Details'),
('EN', 'police.case_details.case_type', 'Case Type'),
('EN', 'police.case_details.date_reported', 'Date Reported'),
('EN', 'police.case_details.incident_date', 'Incident Date'),
('EN', 'police.case_details.location', 'Location'),
('EN', 'police.case_details.officer', 'Officer'),
('EN', 'police.case_details.description', 'Description'),
('EN', 'police.case_details.status_timeline', 'Status Timeline'),
('EN', 'police.case_details.back_button', 'Back'),

('ST', 'police.case_details.title', 'Dintlha tsa nyeoe'),
('ST', 'police.case_details.case_type', 'Mofuta wa nyeoe'),
('ST', 'police.case_details.date_reported', 'Letsatsi le tlalehilweng'),
('ST', 'police.case_details.incident_date', 'Letsatsi la ketsahalo'),
('ST', 'police.case_details.location', 'Sebaka'),
('ST', 'police.case_details.officer', 'Ofisiri'),
('ST', 'police.case_details.description', 'Tlhaloso'),
('ST', 'police.case_details.status_timeline', 'Tatelano ya boemo'),
('ST', 'police.case_details.back_button', 'Khutlela');

-- police.clearance.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.clearance.title', 'Police Clearance'),
('EN', 'police.clearance.subtitle', 'Apply for a police clearance certificate.'),
('EN', 'police.clearance.purpose', 'Purpose'),
('EN', 'police.clearance.station', 'Police Station'),
('EN', 'police.clearance.contact_number', 'Contact Number'),
('EN', 'police.clearance.email', 'Email'),
('EN', 'police.clearance.upload_national_id', 'Upload National ID'),
('EN', 'police.clearance.declaration', 'Declaration'),
('EN', 'police.clearance.declaration_text', 'I declare that the information provided is true.'),
('EN', 'police.clearance.submit_button', 'Submit'),
('EN', 'police.clearance.cancel_button', 'Cancel'),

('ST', 'police.clearance.title', 'Tumello ya sepolesa'),
('ST', 'police.clearance.subtitle', 'Etsa kopo ya setifikeiti sa tumello ya sepolesa.'),
('ST', 'police.clearance.purpose', 'Sepheo'),
('ST', 'police.clearance.station', 'Seteishene sa sepolesa'),
('ST', 'police.clearance.contact_number', 'Nomoro ya ho ikopanya'),
('ST', 'police.clearance.email', 'Imeile'),
('ST', 'police.clearance.upload_national_id', 'Kenya nomoro ya boitsebiso'),
('ST', 'police.clearance.declaration', 'Boitlamo'),
('ST', 'police.clearance.declaration_text', 'Ke tiisa hore tlhahisoleseding e fanweng ke ya nnete.'),
('ST', 'police.clearance.submit_button', 'Romela'),
('ST', 'police.clearance.cancel_button', 'Hlakola');

-- police.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.staff_dashboard.title', 'Police Staff Dashboard'),
('EN', 'police.staff_dashboard.open_cases', 'Open Cases'),
('EN', 'police.staff_dashboard.closed_cases', 'Closed Cases'),
('EN', 'police.staff_dashboard.pending_updates', 'Pending Updates'),
('EN', 'police.staff_dashboard.manage_button', 'Manage'),

('ST', 'police.staff_dashboard.title', 'Dashboard ya basebetsi ba Sepolesa'),
('ST', 'police.staff_dashboard.open_cases', 'Dinyewe tse butsweng'),
('ST', 'police.staff_dashboard.closed_cases', 'Dinyewe tse kwetsweng'),
('ST', 'police.staff_dashboard.pending_updates', 'Dintjhafatso tse emetseng'),
('ST', 'police.staff_dashboard.manage_button', 'Laola');

-- police.manage.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.manage.title', 'Manage Cases'),
('EN', 'police.manage.subtitle', 'Review and update case statuses.'),
('EN', 'police.manage.filter_status', 'Status'),
('EN', 'police.manage.filter_date', 'Date'),
('EN', 'police.manage.clear_filters', 'Clear Filters'),
('EN', 'police.manage.table_number', 'Case Number'),
('EN', 'police.manage.table_citizen', 'Citizen'),
('EN', 'police.manage.table_type', 'Type'),
('EN', 'police.manage.table_date', 'Date'),
('EN', 'police.manage.table_status', 'Status'),
('EN', 'police.manage.table_actions', 'Actions'),
('EN', 'police.manage.update_button', 'Update'),
('EN', 'police.manage.no_results', 'No cases found.'),

('ST', 'police.manage.title', 'Laola dinyewe'),
('ST', 'police.manage.subtitle', 'Hlahloba le ho ntjhafatsa maemo a dinyewe.'),
('ST', 'police.manage.filter_status', 'Boemo'),
('ST', 'police.manage.filter_date', 'Letsatsi'),
('ST', 'police.manage.clear_filters', 'Hlakola dikgetho'),
('ST', 'police.manage.table_number', 'Nomoro ya nyeoe'),
('ST', 'police.manage.table_citizen', 'Moahi'),
('ST', 'police.manage.table_type', 'Mofuta'),
('ST', 'police.manage.table_date', 'Letsatsi'),
('ST', 'police.manage.table_status', 'Boemo'),
('ST', 'police.manage.table_actions', 'Diketso'),
('ST', 'police.manage.update_button', 'Ntjhafatsa'),
('ST', 'police.manage.no_results', 'Ha ho dinyewe tse fumanweng.');

-- police.update.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.update.title', 'Update Case'),
('EN', 'police.update.status_label', 'Status'),
('EN', 'police.update.notes_label', 'Notes'),
('EN', 'police.update.save_button', 'Save'),
('EN', 'police.update.cancel_button', 'Cancel'),

('ST', 'police.update.title', 'Ntjhafatsa nyeoe'),
('ST', 'police.update.status_label', 'Boemo'),
('ST', 'police.update.notes_label', 'Dintlha'),
('ST', 'police.update.save_button', 'Boloka'),
('ST', 'police.update.cancel_button', 'Hlakola');

-- ============================================================
-- FINANCE AREA
-- ============================================================

-- finance.dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'finance.dashboard.title', 'Finance Services'),
('EN', 'finance.dashboard.subtitle', 'Manage your tax and payments.'),
('EN', 'finance.dashboard.register_tax', 'Register for Tax'),
('EN', 'finance.dashboard.view_profile', 'View Tax Profile'),
('EN', 'finance.dashboard.make_payment', 'Make a Payment'),
('EN', 'finance.dashboard.payment_history', 'Payment History'),
('EN', 'finance.dashboard.tax_clearance', 'Tax Clearance'),

('ST', 'finance.dashboard.title', 'Ditshebeletso tsa Ditjhelete'),
('ST', 'finance.dashboard.subtitle', 'Laola lekgetho le ditefo tsa hao.'),
('ST', 'finance.dashboard.register_tax', 'Ngolisa lekgetho'),
('ST', 'finance.dashboard.view_profile', 'Sheba profaele ya lekgetho'),
('ST', 'finance.dashboard.make_payment', 'Etsa tefo'),
('ST', 'finance.dashboard.payment_history', 'Histori ya ditefo'),
('ST', 'finance.dashboard.tax_clearance', 'Tumello ya lekgetho');

-- finance.register.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'finance.register.title', 'Register for Tax'),
('EN', 'finance.register.subtitle', 'Provide your details to register for tax.'),
('EN', 'finance.register.section_verified', 'Verified Information'),
('EN', 'finance.register.section_details', 'Tax Details'),
('EN', 'finance.register.employment_status', 'Employment Status'),
('EN', 'finance.register.income_source', 'Income Source'),
('EN', 'finance.register.tax_year', 'Tax Year'),
('EN', 'finance.register.employer', 'Employer'),
('EN', 'finance.register.declaration', 'Declaration'),
('EN', 'finance.register.declaration_text', 'I declare that the information provided is true.'),
('EN', 'finance.register.submit_button', 'Submit'),
('EN', 'finance.register.cancel_button', 'Cancel'),

('ST', 'finance.register.title', 'Ngolisa lekgetho'),
('ST', 'finance.register.subtitle', 'Fana ka dintlha tsa hao ho ngolisa lekgetho.'),
('ST', 'finance.register.section_verified', 'Tlhahisoleseding e netefaditsweng'),
('ST', 'finance.register.section_details', 'Dintlha tsa lekgetho'),
('ST', 'finance.register.employment_status', 'Boemo ba mosebetsi'),
('ST', 'finance.register.income_source', 'Mohlodi wa lekeno'),
('ST', 'finance.register.tax_year', 'Selemo sa lekgetho'),
('ST', 'finance.register.employer', 'Mokgethisi'),
('ST', 'finance.register.declaration', 'Boitlamo'),
('ST', 'finance.register.declaration_text', 'Ke tiisa hore tlhahisoleseding e fanweng ke ya nnete.'),
('ST', 'finance.register.submit_button', 'Romela'),
('ST', 'finance.register.cancel_button', 'Hlakola');

-- finance.profile.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'finance.profile.title', 'Tax Profile'),
('EN', 'finance.profile.tax_id', 'Tax ID'),
('EN', 'finance.profile.status', 'Status'),
('EN', 'finance.profile.outstanding_balance', 'Outstanding Balance'),
('EN', 'finance.profile.recent_payments', 'Recent Payments'),
('EN', 'finance.profile.table_reference', 'Reference'),
('EN', 'finance.profile.table_date', 'Date'),
('EN', 'finance.profile.table_amount', 'Amount'),
('EN', 'finance.profile.table_method', 'Method'),
('EN', 'finance.profile.table_status', 'Status'),
('EN', 'finance.profile.make_payment_button', 'Make a Payment'),
('EN', 'finance.profile.tax_clearance_button', 'Tax Clearance'),
('EN', 'finance.profile.no_payments', 'No payments recorded.'),

('ST', 'finance.profile.title', 'Profaele ya lekgetho'),
('ST', 'finance.profile.tax_id', 'Nomoro ya lekgetho'),
('ST', 'finance.profile.status', 'Boemo'),
('ST', 'finance.profile.outstanding_balance', 'Sekoloto se saletseng'),
('ST', 'finance.profile.recent_payments', 'Ditefo tsa morao tjena'),
('ST', 'finance.profile.table_reference', 'Referense'),
('ST', 'finance.profile.table_date', 'Letsatsi'),
('ST', 'finance.profile.table_amount', 'Tjhelete'),
('ST', 'finance.profile.table_method', 'Mokgwa'),
('ST', 'finance.profile.table_status', 'Boemo'),
('ST', 'finance.profile.make_payment_button', 'Etsa tefo'),
('ST', 'finance.profile.tax_clearance_button', 'Tumello ya lekgetho'),
('ST', 'finance.profile.no_payments', 'Ha ho ditefo tse tlalehilweng.');

-- finance.payment.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'finance.payment.title', 'Make a Payment'),
('EN', 'finance.payment.subtitle', 'Enter payment details to settle your tax.'),
('EN', 'finance.payment.amount_label', 'Amount'),
('EN', 'finance.payment.method_label', 'Payment Method'),
('EN', 'finance.payment.method_mobile', 'Mobile Money'),
('EN', 'finance.payment.method_bank', 'Bank Transfer'),
('EN', 'finance.payment.method_card', 'Card'),
('EN', 'finance.payment.mobile_number', 'Mobile Number'),
('EN', 'finance.payment.pay_button', 'Pay'),
('EN', 'finance.payment.cancel_button', 'Cancel'),

('ST', 'finance.payment.title', 'Etsa tefo'),
('ST', 'finance.payment.subtitle', 'Kenya dintlha tsa tefo ho lefa lekgetho la hao.'),
('ST', 'finance.payment.amount_label', 'Tjhelete'),
('ST', 'finance.payment.method_label', 'Mokgwa wa tefo'),
('ST', 'finance.payment.method_mobile', 'Tjhelete ya mohala'),
('ST', 'finance.payment.method_bank', 'Phetiso ya banka'),
('ST', 'finance.payment.method_card', 'Karete'),
('ST', 'finance.payment.mobile_number', 'Nomoro ya mohala'),
('ST', 'finance.payment.pay_button', 'Lefa'),
('ST', 'finance.payment.cancel_button', 'Hlakola');

-- finance.payment_confirmation.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'finance.payment_confirmation.title', 'Payment Confirmed'),
('EN', 'finance.payment_confirmation.message', 'Your payment has been received.'),
('EN', 'finance.payment_confirmation.reference_label', 'Reference'),
('EN', 'finance.payment_confirmation.amount_label', 'Amount'),
('EN', 'finance.payment_confirmation.balance_label', 'New Balance'),
('EN', 'finance.payment_confirmation.date_label', 'Date'),
('EN', 'finance.payment_confirmation.method_label', 'Method'),
('EN', 'finance.payment_confirmation.download_receipt', 'Download Receipt'),
('EN', 'finance.payment_confirmation.view_profile', 'View Profile'),

('ST', 'finance.payment_confirmation.title', 'Tefo e netefaditswe'),
('ST', 'finance.payment_confirmation.message', 'Tefo ya hao e amohetsoe.'),
('ST', 'finance.payment_confirmation.reference_label', 'Referense'),
('ST', 'finance.payment_confirmation.amount_label', 'Tjhelete'),
('ST', 'finance.payment_confirmation.balance_label', 'Sekoloto se setjha'),
('ST', 'finance.payment_confirmation.date_label', 'Letsatsi'),
('ST', 'finance.payment_confirmation.method_label', 'Mokgwa'),
('ST', 'finance.payment_confirmation.download_receipt', 'Khoasolla risiti'),
('ST', 'finance.payment_confirmation.view_profile', 'Sheba profaele');

-- finance.clearance.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'finance.clearance.title', 'Tax Clearance Certificate'),
('EN', 'finance.clearance.subtitle', 'Your tax clearance certificate.'),
('EN', 'finance.clearance.certificate_id', 'Certificate ID'),
('EN', 'finance.clearance.tin', 'TIN'),
('EN', 'finance.clearance.legal_name', 'Legal Name'),
('EN', 'finance.clearance.trading_name', 'Trading Name'),
('EN', 'finance.clearance.nature_of_business', 'Nature of Business'),
('EN', 'finance.clearance.date_issued', 'Date Issued'),
('EN', 'finance.clearance.valid_until', 'Valid Until'),
('EN', 'finance.clearance.address', 'Address'),
('EN', 'finance.clearance.scan_to_verify', 'Scan to verify'),
('EN', 'finance.clearance.print_button', 'Print'),
('EN', 'finance.clearance.download_button', 'Download'),

('ST', 'finance.clearance.title', 'Setifikeiti sa tumello ya lekgetho'),
('ST', 'finance.clearance.subtitle', 'Setifikeiti sa hao sa tumello ya lekgetho.'),
('ST', 'finance.clearance.certificate_id', 'Nomoro ya setifikeiti'),
('ST', 'finance.clearance.tin', 'TIN'),
('ST', 'finance.clearance.legal_name', 'Lebitso la molao'),
('ST', 'finance.clearance.trading_name', 'Lebitso la kgwebo'),
('ST', 'finance.clearance.nature_of_business', 'Mofuta wa kgwebo'),
('ST', 'finance.clearance.date_issued', 'Letsatsi la ho ntshwa'),
('ST', 'finance.clearance.valid_until', 'E sebetsa ho fihlela'),
('ST', 'finance.clearance.address', 'Aterese'),
('ST', 'finance.clearance.scan_to_verify', 'Skena ho netefatsa'),
('ST', 'finance.clearance.print_button', 'Hatisa'),
('ST', 'finance.clearance.download_button', 'Khoasolla');

-- finance.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'finance.staff_dashboard.title', 'Finance Staff Dashboard'),
('EN', 'finance.staff_dashboard.registered_taxpayers', 'Registered Taxpayers'),
('EN', 'finance.staff_dashboard.payments_today', 'Payments Today'),
('EN', 'finance.staff_dashboard.outstanding_balances', 'Outstanding Balances'),
('EN', 'finance.staff_dashboard.process_button', 'Process'),

('ST', 'finance.staff_dashboard.title', 'Dashboard ya basebetsi ba Ditjhelete'),
('ST', 'finance.staff_dashboard.registered_taxpayers', 'Bahlokisi ba lekgetho ba ngolisitsweng'),
('ST', 'finance.staff_dashboard.payments_today', 'Ditefo tsa kajeno'),
('ST', 'finance.staff_dashboard.outstanding_balances', 'Dikoloto tse saletseng'),
('ST', 'finance.staff_dashboard.process_button', 'Sebetsa');

-- finance.processing.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'finance.processing.title', 'Process Tax Registrations'),
('EN', 'finance.processing.subtitle', 'Review and action pending tax registrations.'),
('EN', 'finance.processing.filter_status', 'Status'),
('EN', 'finance.processing.filter_date', 'Date'),
('EN', 'finance.processing.clear_filters', 'Clear Filters'),
('EN', 'finance.processing.table_reference', 'Reference'),
('EN', 'finance.processing.table_citizen', 'Citizen'),
('EN', 'finance.processing.table_national_id', 'National ID'),
('EN', 'finance.processing.table_income', 'Income Source'),
('EN', 'finance.processing.table_status', 'Status'),
('EN', 'finance.processing.table_actions', 'Actions'),
('EN', 'finance.processing.approve', 'Approve'),
('EN', 'finance.processing.reject', 'Reject'),
('EN', 'finance.processing.no_results', 'No registrations found.'),

('ST', 'finance.processing.title', 'Sebetsa dingoliso tsa lekgetho'),
('ST', 'finance.processing.subtitle', 'Hlahloba le ho sebetsa dingoliso tsa lekgetho tse emetseng.'),
('ST', 'finance.processing.filter_status', 'Boemo'),
('ST', 'finance.processing.filter_date', 'Letsatsi'),
('ST', 'finance.processing.clear_filters', 'Hlakola dikgetho'),
('ST', 'finance.processing.table_reference', 'Referense'),
('ST', 'finance.processing.table_citizen', 'Moahi'),
('ST', 'finance.processing.table_national_id', 'Nomoro ya boitsebiso'),
('ST', 'finance.processing.table_income', 'Mohlodi wa lekeno'),
('ST', 'finance.processing.table_status', 'Boemo'),
('ST', 'finance.processing.table_actions', 'Diketso'),
('ST', 'finance.processing.approve', 'Amohela'),
('ST', 'finance.processing.reject', 'Lahla'),
('ST', 'finance.processing.no_results', 'Ha ho dingoliso tse fumanweng.');

-- ============================================================
-- PENSIONS AREA
-- ============================================================

-- pensions.dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.dashboard.title', 'Pensions Services'),
('EN', 'pensions.dashboard.subtitle', 'View your pension and perform verification.'),
('EN', 'pensions.dashboard.view_info', 'View Pension Info'),
('EN', 'pensions.dashboard.perform_verification', 'Perform Verification'),
('EN', 'pensions.dashboard.verification_history', 'Verification History'),

('ST', 'pensions.dashboard.title', 'Ditshebeletso tsa Phenjhene'),
('ST', 'pensions.dashboard.subtitle', 'Sheba phenjhene ya hao mme o etse netefatso.'),
('ST', 'pensions.dashboard.view_info', 'Sheba tlhahisoleseding ya phenjhene'),
('ST', 'pensions.dashboard.perform_verification', 'Etsa netefatso'),
('ST', 'pensions.dashboard.verification_history', 'Histori ya netefatso');

-- pensions.info.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.info.title', 'Pension Information'),
('EN', 'pensions.info.pension_type', 'Pension Type'),
('EN', 'pensions.info.pension_number', 'Pension Number'),
('EN', 'pensions.info.monthly_amount', 'Monthly Amount'),
('EN', 'pensions.info.next_payment_date', 'Next Payment Date'),
('EN', 'pensions.info.payment_status', 'Payment Status'),
('EN', 'pensions.info.back_button', 'Back'),
('EN', 'pensions.info.verify_button', 'Verify'),

('ST', 'pensions.info.title', 'Tlhahisoleseding ya phenjhene'),
('ST', 'pensions.info.pension_type', 'Mofuta wa phenjhene'),
('ST', 'pensions.info.pension_number', 'Nomoro ya phenjhene'),
('ST', 'pensions.info.monthly_amount', 'Tjhelete ya kgwedi le kgwedi'),
('ST', 'pensions.info.next_payment_date', 'Letsatsi le latelang la tefo'),
('ST', 'pensions.info.payment_status', 'Boemo ba tefo'),
('ST', 'pensions.info.back_button', 'Khutlela'),
('ST', 'pensions.info.verify_button', 'Netefatsa');

-- pensions.verify.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.verify.title', 'Pension Verification'),
('EN', 'pensions.verify.subtitle', 'Answer the security question to verify.'),
('EN', 'pensions.verify.security_question', 'Security Question'),
('EN', 'pensions.verify.answer_label', 'Answer'),
('EN', 'pensions.verify.verify_button', 'Verify'),
('EN', 'pensions.verify.cancel_button', 'Cancel'),

('ST', 'pensions.verify.title', 'Netefatso ya phenjhene'),
('ST', 'pensions.verify.subtitle', 'Araba potso ya tshireletso ho netefatsa.'),
('ST', 'pensions.verify.security_question', 'Potso ya tshireletso'),
('ST', 'pensions.verify.answer_label', 'Karabo'),
('ST', 'pensions.verify.verify_button', 'Netefatsa'),
('ST', 'pensions.verify.cancel_button', 'Hlakola');

-- pensions.verify_success.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.verify_success.title', 'Verification Successful'),
('EN', 'pensions.verify_success.message', 'Your pension verification has been recorded.'),
('EN', 'pensions.verify_success.verification_date', 'Verification Date'),
('EN', 'pensions.verify_success.next_due_date', 'Next Due Date'),
('EN', 'pensions.verify_success.view_history', 'View History'),
('EN', 'pensions.verify_success.back_button', 'Back'),

('ST', 'pensions.verify_success.title', 'Netefatso e atlehile'),
('ST', 'pensions.verify_success.message', 'Netefatso ya hao ya phenjhene e tlalehilwe.'),
('ST', 'pensions.verify_success.verification_date', 'Letsatsi la netefatso'),
('ST', 'pensions.verify_success.next_due_date', 'Letsatsi le latelang le lebeletsweng'),
('ST', 'pensions.verify_success.view_history', 'Sheba histori'),
('ST', 'pensions.verify_success.back_button', 'Khutlela');

-- pensions.history.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.history.title', 'Verification History'),
('EN', 'pensions.history.filter_status', 'Status'),
('EN', 'pensions.history.filter_method', 'Method'),
('EN', 'pensions.history.filter_date', 'Date'),
('EN', 'pensions.history.clear_filters', 'Clear Filters'),
('EN', 'pensions.history.table_date', 'Date'),
('EN', 'pensions.history.table_status', 'Status'),
('EN', 'pensions.history.table_method', 'Method'),
('EN', 'pensions.history.no_results', 'No verifications found.'),

('ST', 'pensions.history.title', 'Histori ya netefatso'),
('ST', 'pensions.history.filter_status', 'Boemo'),
('ST', 'pensions.history.filter_method', 'Mokgwa'),
('ST', 'pensions.history.filter_date', 'Letsatsi'),
('ST', 'pensions.history.clear_filters', 'Hlakola dikgetho'),
('ST', 'pensions.history.table_date', 'Letsatsi'),
('ST', 'pensions.history.table_status', 'Boemo'),
('ST', 'pensions.history.table_method', 'Mokgwa'),
('ST', 'pensions.history.no_results', 'Ha ho dintlafatso tse fumanweng.');

-- pensions.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.staff_dashboard.title', 'Pensions Staff Dashboard'),
('EN', 'pensions.staff_dashboard.active_pensioners', 'Active Pensioners'),
('EN', 'pensions.staff_dashboard.verifications_due', 'Verifications Due'),
('EN', 'pensions.staff_dashboard.payments_processed', 'Payments Processed'),
('EN', 'pensions.staff_dashboard.process_button', 'Process'),

('ST', 'pensions.staff_dashboard.title', 'Dashboard ya basebetsi ba Phenjhene'),
('ST', 'pensions.staff_dashboard.active_pensioners', 'Baphenjheni ba sebetsang'),
('ST', 'pensions.staff_dashboard.verifications_due', 'Dintlafatso tse lokelang'),
('ST', 'pensions.staff_dashboard.payments_processed', 'Ditefo tse sebetsitsweng'),
('ST', 'pensions.staff_dashboard.process_button', 'Sebetsa');

-- pensions.process.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.process.title', 'Process Verifications'),
('EN', 'pensions.process.subtitle', 'Review and confirm pensioner verifications.'),
('EN', 'pensions.process.filter_status', 'Status'),
('EN', 'pensions.process.clear_filters', 'Clear Filters'),
('EN', 'pensions.process.table_citizen', 'Pensioner'),
('EN', 'pensions.process.table_national_id', 'National ID'),
('EN', 'pensions.process.table_last_verified', 'Last Verified'),
('EN', 'pensions.process.table_status', 'Status'),
('EN', 'pensions.process.table_actions', 'Actions'),
('EN', 'pensions.process.confirm_button', 'Confirm'),
('EN', 'pensions.process.no_results', 'No verifications found.'),

('ST', 'pensions.process.title', 'Sebetsa dintlafatso'),
('ST', 'pensions.process.subtitle', 'Hlahloba le ho tiisa dintlafatso tsa baphenjheni.'),
('ST', 'pensions.process.filter_status', 'Boemo'),
('ST', 'pensions.process.clear_filters', 'Hlakola dikgetho'),
('ST', 'pensions.process.table_citizen', 'Mophenjheni'),
('ST', 'pensions.process.table_national_id', 'Nomoro ya boitsebiso'),
('ST', 'pensions.process.table_last_verified', 'E netefaditsweng la ho qetela'),
('ST', 'pensions.process.table_status', 'Boemo'),
('ST', 'pensions.process.table_actions', 'Diketso'),
('ST', 'pensions.process.confirm_button', 'Tiisa'),
('ST', 'pensions.process.no_results', 'Ha ho dintlafatso tse fumanweng.');

-- ============================================================
-- PASSPORT AREA
-- ============================================================

-- passport.dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'passport.dashboard.title', 'Passport Services'),
('EN', 'passport.dashboard.subtitle', 'Apply for a passport, renew, or check status.'),
('EN', 'passport.dashboard.apply', 'Apply for Passport'),
('EN', 'passport.dashboard.renew', 'Renew Passport'),
('EN', 'passport.dashboard.check_status', 'Check Status'),

('ST', 'passport.dashboard.title', 'Ditshebeletso tsa Pasepoto'),
('ST', 'passport.dashboard.subtitle', 'Etsa kopo ya pasepoto, ntjhafatsa, kapa hlahloba boemo.'),
('ST', 'passport.dashboard.apply', 'Etsa kopo ya pasepoto'),
('ST', 'passport.dashboard.renew', 'Ntjhafatsa pasepoto'),
('ST', 'passport.dashboard.check_status', 'Hlahloba boemo');

-- passport.apply.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'passport.apply.title', 'Apply for a Passport'),
('EN', 'passport.apply.step_review', 'Review'),
('EN', 'passport.apply.step_details', 'Details'),
('EN', 'passport.apply.step_documents', 'Documents'),
('EN', 'passport.apply.step_submit', 'Submit'),
('EN', 'passport.apply.review_title', 'Review Your Information'),
('EN', 'passport.apply.review_subtitle', 'Ensure your details are correct before continuing.'),
('EN', 'passport.apply.continue', 'Continue'),
('EN', 'passport.apply.details_title', 'Passport Details'),
('EN', 'passport.apply.passport_type', 'Passport Type'),
('EN', 'passport.apply.passport_type_ordinary', 'Ordinary'),
('EN', 'passport.apply.passport_type_official', 'Official'),
('EN', 'passport.apply.collection_office', 'Collection Office'),
('EN', 'passport.apply.reason', 'Reason for Application'),
('EN', 'passport.apply.documents_title', 'Upload Documents'),
('EN', 'passport.apply.upload_national_id', 'Upload National ID'),
('EN', 'passport.apply.upload_birth', 'Upload Birth Certificate'),
('EN', 'passport.apply.upload_photo', 'Upload Photo'),
('EN', 'passport.apply.photo_requirement', 'Photo must be recent, plain background, no glasses.'),
('EN', 'passport.apply.review_submit_title', 'Review and Submit'),
('EN', 'passport.apply.summary_title', 'Summary'),
('EN', 'passport.apply.declaration', 'Declaration'),
('EN', 'passport.apply.declaration_text', 'I declare that the information provided is true.'),
('EN', 'passport.apply.submit_button', 'Submit'),
('EN', 'passport.apply.back_button', 'Back'),
('EN', 'passport.apply.save_draft', 'Save Draft'),

('ST', 'passport.apply.title', 'Etsa kopo ya pasepoto'),
('ST', 'passport.apply.step_review', 'Hlahloba'),
('ST', 'passport.apply.step_details', 'Dintlha'),
('ST', 'passport.apply.step_documents', 'Ditokomane'),
('ST', 'passport.apply.step_submit', 'Romela'),
('ST', 'passport.apply.review_title', 'Hlahloba tlhahisoleseding ya hao'),
('ST', 'passport.apply.review_subtitle', 'Netefatsa hore dintlha tsa hao di nepahetse pele o tswela pele.'),
('ST', 'passport.apply.continue', 'Tsoela pele'),
('ST', 'passport.apply.details_title', 'Dintlha tsa pasepoto'),
('ST', 'passport.apply.passport_type', 'Mofuta wa pasepoto'),
('ST', 'passport.apply.passport_type_ordinary', 'E tlwaelehileng'),
('ST', 'passport.apply.passport_type_official', 'Ya semmuso'),
('ST', 'passport.apply.collection_office', 'Ofisi ya ho nka'),
('ST', 'passport.apply.reason', 'Lebaka la kopo'),
('ST', 'passport.apply.documents_title', 'Kenya ditokomane'),
('ST', 'passport.apply.upload_national_id', 'Kenya nomoro ya boitsebiso'),
('ST', 'passport.apply.upload_birth', 'Kenya setifikeiti sa tsoalo'),
('ST', 'passport.apply.upload_photo', 'Kenya senepe'),
('ST', 'passport.apply.photo_requirement', 'Senepe e lokela ho ba sa morao tjena, bokantle bo hlakileng, ntle le digalase.'),
('ST', 'passport.apply.review_submit_title', 'Hlahloba le ho romela'),
('ST', 'passport.apply.summary_title', 'Kakaretso'),
('ST', 'passport.apply.declaration', 'Boitlamo'),
('ST', 'passport.apply.declaration_text', 'Ke tiisa hore tlhahisoleseding e fanweng ke ya nnete.'),
('ST', 'passport.apply.submit_button', 'Romela'),
('ST', 'passport.apply.back_button', 'Khutlela'),
('ST', 'passport.apply.save_draft', 'Boloka morero');

-- passport.confirmation.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'passport.confirmation.title', 'Application Submitted'),
('EN', 'passport.confirmation.message', 'Your passport application has been submitted.'),
('EN', 'passport.confirmation.reference_label', 'Reference'),
('EN', 'passport.confirmation.applicant_label', 'Applicant'),
('EN', 'passport.confirmation.date_label', 'Date'),
('EN', 'passport.confirmation.passport_type_label', 'Passport Type'),
('EN', 'passport.confirmation.office_label', 'Collection Office'),
('EN', 'passport.confirmation.keep_safe', 'Keep your reference number safe.'),
('EN', 'passport.confirmation.download_receipt', 'Download Receipt'),
('EN', 'passport.confirmation.track_button', 'Track Application'),

('ST', 'passport.confirmation.title', 'Kopo e rometswe'),
('ST', 'passport.confirmation.message', 'Kopo ya hao ya pasepoto e rometswe.'),
('ST', 'passport.confirmation.reference_label', 'Referense'),
('ST', 'passport.confirmation.applicant_label', 'Mokopi'),
('ST', 'passport.confirmation.date_label', 'Letsatsi'),
('ST', 'passport.confirmation.passport_type_label', 'Mofuta wa pasepoto'),
('ST', 'passport.confirmation.office_label', 'Ofisi ya ho nka'),
('ST', 'passport.confirmation.keep_safe', 'Boloka nomoro ya hao ya referense hantle.'),
('ST', 'passport.confirmation.download_receipt', 'Khoasolla risiti'),
('ST', 'passport.confirmation.track_button', 'Latela kopo');

-- passport.status.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'passport.status.title', 'Application Status'),
('EN', 'passport.status.filter_status', 'Status'),
('EN', 'passport.status.filter_date', 'Date'),
('EN', 'passport.status.clear_filters', 'Clear Filters'),
('EN', 'passport.status.table_reference', 'Reference'),
('EN', 'passport.status.table_date', 'Date'),
('EN', 'passport.status.table_status', 'Status'),
('EN', 'passport.status.no_results', 'No applications found.'),

('ST', 'passport.status.title', 'Boemo ba kopo'),
('ST', 'passport.status.filter_status', 'Boemo'),
('ST', 'passport.status.filter_date', 'Letsatsi'),
('ST', 'passport.status.clear_filters', 'Hlakola dikgetho'),
('ST', 'passport.status.table_reference', 'Referense'),
('ST', 'passport.status.table_date', 'Letsatsi'),
('ST', 'passport.status.table_status', 'Boemo'),
('ST', 'passport.status.no_results', 'Ha ho dikopo tse fumanweng.');

-- passport.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'passport.staff_dashboard.title', 'Passport Staff Dashboard'),
('EN', 'passport.staff_dashboard.pending', 'Pending'),
('EN', 'passport.staff_dashboard.approved_today', 'Approved Today'),
('EN', 'passport.staff_dashboard.rejected_today', 'Rejected Today'),
('EN', 'passport.staff_dashboard.process_button', 'Process'),
('EN', 'passport.staff_dashboard.history_button', 'History'),

('ST', 'passport.staff_dashboard.title', 'Dashboard ya basebetsi ba Pasepoto'),
('ST', 'passport.staff_dashboard.pending', 'E emetse'),
('ST', 'passport.staff_dashboard.approved_today', 'E amohetsoeng kajeno'),
('ST', 'passport.staff_dashboard.rejected_today', 'E lahlilweng kajeno'),
('ST', 'passport.staff_dashboard.process_button', 'Sebetsa'),
('ST', 'passport.staff_dashboard.history_button', 'Histori');

-- passport.process.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'passport.process.title', 'Process Applications'),
('EN', 'passport.process.subtitle', 'Review and action pending passport applications.'),
('EN', 'passport.process.filter_status', 'Status'),
('EN', 'passport.process.filter_date', 'Date'),
('EN', 'passport.process.clear_filters', 'Clear Filters'),
('EN', 'passport.process.table_reference', 'Reference'),
('EN', 'passport.process.table_citizen', 'Applicant'),
('EN', 'passport.process.table_national_id', 'National ID'),
('EN', 'passport.process.table_date', 'Date'),
('EN', 'passport.process.table_status', 'Status'),
('EN', 'passport.process.table_actions', 'Actions'),
('EN', 'passport.process.approve', 'Approve'),
('EN', 'passport.process.request_info', 'Request Info'),
('EN', 'passport.process.reject', 'Reject'),
('EN', 'passport.process.no_results', 'No applications found.'),

('ST', 'passport.process.title', 'Sebetsa dikopo'),
('ST', 'passport.process.subtitle', 'Hlahloba le ho sebetsa dikopo tsa pasepoto tse emetseng.'),
('ST', 'passport.process.filter_status', 'Boemo'),
('ST', 'passport.process.filter_date', 'Letsatsi'),
('ST', 'passport.process.clear_filters', 'Hlakola dikgetho'),
('ST', 'passport.process.table_reference', 'Referense'),
('ST', 'passport.process.table_citizen', 'Mokopi'),
('ST', 'passport.process.table_national_id', 'Nomoro ya boitsebiso'),
('ST', 'passport.process.table_date', 'Letsatsi'),
('ST', 'passport.process.table_status', 'Boemo'),
('ST', 'passport.process.table_actions', 'Diketso'),
('ST', 'passport.process.approve', 'Amohela'),
('ST', 'passport.process.request_info', 'Kopa tlhahisoleseding'),
('ST', 'passport.process.reject', 'Lahla'),
('ST', 'passport.process.no_results', 'Ha ho dikopo tse fumanweng.');

-- passport.history.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'passport.history.title', 'Processing History'),
('EN', 'passport.history.filter_status', 'Status'),
('EN', 'passport.history.filter_date', 'Date'),
('EN', 'passport.history.clear_filters', 'Clear Filters'),
('EN', 'passport.history.table_reference', 'Reference'),
('EN', 'passport.history.table_citizen', 'Applicant'),
('EN', 'passport.history.table_date', 'Date'),
('EN', 'passport.history.table_status', 'Status'),
('EN', 'passport.history.print_button', 'Print'),
('EN', 'passport.history.export_button', 'Export'),
('EN', 'passport.history.no_results', 'No history found.'),

('ST', 'passport.history.title', 'Histori ya tsamaiso'),
('ST', 'passport.history.filter_status', 'Boemo'),
('ST', 'passport.history.filter_date', 'Letsatsi'),
('ST', 'passport.history.clear_filters', 'Hlakola dikgetho'),
('ST', 'passport.history.table_reference', 'Referense'),
('ST', 'passport.history.table_citizen', 'Mokopi'),
('ST', 'passport.history.table_date', 'Letsatsi'),
('ST', 'passport.history.table_status', 'Boemo'),
('ST', 'passport.history.print_button', 'Hatisa'),
('ST', 'passport.history.export_button', 'Romela'),
('ST', 'passport.history.no_results', 'Ha ho histori e fumanweng.');

-- ============================================================
-- ADMIN AREA
-- ============================================================

-- admin.dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'admin.dashboard.title', 'Administrator Dashboard'),
('EN', 'admin.dashboard.subtitle', 'System overview and administration.'),
('EN', 'admin.dashboard.total_users', 'Total Users'),
('EN', 'admin.dashboard.active_staff', 'Active Staff'),
('EN', 'admin.dashboard.pending_actions', 'Pending Actions'),
('EN', 'admin.dashboard.system_health', 'System Health'),
('EN', 'admin.dashboard.health_operational', 'Operational'),
('EN', 'admin.dashboard.health_last_checked', 'Last checked {time}'),
('EN', 'admin.dashboard.health_failed', 'Health check failed'),
('EN', 'admin.dashboard.add_user', 'Add User'),
('EN', 'admin.dashboard.view_audit', 'View Audit Logs'),
('EN', 'admin.dashboard.recent_activity', 'Recent Activity'),
('EN', 'admin.dashboard.no_activity', 'No recent activity.'),

('ST', 'admin.dashboard.title', 'Dashboard ya Molaodi'),
('ST', 'admin.dashboard.subtitle', 'Kakaretso ya sistimi le tsamaiso.'),
('ST', 'admin.dashboard.total_users', 'Kakaretso ya basebedisi'),
('ST', 'admin.dashboard.active_staff', 'Basebetsi ba sebetsang'),
('ST', 'admin.dashboard.pending_actions', 'Diketso tse emetseng'),
('ST', 'admin.dashboard.system_health', 'Bophelo ba sistimi'),
('ST', 'admin.dashboard.health_operational', 'E sebetsa'),
('ST', 'admin.dashboard.health_last_checked', 'E hlahlobilweng la ho qetela {time}'),
('ST', 'admin.dashboard.health_failed', 'Tlhahlobo ya bophelo e hlotsoe'),
('ST', 'admin.dashboard.add_user', 'Kenya mosebedisi'),
('ST', 'admin.dashboard.view_audit', 'Sheba Audit Logs'),
('ST', 'admin.dashboard.recent_activity', 'Ketso ya morao tjena'),
('ST', 'admin.dashboard.no_activity', 'Ha ho ketso ya morao tjena.');

-- admin.users.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'admin.users.title', 'User Management'),
('EN', 'admin.users.subtitle', 'Manage citizen, staff, and administrator accounts.'),
('EN', 'admin.users.filter_username', 'Username'),
('EN', 'admin.users.filter_role', 'Role'),
('EN', 'admin.users.filter_status', 'Status'),
('EN', 'admin.users.clear_filters', 'Clear Filters'),
('EN', 'admin.users.add_user', 'Add User'),
('EN', 'admin.users.table_username', 'Username'),
('EN', 'admin.users.table_role', 'Role'),
('EN', 'admin.users.table_ministry', 'Ministry'),
('EN', 'admin.users.table_status', 'Status'),
('EN', 'admin.users.table_actions', 'Actions'),
('EN', 'admin.users.edit', 'Edit'),
('EN', 'admin.users.deactivate', 'Deactivate'),
('EN', 'admin.users.activate', 'Activate'),
('EN', 'admin.users.delete', 'Delete'),
('EN', 'admin.users.no_results', 'No users found.'),
('EN', 'admin.users.role_citizen', 'Citizen'),
('EN', 'admin.users.role_staff', 'Staff'),
('EN', 'admin.users.role_admin', 'Administrator'),
('EN', 'admin.users.ministry_not_applicable', 'Not Applicable'),
('EN', 'admin.users.ministry_administration', 'Administration'),

('ST', 'admin.users.title', 'Tsamaiso ya basebedisi'),
('ST', 'admin.users.subtitle', 'Laola diakhaonte tsa baahi, basebetsi le balaodi.'),
('ST', 'admin.users.filter_username', 'Lebitso la mosebedisi'),
('ST', 'admin.users.filter_role', 'Karolo'),
('ST', 'admin.users.filter_status', 'Boemo'),
('ST', 'admin.users.clear_filters', 'Hlakola dikgetho'),
('ST', 'admin.users.add_user', 'Kenya mosebedisi'),
('ST', 'admin.users.table_username', 'Lebitso la mosebedisi'),
('ST', 'admin.users.table_role', 'Karolo'),
('ST', 'admin.users.table_ministry', 'Lefapha'),
('ST', 'admin.users.table_status', 'Boemo'),
('ST', 'admin.users.table_actions', 'Diketso'),
('ST', 'admin.users.edit', 'Fetola'),
('ST', 'admin.users.deactivate', 'Timya'),
('ST', 'admin.users.activate', 'Dumella'),
('ST', 'admin.users.delete', 'Hlakola'),
('ST', 'admin.users.no_results', 'Ha ho basebedisi ba fumanweng.'),
('ST', 'admin.users.role_citizen', 'Moahi'),
('ST', 'admin.users.role_staff', 'Mosebetsi'),
('ST', 'admin.users.role_admin', 'Molaodi'),
('ST', 'admin.users.ministry_not_applicable', 'Ha e sebetse'),
('ST', 'admin.users.ministry_administration', 'Tsamaiso');

-- admin.add_user.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'admin.add_user.title', 'Add User'),
('EN', 'admin.add_user.subtitle', 'Create a new account.'),
('EN', 'admin.add_user.section_account', 'Account Details'),
('EN', 'admin.add_user.full_name', 'Full Name'),
('EN', 'admin.add_user.username', 'Username'),
('EN', 'admin.add_user.email', 'Email'),
('EN', 'admin.add_user.role', 'Role'),
('EN', 'admin.add_user.role_hint', 'Choose the role for this account.'),
('EN', 'admin.add_user.ministry', 'Ministry'),
('EN', 'admin.add_user.ministry_hint', 'Required for staff accounts.'),
('EN', 'admin.add_user.status', 'Status'),
('EN', 'admin.add_user.section_password', 'Password'),
('EN', 'admin.add_user.password', 'Password'),
('EN', 'admin.add_user.confirm_password', 'Confirm Password'),
('EN', 'admin.add_user.password_hint', 'At least 8 characters, including one number.'),
('EN', 'admin.add_user.send_credentials', 'Send credentials to user'),
('EN', 'admin.add_user.create_button', 'Create User'),
('EN', 'admin.add_user.cancel_button', 'Cancel'),

('ST', 'admin.add_user.title', 'Kenya mosebedisi'),
('ST', 'admin.add_user.subtitle', 'Theha akhaonte e ntjha.'),
('ST', 'admin.add_user.section_account', 'Dintlha tsa akhaonte'),
('ST', 'admin.add_user.full_name', 'Lebitso le felletseng'),
('ST', 'admin.add_user.username', 'Lebitso la mosebedisi'),
('ST', 'admin.add_user.email', 'Imeile'),
('ST', 'admin.add_user.role', 'Karolo'),
('ST', 'admin.add_user.role_hint', 'Kgetha karolo ya akhaonte ena.'),
('ST', 'admin.add_user.ministry', 'Lefapha'),
('ST', 'admin.add_user.ministry_hint', 'E hlokahala bakeng sa diakhaonte tsa basebetsi.'),
('ST', 'admin.add_user.status', 'Boemo'),
('ST', 'admin.add_user.section_password', 'Phasewete'),
('ST', 'admin.add_user.password', 'Phasewete'),
('ST', 'admin.add_user.confirm_password', 'Netefatsa phasewete'),
('ST', 'admin.add_user.password_hint', 'Bonyane ditlhaku tse 8, ho kenyeletswa nomoro e le nngwe.'),
('ST', 'admin.add_user.send_credentials', 'Romela dintlha tsa ho kena ho mosebedisi'),
('ST', 'admin.add_user.create_button', 'Theha mosebedisi'),
('ST', 'admin.add_user.cancel_button', 'Hlakola');

-- admin.edit_user.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'admin.edit_user.title', 'Edit User'),
('EN', 'admin.edit_user.subtitle_template', 'Editing {username}'),
('EN', 'admin.edit_user.section_account', 'Account Details'),
('EN', 'admin.edit_user.full_name', 'Full Name'),
('EN', 'admin.edit_user.username', 'Username'),
('EN', 'admin.edit_user.email', 'Email'),
('EN', 'admin.edit_user.role', 'Role'),
('EN', 'admin.edit_user.ministry', 'Ministry'),
('EN', 'admin.edit_user.status', 'Status'),
('EN', 'admin.edit_user.section_password', 'Password'),
('EN', 'admin.edit_user.new_password', 'New Password'),
('EN', 'admin.edit_user.new_password_hint', 'Leave blank to keep the current password.'),
('EN', 'admin.edit_user.confirm_password', 'Confirm Password'),
('EN', 'admin.edit_user.save_changes', 'Save Changes'),
('EN', 'admin.edit_user.cancel_button', 'Cancel'),
('EN', 'admin.edit_user.danger_zone', 'Danger Zone'),
('EN', 'admin.edit_user.danger_zone_message', 'These actions cannot be undone.'),
('EN', 'admin.edit_user.activate_button', 'Activate User'),
('EN', 'admin.edit_user.delete_button', 'Delete User'),

('ST', 'admin.edit_user.title', 'Fetola mosebedisi'),
('ST', 'admin.edit_user.subtitle_template', 'Ho fetolwa {username}'),
('ST', 'admin.edit_user.section_account', 'Dintlha tsa akhaonte'),
('ST', 'admin.edit_user.full_name', 'Lebitso le felletseng'),
('ST', 'admin.edit_user.username', 'Lebitso la mosebedisi'),
('ST', 'admin.edit_user.email', 'Imeile'),
('ST', 'admin.edit_user.role', 'Karolo'),
('ST', 'admin.edit_user.ministry', 'Lefapha'),
('ST', 'admin.edit_user.status', 'Boemo'),
('ST', 'admin.edit_user.section_password', 'Phasewete'),
('ST', 'admin.edit_user.new_password', 'Phasewete e ntjha'),
('ST', 'admin.edit_user.new_password_hint', 'Tlohela ho se na letho ho boloka phasewete ya hajoale.'),
('ST', 'admin.edit_user.confirm_password', 'Netefatsa phasewete'),
('ST', 'admin.edit_user.save_changes', 'Boloka diphetoho'),
('ST', 'admin.edit_user.cancel_button', 'Hlakola'),
('ST', 'admin.edit_user.danger_zone', 'Sebaka se kotsi'),
('ST', 'admin.edit_user.danger_zone_message', 'Diketso tsena di ke ke tsa kgutlisetswa morao.'),
('ST', 'admin.edit_user.activate_button', 'Dumella mosebedisi'),
('ST', 'admin.edit_user.delete_button', 'Hlakola mosebedisi');

-- admin.audit.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'admin.audit.title', 'Audit Logs'),
('EN', 'admin.audit.subtitle', 'Record of system activity.'),
('EN', 'admin.audit.filter_user', 'User'),
('EN', 'admin.audit.filter_action', 'Action'),
('EN', 'admin.audit.filter_date', 'Date'),
('EN', 'admin.audit.clear_filters', 'Clear Filters'),
('EN', 'admin.audit.table_timestamp', 'Timestamp'),
('EN', 'admin.audit.table_user', 'User'),
('EN', 'admin.audit.table_action', 'Action'),
('EN', 'admin.audit.table_record', 'Record'),
('EN', 'admin.audit.table_result', 'Result'),
('EN', 'admin.audit.result_success', 'Success'),
('EN', 'admin.audit.result_failed', 'Failed'),
('EN', 'admin.audit.export_button', 'Export'),
('EN', 'admin.audit.print_button', 'Print'),
('EN', 'admin.audit.no_results', 'No audit entries found.'),

('ST', 'admin.audit.title', 'Audit Logs'),
('ST', 'admin.audit.subtitle', 'Rekoto ya diketsahalo tsa sistimi.'),
('ST', 'admin.audit.filter_user', 'Mosebedisi'),
('ST', 'admin.audit.filter_action', 'Ketso'),
('ST', 'admin.audit.filter_date', 'Letsatsi'),
('ST', 'admin.audit.clear_filters', 'Hlakola dikgetho'),
('ST', 'admin.audit.table_timestamp', 'Nako'),
('ST', 'admin.audit.table_user', 'Mosebedisi'),
('ST', 'admin.audit.table_action', 'Ketso'),
('ST', 'admin.audit.table_record', 'Rekoto'),
('ST', 'admin.audit.table_result', 'Sephetho'),
('ST', 'admin.audit.result_success', 'Katleho'),
('ST', 'admin.audit.result_failed', 'E hlotsoe'),
('ST', 'admin.audit.export_button', 'Romela'),
('ST', 'admin.audit.print_button', 'Hatisa'),
('ST', 'admin.audit.no_results', 'Ha ho direkoto tsa audit tse fumanweng.');

-- admin.settings.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'admin.settings.title', 'System Settings'),
('EN', 'admin.settings.section_general', 'General'),
('EN', 'admin.settings.system_name', 'System Name'),
('EN', 'admin.settings.default_language', 'Default Language'),
('EN', 'admin.settings.section_security', 'Security'),
('EN', 'admin.settings.session_timeout', 'Session Timeout (minutes)'),
('EN', 'admin.settings.session_timeout_hint', 'Minutes of inactivity before logout.'),
('EN', 'admin.settings.password_policy', 'Password Policy'),
('EN', 'admin.settings.password_policy_hint', 'Minimum requirements for passwords.'),
('EN', 'admin.settings.failed_login_limit', 'Failed Login Limit'),
('EN', 'admin.settings.failed_login_hint', 'Number of failed attempts before lockout.'),
('EN', 'admin.settings.lockout_duration', 'Lockout Duration (minutes)'),
('EN', 'admin.settings.lockout_hint', 'How long an account stays locked.'),
('EN', 'admin.settings.section_notifications', 'Notifications'),
('EN', 'admin.settings.email_notifications', 'Email Notifications'),
('EN', 'admin.settings.sms_notifications', 'SMS Notifications'),
('EN', 'admin.settings.enabled', 'Enabled'),
('EN', 'admin.settings.disabled', 'Disabled'),
('EN', 'admin.settings.save_button', 'Save'),
('EN', 'admin.settings.cancel_button', 'Cancel'),

('ST', 'admin.settings.title', 'Litlhophiso tsa sistimi'),
('ST', 'admin.settings.section_general', 'Kakaretso'),
('ST', 'admin.settings.system_name', 'Lebitso la sistimi'),
('ST', 'admin.settings.default_language', 'Puo ya kamehla'),
('ST', 'admin.settings.section_security', 'Tshireletso'),
('ST', 'admin.settings.session_timeout', 'Nako ya ho fela ha seshene (metsotso)'),
('ST', 'admin.settings.session_timeout_hint', 'Metsotso ya ho se sebetse pele o tswa.'),
('ST', 'admin.settings.password_policy', 'Leano la phasewete'),
('ST', 'admin.settings.password_policy_hint', 'Ditlhokiswa tsa bonyane bakeng sa diphasewete.'),
('ST', 'admin.settings.failed_login_limit', 'Moedi wa ho hloleha ho kena'),
('ST', 'admin.settings.failed_login_hint', 'Palo ya diteko tse hlotsweng pele ho notlellwa.'),
('ST', 'admin.settings.lockout_duration', 'Nako ya ho notlellwa (metsotso)'),
('ST', 'admin.settings.lockout_hint', 'Nako eo akhaonte e dula e notletswe.'),
('ST', 'admin.settings.section_notifications', 'Litsebiso'),
('ST', 'admin.settings.email_notifications', 'Litsebiso tsa imeile'),
('ST', 'admin.settings.sms_notifications', 'Litsebiso tsa SMS'),
('ST', 'admin.settings.enabled', 'E dumelletswe'),
('ST', 'admin.settings.disabled', 'E timilwe'),
('ST', 'admin.settings.save_button', 'Boloka'),
('ST', 'admin.settings.cancel_button', 'Hlakola');

-- admin.confirm.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'admin.confirm.deactivate_title', 'Deactivate User'),
('EN', 'admin.confirm.deactivate_message', 'Are you sure you want to deactivate {username}?'),
('EN', 'admin.confirm.deactivate_confirm', 'Deactivate'),
('EN', 'admin.confirm.deactivate_cancel', 'Cancel'),
('EN', 'admin.confirm.activate_title', 'Activate User'),
('EN', 'admin.confirm.activate_message', 'Are you sure you want to activate {username}?'),
('EN', 'admin.confirm.activate_confirm', 'Activate'),
('EN', 'admin.confirm.delete_title_template', 'Delete {username}'),
('EN', 'admin.confirm.delete_message', 'This action cannot be undone.'),
('EN', 'admin.confirm.delete_message_citizen', 'This will permanently delete the citizen record.'),
('EN', 'admin.confirm.delete_confirm_type', 'Type DELETE to confirm'),
('EN', 'admin.confirm.delete_confirm_button', 'Delete'),
('EN', 'admin.confirm.delete_cancel', 'Cancel'),
('EN', 'admin.confirm.unsaved_title', 'Unsaved Changes'),
('EN', 'admin.confirm.unsaved_message', 'You have unsaved changes. Leave anyway?'),
('EN', 'admin.confirm.unsaved_confirm', 'Leave'),

('ST', 'admin.confirm.deactivate_title', 'Timya mosebedisi'),
('ST', 'admin.confirm.deactivate_message', 'Na o na le bonnete ba hore o batla ho timya {username}?'),
('ST', 'admin.confirm.deactivate_confirm', 'Timya'),
('ST', 'admin.confirm.deactivate_cancel', 'Hlakola'),
('ST', 'admin.confirm.activate_title', 'Dumella mosebedisi'),
('ST', 'admin.confirm.activate_message', 'Na o na le bonnete ba hore o batla ho dumella {username}?'),
('ST', 'admin.confirm.activate_confirm', 'Dumella'),
('ST', 'admin.confirm.delete_title_template', 'Hlakola {username}'),
('ST', 'admin.confirm.delete_message', 'Ketso ena e ke ke ya kgutlisetswa morao.'),
('ST', 'admin.confirm.delete_message_citizen', 'Sena se tla hlakola rekoto ya moahi ka ho sa feleng.'),
('ST', 'admin.confirm.delete_confirm_type', 'Ngola DELETE ho netefatsa'),
('ST', 'admin.confirm.delete_confirm_button', 'Hlakola'),
('ST', 'admin.confirm.delete_cancel', 'Hlakola'),
('ST', 'admin.confirm.unsaved_title', 'Diphetoho tse sa bolokwang'),
('ST', 'admin.confirm.unsaved_message', 'O na le diphetoho tse sa bolokwang. O tlohela?'),
('ST', 'admin.confirm.unsaved_confirm', 'Tlohela');

-- admin.pagination.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'admin.pagination.showing_template', 'Showing {from} to {to} of {total}'),
('EN', 'admin.pagination.previous', 'Previous'),
('EN', 'admin.pagination.next', 'Next'),

('ST', 'admin.pagination.showing_template', 'Ho bontshwa {from} ho isa {to} ho {total}'),
('ST', 'admin.pagination.previous', 'E fetileng'),
('ST', 'admin.pagination.next', 'E latelang');

-- ============================================================
-- MISC / SHARED UI LABELS
-- ============================================================

-- misc.shared.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'misc.shared.required_field', 'Required'),
('EN', 'misc.shared.optional_field', 'Optional'),
('EN', 'misc.shared.upload_file', 'Upload File'),
('EN', 'misc.shared.drag_drop', 'Drag and drop files here, or click to browse.'),
('EN', 'misc.shared.file_too_large', 'File is too large. Maximum size is {size}.'),
('EN', 'misc.shared.invalid_file_type', 'Invalid file type. Allowed: {types}.'),
('EN', 'misc.shared.are_you_sure_delete', 'Are you sure you want to delete this item?'),
('EN', 'misc.shared.operation_successful', 'Operation completed successfully.'),
('EN', 'misc.shared.operation_failed', 'Operation failed. Please try again.'),
('EN', 'misc.shared.no_permission', 'You do not have permission to view this.'),
('EN', 'misc.shared.session_expired', 'Your session has expired. Please login again.'),
('EN', 'misc.shared.unsaved_changes', 'You have unsaved changes.'),
('EN', 'misc.shared.saved_successfully', 'Saved successfully.'),
('EN', 'misc.shared.deleted_successfully', 'Deleted successfully.'),
('EN', 'misc.shared.updated_successfully', 'Updated successfully.'),
('EN', 'misc.shared.created_successfully', 'Created successfully.'),
('EN', 'misc.shared.submitted_successfully', 'Submitted successfully.'),
('EN', 'misc.shared.select_option', '-- Select --'),
('EN', 'misc.shared.enter_value', 'Enter value'),
('EN', 'misc.shared.unknown', 'Unknown'),

('ST', 'misc.shared.required_field', 'E hlokahala'),
('ST', 'misc.shared.optional_field', 'E ka nngwe'),
('ST', 'misc.shared.upload_file', 'Kenya faele'),
('ST', 'misc.shared.drag_drop', 'Hula le ho tlohela difaele mona, kapa tlanya ho batla.'),
('ST', 'misc.shared.file_too_large', 'Faele e kgolo haholo. Boholo bo phahameng ke {size}.'),
('ST', 'misc.shared.invalid_file_type', 'Mofuta wa faele ha o dumellwe. Tse dumelletsweng: {types}.'),
('ST', 'misc.shared.are_you_sure_delete', 'Na o na le bonnete ba hore o batla ho hlakola ntho ena?'),
('ST', 'misc.shared.operation_successful', 'Ketso e phethilwe ka katleho.'),
('ST', 'misc.shared.operation_failed', 'Ketso e hlotsoe. Ka kopo leka hape.'),
('ST', 'misc.shared.no_permission', 'Ha o na tumello ya ho bona sena.'),
('ST', 'misc.shared.session_expired', 'Seshene ya hao e fedile. Ka kopo kena hape.'),
('ST', 'misc.shared.unsaved_changes', 'O na le diphetoho tse sa bolokwang.'),
('ST', 'misc.shared.saved_successfully', 'E bolokilwe ka katleho.'),
('ST', 'misc.shared.deleted_successfully', 'E hlakotswe ka katleho.'),
('ST', 'misc.shared.updated_successfully', 'E ntjhafaditswe ka katleho.'),
('ST', 'misc.shared.created_successfully', 'E thehiloe ka katleho.'),
('ST', 'misc.shared.submitted_successfully', 'E rometswe ka katleho.'),
('ST', 'misc.shared.select_option', '-- Kgetha --'),
('ST', 'misc.shared.enter_value', 'Kenya boleng'),
('ST', 'misc.shared.unknown', 'Ha e tsejwe');

-- ============================================================
-- ACCESSIBILITY LABELS
-- ============================================================

-- aria.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'aria.close_dialog', 'Close dialog'),
('EN', 'aria.open_menu', 'Open menu'),
('EN', 'aria.close_menu', 'Close menu'),
('EN', 'aria.toggle_language', 'Toggle language'),
('EN', 'aria.logout', 'Log out'),
('EN', 'aria.user_menu', 'User menu'),
('EN', 'aria.notifications', 'Notifications'),
('EN', 'aria.search', 'Search'),
('EN', 'aria.filter', 'Filter'),
('EN', 'aria.next_page', 'Next page'),
('EN', 'aria.previous_page', 'Previous page'),
('EN', 'aria.upload_file', 'Upload file'),
('EN', 'aria.remove_file', 'Remove file'),
('EN', 'aria.view_file', 'View file'),
('EN', 'aria.download_file', 'Download file'),
('EN', 'aria.print', 'Print'),
('EN', 'aria.edit', 'Edit'),
('EN', 'aria.delete', 'Delete'),
('EN', 'aria.confirm', 'Confirm'),
('EN', 'aria.cancel', 'Cancel'),
('EN', 'aria.back', 'Back'),
('EN', 'aria.signature_pad', 'Signature pad'),
('EN', 'aria.clear_signature', 'Clear signature'),
('EN', 'aria.capture_fingerprint', 'Capture fingerprint'),
('EN', 'aria.capture_face', 'Capture face'),
('EN', 'aria.status_badge', 'Status: {status}'),

('ST', 'aria.close_dialog', 'Kwala lebokose'),
('ST', 'aria.open_menu', 'Bula lenane'),
('ST', 'aria.close_menu', 'Kwala lenane'),
('ST', 'aria.toggle_language', 'Fetola puo'),
('ST', 'aria.logout', 'Tsoa'),
('ST', 'aria.user_menu', 'Lenane la mosebedisi'),
('ST', 'aria.notifications', 'Litsebiso'),
('ST', 'aria.search', 'Batla'),
('ST', 'aria.filter', 'Sefa'),
('ST', 'aria.next_page', 'Leqephe le latelang'),
('ST', 'aria.previous_page', 'Leqephe le fetileng'),
('ST', 'aria.upload_file', 'Kenya faele'),
('ST', 'aria.remove_file', 'Tlosa faele'),
('ST', 'aria.view_file', 'Sheba faele'),
('ST', 'aria.download_file', 'Khoasolla faele'),
('ST', 'aria.print', 'Hatisa'),
('ST', 'aria.edit', 'Fetola'),
('ST', 'aria.delete', 'Hlakola'),
('ST', 'aria.confirm', 'Tiisa'),
('ST', 'aria.cancel', 'Hlakola'),
('ST', 'aria.back', 'Khutlela'),
('ST', 'aria.signature_pad', 'Sebaka sa ho saena'),
('ST', 'aria.clear_signature', 'Hlakola ho saena'),
('ST', 'aria.capture_fingerprint', 'Nka kgati ya monwana'),
('ST', 'aria.capture_face', 'Nka setshwantsho sa sefahleho'),
('ST', 'aria.status_badge', 'Boemo: {status}');

-- ============================================================
-- DOCUMENTS / BIOMETRICS / SIGNATURE / FILTERS SHARED LABELS
-- ============================================================

-- documents.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'documents.upload.title', 'Upload Document'),
('EN', 'documents.upload.select_type', 'Document Type'),
('EN', 'documents.upload.choose_file', 'Choose File'),
('EN', 'documents.upload.upload_button', 'Upload'),
('EN', 'documents.upload.cancel_button', 'Cancel'),
('EN', 'documents.list.title', 'Documents'),
('EN', 'documents.list.no_documents', 'No documents.'),
('EN', 'documents.list.view', 'View'),
('EN', 'documents.list.download', 'Download'),
('EN', 'documents.list.delete', 'Delete'),
('EN', 'documents.preview.title', 'Document Preview'),
('EN', 'documents.preview.close', 'Close'),
('EN', 'documents.status.pending', 'Pending'),
('EN', 'documents.status.approved', 'Approved'),
('EN', 'documents.status.rejected', 'Rejected'),

('ST', 'documents.upload.title', 'Kenya tokomane'),
('ST', 'documents.upload.select_type', 'Mofuta wa tokomane'),
('ST', 'documents.upload.choose_file', 'Kgetha faele'),
('ST', 'documents.upload.upload_button', 'Kenya'),
('ST', 'documents.upload.cancel_button', 'Hlakola'),
('ST', 'documents.list.title', 'Ditokomane'),
('ST', 'documents.list.no_documents', 'Ha ho ditokomane.'),
('ST', 'documents.list.view', 'Sheba'),
('ST', 'documents.list.download', 'Khoasolla'),
('ST', 'documents.list.delete', 'Hlakola'),
('ST', 'documents.preview.title', 'Ponelopele ya tokomane'),
('ST', 'documents.preview.close', 'Kwala'),
('ST', 'documents.status.pending', 'E emetse'),
('ST', 'documents.status.approved', 'E amohetsoe'),
('ST', 'documents.status.rejected', 'E lahliloe');

-- biometrics.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'biometrics.enrollment.title', 'Biometric Enrollment'),
('EN', 'biometrics.enrollment.instruction', 'Capture fingerprints and facial image.'),
('EN', 'biometrics.fingerprint.title', 'Fingerprint Capture'),
('EN', 'biometrics.fingerprint.instruction', 'Place finger on the scanner.'),
('EN', 'biometrics.fingerprint.capture_button', 'Capture'),
('EN', 'biometrics.fingerprint.retry_button', 'Retry'),
('EN', 'biometrics.facial.title', 'Facial Capture'),
('EN', 'biometrics.facial.instruction', 'Look directly at the camera.'),
('EN', 'biometrics.facial.capture_button', 'Capture'),
('EN', 'biometrics.facial.retry_button', 'Retry'),
('EN', 'biometrics.captured', 'Captured'),
('EN', 'biometrics.not_captured', 'Not captured'),

('ST', 'biometrics.enrollment.title', 'Ngoliso ya biometrics'),
('ST', 'biometrics.enrollment.instruction', 'Nka dikgati le setshwantsho sa sefahleho.'),
('ST', 'biometrics.fingerprint.title', 'Ho nka kgati ya monwana'),
('ST', 'biometrics.fingerprint.instruction', 'Beha monwana hodima sekena.'),
('ST', 'biometrics.fingerprint.capture_button', 'Nka'),
('ST', 'biometrics.fingerprint.retry_button', 'Leka hape'),
('ST', 'biometrics.facial.title', 'Ho nka setshwantsho sa sefahleho'),
('ST', 'biometrics.facial.instruction', 'Sheba ka ho otloloha khamereng.'),
('ST', 'biometrics.facial.capture_button', 'Nka'),
('ST', 'biometrics.facial.retry_button', 'Leka hape'),
('ST', 'biometrics.captured', 'E nkiloe'),
('ST', 'biometrics.not_captured', 'Ha e a nkwa');

-- signature.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'signature.pad.title', 'Signature'),
('EN', 'signature.pad.instruction', 'Sign in the box below.'),
('EN', 'signature.pad.clear', 'Clear'),
('EN', 'signature.pad.confirm', 'Confirm Signature'),
('EN', 'signature.confirm.title', 'Confirm Signature'),
('EN', 'signature.confirm.message', 'Is this signature correct?'),
('EN', 'signature.confirm.yes', 'Yes'),
('EN', 'signature.confirm.no', 'No'),

('ST', 'signature.pad.title', 'Ho saena'),
('ST', 'signature.pad.instruction', 'Saina ka lebokoseng le ka tlase.'),
('ST', 'signature.pad.clear', 'Hlakola'),
('ST', 'signature.pad.confirm', 'Tiisa ho saena'),
('ST', 'signature.confirm.title', 'Tiisa ho saena'),
('ST', 'signature.confirm.message', 'Na ho saena hona ho nepahetse?'),
('ST', 'signature.confirm.yes', 'E'),
('ST', 'signature.confirm.no', 'Che');

-- filters.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'filters.bar.apply', 'Apply Filters'),
('EN', 'filters.bar.clear', 'Clear'),
('EN', 'filters.bar.reset', 'Reset'),
('EN', 'filters.clear.button', 'Clear Filters'),

('ST', 'filters.bar.apply', 'Sebedisa dikgetho'),
('ST', 'filters.bar.clear', 'Hlakola'),
('ST', 'filters.bar.reset', 'Seta botjha'),
('ST', 'filters.clear.button', 'Hlakola dikgetho');

-- ============================================================
-- MINISTRY SHARED LABELS
-- ============================================================

-- ministry.shared.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'ministry.shared.citizen_information', 'Citizen Information'),
('EN', 'ministry.shared.verified_details', 'Verified Details'),
('EN', 'ministry.shared.not_verified', 'Not yet verified'),
('EN', 'ministry.shared.read_only', 'This information is read-only.'),
('EN', 'ministry.shared.service_card.available', 'Available'),
('EN', 'ministry.shared.service_card.unavailable', 'Unavailable'),
('EN', 'ministry.shared.service_card.start', 'Start'),

('ST', 'ministry.shared.citizen_information', 'Tlhahisoleseding ya moahi'),
('ST', 'ministry.shared.verified_details', 'Dintlha tse netefaditsweng'),
('ST', 'ministry.shared.not_verified', 'Ha e so netefatswe'),
('ST', 'ministry.shared.read_only', 'Tlhahisoleseding ena e ka balwa feela.'),
('ST', 'ministry.shared.service_card.available', 'E a fumaneha'),
('ST', 'ministry.shared.service_card.unavailable', 'Ha e fumanehe'),
('ST', 'ministry.shared.service_card.start', 'Qala');

-- ============================================================
-- HEADER / LAYOUT SHARED LABELS
-- ============================================================

-- header.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'header.logout', 'Logout'),
('EN', 'header.profile', 'Profile'),
('EN', 'header.settings', 'Settings'),
('EN', 'header.help', 'Help'),

('ST', 'header.logout', 'Tsoa'),
('ST', 'header.profile', 'Profaele'),
('ST', 'header.settings', 'Litlhophiso'),
('ST', 'header.help', 'Thuso');

-- layout.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'layout.admin.title', 'Administration'),
('EN', 'layout.citizen.title', 'Citizen Portal'),
('EN', 'layout.staff.title', 'Staff Portal'),

('ST', 'layout.admin.title', 'Tsamaiso'),
('ST', 'layout.citizen.title', 'Portal ya Moahi'),
('ST', 'layout.staff.title', 'Portal ya Basebetsi');

-- ============================================================
-- CONFIRM / DIALOG SHARED
-- ============================================================

-- confirm.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'confirm.default_title', 'Please Confirm'),
('EN', 'confirm.default_message', 'Are you sure you want to proceed?'),
('EN', 'confirm.default_confirm', 'Confirm'),
('EN', 'confirm.default_cancel', 'Cancel'),

('ST', 'confirm.default_title', 'Ka kopo tiisa'),
('ST', 'confirm.default_message', 'Na o na le bonnete ba hore o batla ho tswela pele?'),
('ST', 'confirm.default_confirm', 'Tiisa'),
('ST', 'confirm.default_cancel', 'Hlakola');

COMMIT;