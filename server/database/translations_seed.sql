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
--
-- Important:
--   This file starts with DELETE FROM translations, so only run
--   it ONCE on a fresh database. Additional translations
--   introduced after a live deployment must go into a numbered
--   migration (see /server/src/database/migrations/), not this
--   file.
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

('ST', 'auth.welcome.title', 'Rea u amohela Sistiming e Kopaneng ea Litšebeletso tsa ’Muso'),
('ST', 'auth.welcome.tagline', 'Fumana litšebeletso tsa ’muso kapele le ka polokeho.'),
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

('ST', 'auth.register.title', 'Theha akhaonto'),
('ST', 'auth.register.subtitle', 'Ngolisa ho fumana litšebeletso tsa ’muso.'),
('ST', 'auth.register.username', 'Lebitso la mosebelisi'),
('ST', 'auth.register.email', 'Imeile'),
('ST', 'auth.register.password', 'Phasewete'),
('ST', 'auth.register.confirm_password', 'Netefatsa phasewete'),
('ST', 'auth.register.password_hint', 'Bonyane litlhaku tse 8, ho kenyeletsoa nomoro e le ’ngoe.'),
('ST', 'auth.register.submit', 'Ngolisa'),
('ST', 'auth.register.link_login', 'O se o na le akhaonto? Kena');

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
('ST', 'auth.login.subtitle', 'Kenya lintlha tsa hao tsa ho kena hore u tsoele pele.'),
('ST', 'auth.login.username', 'Lebitso la mosebelisi'),
('ST', 'auth.login.password', 'Phasewete'),
('ST', 'auth.login.submit', 'Kena'),
('ST', 'auth.login.forgot_link', 'O lebetse phasewete?'),
('ST', 'auth.login.register_link', 'Theha akhaonto'),
('ST', 'auth.login.staff_link', 'Kena ha basebetsi'),
('ST', 'auth.login.admin_link', 'Kena ha motsamaisi');

-- auth.staff_login.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'auth.staff_login.title', 'Staff Login'),
('EN', 'auth.staff_login.subtitle', 'Sign in with your government staff account.'),
('EN', 'auth.staff_login.username', 'Username'),
('EN', 'auth.staff_login.password', 'Password'),
('EN', 'auth.staff_login.submit', 'Login'),
('EN', 'auth.staff_login.back_link', 'Back to citizen login'),

('ST', 'auth.staff_login.title', 'Kena ha Basebetsi'),
('ST', 'auth.staff_login.subtitle', 'Kena ka akhaonto ea hao ea mmuso.'),
('ST', 'auth.staff_login.username', 'Lebitso la mosebelisi'),
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

('ST', 'auth.admin_login.title', 'Kena ha motsamaisi'),
('ST', 'auth.admin_login.subtitle', 'Kena ka akhaonto ea hao ea motsamaisi.'),
('ST', 'auth.admin_login.username', 'Lebitso la mosebelisi'),
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

('ST', 'auth.forgot_password.title', 'Seta phasewete ea hao botjha'),
('ST', 'auth.forgot_password.subtitle', 'Kenya aterese ea hao ea imeile mme re tla romela litaelo tsa ho e seta botjha.'),
('ST', 'auth.forgot_password.email', 'Imeile'),
('ST', 'auth.forgot_password.submit', 'Romela'),
('ST', 'auth.forgot_password.back_link', 'Khutlela ho kena');

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
('ST', 'auth.errors.invalid_email', 'Ka kopo kenya aterese ea imeile ha e nepahaleng.'),
('ST', 'auth.errors.password_short', 'Phasewete e lokela ho ba bonyane litlhaku tse 8.'),
('ST', 'auth.errors.password_no_number', 'Phasewete e lokela ho ba le bonyane nomoro e le nngwe.'),
('ST', 'auth.errors.password_mismatch', 'Liphasewete ha li tšoane.'),
('ST', 'auth.errors.username_taken', 'Lebitso lena la mosebelisi le se le rekotiloe.'),
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

('ST', 'nav.citizen.dashboard', 'Letlapa la litšebeletso'),
('ST', 'nav.citizen.profile', 'Profaele'),
('ST', 'nav.citizen.applications', 'Likopo'),
('ST', 'nav.citizen.documents', 'Litokomane'),
('ST', 'nav.citizen.notifications', 'Litsebiso');

-- nav.admin.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.admin.dashboard', 'Dashboard'),
('EN', 'nav.admin.users', 'Users'),
('EN', 'nav.admin.audit_logs', 'Audit Logs'),
('EN', 'nav.admin.settings', 'Settings'),

('ST', 'nav.admin.dashboard', 'Letlapa la litšebeletso'),
('ST', 'nav.admin.users', 'Basebelisi'),
('ST', 'nav.admin.audit_logs', 'Lirekoto tsa tlhahlobo'),
('ST', 'nav.admin.settings', 'Litlhophiso');

-- nav.home_affairs.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.home_affairs.dashboard', 'Dashboard'),
('EN', 'nav.home_affairs.registrations', 'Registrations'),
('EN', 'nav.home_affairs.search', 'Search'),
('EN', 'nav.home_affairs.reports', 'Reports'),

('ST', 'nav.home_affairs.dashboard', 'Letlapa la litšebeletso'),
('ST', 'nav.home_affairs.registrations', 'Lingoliso'),
('ST', 'nav.home_affairs.search', 'Batla'),
('ST', 'nav.home_affairs.reports', 'Litlaleho');

-- nav.traffic.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.traffic.dashboard', 'Dashboard'),
('EN', 'nav.traffic.processing', 'Processing'),

('ST', 'nav.traffic.dashboard', 'Letlapa la litšebeletso'),
('ST', 'nav.traffic.processing', 'Tsamaiso');

-- nav.police.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.police.dashboard', 'Dashboard'),
('EN', 'nav.police.cases', 'Cases'),

('ST', 'nav.police.dashboard', 'Letlapa la litšebeletso'),
('ST', 'nav.police.cases', 'Dinyewe');

-- nav.finance.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.finance.dashboard', 'Dashboard'),

('ST', 'nav.finance.dashboard', 'Letlapa la litšebeletso');

-- nav.pensions.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.pensions.dashboard', 'Dashboard'),
('EN', 'nav.pensions.process', 'Process'),

('ST', 'nav.pensions.dashboard', 'Letlapa la litšebeletso'),
('ST', 'nav.pensions.process', 'Sebetsa');

-- nav.passport.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'nav.passport.dashboard', 'Dashboard'),
('EN', 'nav.passport.process', 'Process'),
('EN', 'nav.passport.history', 'History'),

('ST', 'nav.passport.dashboard', 'Letlapa la litšebeletso'),
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
('ST', 'nav.sidebar_label.admin', 'motsamaisi'),
('ST', 'nav.sidebar_label.home_affairs', 'Tsa Lehae'),
('ST', 'nav.sidebar_label.traffic', 'Tsa Sephethephethe'),
('ST', 'nav.sidebar_label.police', 'Sepolesa'),
('ST', 'nav.sidebar_label.finance', 'Tsa Lichelete'),
('ST', 'nav.sidebar_label.pensions', 'Litšebeletso tsa penshene'),
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
('ST', 'btn.update', 'Ntlafatsa'),
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
('ST', 'btn.clear_filters', 'Hlakola likgetho'),
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
('ST', 'common.no_results', 'Ha ho liphetho tse fumanoeng.'),
('ST', 'common.all', 'Tsohle'),
('ST', 'common.none', 'Ha ho letho'),
('ST', 'common.other', 'Tse ling'),
('ST', 'common.select', 'Kgetha'),
('ST', 'common.choose', 'Kgetha'),
('ST', 'common.actions', 'Liketso'),
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
('ST', 'common.updated_at', 'E ntlafalitsoeng ka'),
('ST', 'common.notes', 'Lintlha'),
('ST', 'common.reason', 'Lebaka'),
('ST', 'common.confirm_action', 'Tiisa ketso'),
('ST', 'common.are_you_sure', 'Na u na le bonnete?'),
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
('ST', 'err.unauthorized', 'Ha u a dumellwa ho etsa ketso ena.'),
('ST', 'err.forbidden', 'Ho kena ho hanetswe.'),
('ST', 'err.network', 'Phoso ea netweke. Ka kopo hlahloba kgokelo ea hao.'),
('ST', 'err.timeout', 'Kopo e fetile nako. Ka kopo leka hape.'),
('ST', 'err.invalid_credentials', 'Lebitso la mosebelisi kapa phasewete ha ha e nepahale.');

-- alert.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'alert.success', 'Success'),
('EN', 'alert.warning', 'Warning'),
('EN', 'alert.error', 'Error'),
('EN', 'alert.info', 'Information'),

('ST', 'alert.success', 'Katleho'),
('ST', 'alert.warning', 'Temoso'),
('ST', 'alert.error', 'Phoso'),
('ST', 'alert.info', 'Tlhahisoleseling');

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
('ST', 'status.captured', 'E rekotiloe'),
('ST', 'status.verified', 'E netefalitsoe');

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

('ST', 'citizen.dashboard.title', 'Letlapa la litšebeletso la moahi'),
('ST', 'citizen.dashboard.welcome', 'Rea u amohela, {name}'),
('ST', 'citizen.dashboard.identity_verified', 'Boitsebiso ba hao bo netefalitsoe.'),
('ST', 'citizen.dashboard.verified_by', 'E netefalitsoe ke {ministry}'),
('ST', 'citizen.dashboard.verify_now', 'Netefatsa hona jwale'),
('ST', 'citizen.dashboard.waiting_for_home_affairs', 'E emetse tsa Lehae'),
('ST', 'citizen.dashboard.waiting_subtitle', 'Netefatso ea boitsebiso ba hao e emetse.'),
('ST', 'citizen.dashboard.services_title', 'Litšebeletso tse fumanehang'),
('ST', 'citizen.dashboard.applications_title', 'Likopo tsa ka'),
('ST', 'citizen.dashboard.view_applications', 'Sheba likopo');

-- citizen.profile.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.profile.title', 'My Profile'),
('EN', 'citizen.profile.subtitle', 'Your personal information on file.'),
('EN', 'citizen.profile.personal_info', 'Personal Information'),
('EN', 'citizen.profile.contact_info', 'Contact Information'),
('EN', 'citizen.profile.last_updated', 'Last updated {date}'),
('EN', 'citizen.profile.change_password', 'Change Password'),
('EN', 'citizen.profile.visit_home_affairs', 'Visit a Home Affairs office to update your record.'),

('ST', 'citizen.profile.title', 'Profaele ea ka'),
('ST', 'citizen.profile.subtitle', 'Boitsebiso ba hao ba botho bo bolokilweng.'),
('ST', 'citizen.profile.personal_info', 'Boitsebiso ba botho'),
('ST', 'citizen.profile.contact_info', 'Boitsebiso ba ho ikopanya'),
('ST', 'citizen.profile.last_updated', 'E ntlafalitsoeng la {date}'),
('ST', 'citizen.profile.change_password', 'Fetola phasewete'),
('ST', 'citizen.profile.visit_home_affairs', 'Etela ofisi ea Litaba tsa Lehae ho ntlafatsa rekoto ea hao.');

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

('ST', 'citizen.verify.title', 'Netefatso ea boitsebiso'),
('ST', 'citizen.verify.explanation', 'Kenya phasewete ea hao ho qala netefatso.'),
('ST', 'citizen.verify.password_label', 'Phasewete'),
('ST', 'citizen.verify.continue', 'Tsoela pele'),
('ST', 'citizen.verify.success_title', 'Netefatso e atlehile'),
('ST', 'citizen.verify.success_message', 'Boitsebiso ba hao bo netefalitsoe.'),
('ST', 'citizen.verify.access_service', 'Fumana tshebeletso'),
('ST', 'citizen.verify.pending_title', 'Netefatso e emetse'),
('ST', 'citizen.verify.pending_message', 'Netefatso ea hao e ntse e sebetswa.'),
('ST', 'citizen.verify.back_to_dashboard', 'Khutlela ho Letlapa la litšebeletso'),
('ST', 'citizen.verify.find_office', 'Fumana ofisi'),
('ST', 'citizen.verify.failure_title', 'Netefatso e hlotsoe'),
('ST', 'citizen.verify.failure_wrong_password', 'Phasewete eo o e kentseng ha ha e nepahale.'),
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
('ST', 'citizen.change_password.subtitle', 'Kenya phasewete ea hao ea hona joale mme o kgetha e ntjha.'),
('ST', 'citizen.change_password.current_password', 'Phasewete ea hona joale'),
('ST', 'citizen.change_password.new_password', 'Phasewete e ntjha'),
('ST', 'citizen.change_password.confirm_password', 'Netefatsa phasewete e ntjha'),
('ST', 'citizen.change_password.save_password', 'Boloka phasewete'),
('ST', 'citizen.change_password.password_hint', 'Bonyane litlhaku tse 8, ho kenyeletswa nomoro e le nngwe.');

-- citizen.applications.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.applications.title', 'My Applications'),
('EN', 'citizen.applications.reference', 'Reference'),
('EN', 'citizen.applications.service', 'Service'),
('EN', 'citizen.applications.date_submitted', 'Date Submitted'),
('EN', 'citizen.applications.status', 'Status'),
('EN', 'citizen.applications.no_results', 'You have no applications yet.'),

('ST', 'citizen.applications.title', 'Likopo tsa ka'),
('ST', 'citizen.applications.reference', 'Nomoro ea tšupiso'),
('ST', 'citizen.applications.service', 'Tshebeletso'),
('ST', 'citizen.applications.date_submitted', 'Letsatsi le rometsoengng'),
('ST', 'citizen.applications.status', 'Boemo'),
('ST', 'citizen.applications.no_results', 'Ha u so be le likopo.');

-- citizen.documents.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.documents.title', 'My Documents'),
('EN', 'citizen.documents.no_documents', 'You have no documents on file.'),
('EN', 'citizen.documents.upload_button', 'Upload Document'),
('EN', 'citizen.documents.delete_confirm', 'Are you sure you want to delete this document?'),

('ST', 'citizen.documents.title', 'Litokomane tsa ka'),
('ST', 'citizen.documents.no_documents', 'Ha u na litokomane tse bolokilweng.'),
('ST', 'citizen.documents.upload_button', 'Kenya tokomane'),
('ST', 'citizen.documents.delete_confirm', 'Na u na le bonnete ba hore o batla ho hlakola tokomane ena?');

-- citizen.notifications.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'citizen.notifications.title', 'Notifications'),
('EN', 'citizen.notifications.no_notifications', 'You have no notifications.'),
('EN', 'citizen.notifications.delete_confirm', 'Are you sure you want to delete this notification?'),

('ST', 'citizen.notifications.title', 'Litsebiso'),
('ST', 'citizen.notifications.no_notifications', 'Ha u na litsebiso.'),
('ST', 'citizen.notifications.delete_confirm', 'Na u na le bonnete ba hore o batla ho hlakola tsebiso ena?');

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

('ST', 'home_affairs.dashboard.title', 'Letlapa la litšebeletso ea tsa Lehae'),
('ST', 'home_affairs.dashboard.new_registrations', 'Lingoliso tse ntjha'),
('ST', 'home_affairs.dashboard.details_captured', 'Lintlha tse nkilweng'),
('ST', 'home_affairs.dashboard.verified_citizens', 'Baahi ba netefalitsoeng'),
('ST', 'home_affairs.dashboard.updated_today', 'E ntlafalitsoeng kajeno'),
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

('ST', 'home_affairs.registrations.title', 'Lingoliso tse ntjha'),
('ST', 'home_affairs.registrations.subtitle', 'Baahi ba emetseng ho phethwa ha rekoto.'),
('ST', 'home_affairs.registrations.filter_status', 'Boemo'),
('ST', 'home_affairs.registrations.filter_date', 'Letsatsi'),
('ST', 'home_affairs.registrations.filter_search', 'Batla'),
('ST', 'home_affairs.registrations.clear_filters', 'Hlakola likgetho'),
('ST', 'home_affairs.registrations.table_username', 'Lebitso la mosebelisi'),
('ST', 'home_affairs.registrations.table_date', 'Letsatsi la ngoliso'),
('ST', 'home_affairs.registrations.table_status', 'Boemo'),
('ST', 'home_affairs.registrations.table_national_id', 'Nomoro ea boitsebiso'),
('ST', 'home_affairs.registrations.table_actions', 'Liketso'),
('ST', 'home_affairs.registrations.open_button', 'Bula'),
('ST', 'home_affairs.registrations.no_results', 'Ha ho lingoliso tse fumanoeng.');

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

('ST', 'home_affairs.complete_record.title', 'Phetha rekoto ea moahi'),
('ST', 'home_affairs.complete_record.username', 'Lebitso la mosebelisi'),
('ST', 'home_affairs.complete_record.date_registered', 'Letsatsi la ngoliso'),
('ST', 'home_affairs.complete_record.national_id_label', 'Nomoro ea boitsebiso'),
('ST', 'home_affairs.complete_record.national_id_auto', 'Nomoro e tla iketsetsoa ha u boloka rekoto.'),
('ST', 'home_affairs.complete_record.section_personal', 'Lintlha tsa botho'),
('ST', 'home_affairs.complete_record.section_contact', 'Lintlha tsa ho ikopanya'),
('ST', 'home_affairs.complete_record.section_documents', 'Litokomane'),
('ST', 'home_affairs.complete_record.section_biometrics', 'Lintlha tsa boitsebiso ba ''mele'),
('ST', 'home_affairs.complete_record.full_name', 'Lebitso le felletseng'),
('ST', 'home_affairs.complete_record.date_of_birth', 'Letsatsi la tsoalo'),
('ST', 'home_affairs.complete_record.gender', 'Bong'),
('ST', 'home_affairs.complete_record.place_of_birth', 'Sebaka sa tsoalo'),
('ST', 'home_affairs.complete_record.nationality', 'Bochaba'),
('ST', 'home_affairs.complete_record.phone', 'Mohala'),
('ST', 'home_affairs.complete_record.email', 'Imeile'),
('ST', 'home_affairs.complete_record.village', 'Motse'),
('ST', 'home_affairs.complete_record.district', 'Setereke'),
('ST', 'home_affairs.complete_record.postal_address', 'Aterese ea poso'),
('ST', 'home_affairs.complete_record.upload_national_id', 'Kenya tokomane ea boitsebiso'),
('ST', 'home_affairs.complete_record.upload_birth_certificate', 'Kenya setifikeiti sa tsoalo'),
('ST', 'home_affairs.complete_record.upload_photo', 'Kenya senepe'),
('ST', 'home_affairs.complete_record.biometric_instruction', 'Rekota likhatiso tsa menoana le setšoantšo sa sefahleho.'),
('ST', 'home_affairs.complete_record.save_record', 'Boloka rekoto'),
('ST', 'home_affairs.complete_record.cancel', 'Hlakola'),
('ST', 'home_affairs.complete_record.ready_to_save', 'E loketse ho bolokwa'),
('ST', 'home_affairs.complete_record.prints_captured', 'Dikgati di nkiloe'),
('ST', 'home_affairs.complete_record.capture_required', 'Ho hlokahala ho rekota lintlha');

-- home_affairs.record_saved.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'home_affairs.record_saved.title', 'Record Saved'),
('EN', 'home_affairs.record_saved.message', 'The citizen record has been saved successfully.'),
('EN', 'home_affairs.record_saved.national_id_label', 'National ID'),
('EN', 'home_affairs.record_saved.print_slip', 'Print Slip'),
('EN', 'home_affairs.record_saved.continue_to_verification', 'Continue to Verification'),
('EN', 'home_affairs.record_saved.back_to_registrations', 'Back to Registrations'),

('ST', 'home_affairs.record_saved.title', 'Rekoto e bolokilwe'),
('ST', 'home_affairs.record_saved.message', 'Rekoto ea moahi e bolokilwe ka katleho.'),
('ST', 'home_affairs.record_saved.national_id_label', 'Nomoro ea boitsebiso'),
('ST', 'home_affairs.record_saved.print_slip', 'Hatisa setlankana'),
('ST', 'home_affairs.record_saved.continue_to_verification', 'Tsoela pele ho netefatso'),
('ST', 'home_affairs.record_saved.back_to_registrations', 'Khutlela ho lingoliso');

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
('ST', 'home_affairs.verify.checklist_id', 'Tokomane ea nomoro ea boitsebiso e hlahlobilwe'),
('ST', 'home_affairs.verify.checklist_birth', 'Setifikeiti sa tsoalo se hlahlobilwe'),
('ST', 'home_affairs.verify.checklist_address', 'Bopaki ba aterese bo hlahlobilwe'),
('ST', 'home_affairs.verify.checklist_photo', 'Senepe se tšoana le moahi'),
('ST', 'home_affairs.verify.confirm_verification', 'Tiisa netefatso'),
('ST', 'home_affairs.verify.notes_label', 'Lintlha'),
('ST', 'home_affairs.verify.verified_by_message', 'E netefalitsoe ke {name} ka {date}');

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
('ST', 'home_affairs.search.search_label', 'Batla ka lebitso kapa nomoro ea boitsebiso'),
('ST', 'home_affairs.search.search_hint', 'Kenya bonyane litlhaku tse tharo.'),
('ST', 'home_affairs.search.search_button', 'Batla'),
('ST', 'home_affairs.search.citizen_found', 'Moahi o fumanoe'),
('ST', 'home_affairs.search.view_profile', 'Sheba profaele'),
('ST', 'home_affairs.search.no_citizen', 'Ha ho moahi ea fumanoeng ho latela patlisiso ea hao.');

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

('ST', 'home_affairs.reports.title', 'Litlaleho'),
('ST', 'home_affairs.reports.subtitle', 'Hlahisa le ho romela litlaleho tsa ngoliso.'),
('ST', 'home_affairs.reports.report_type', 'Mofuta wa tlaleho'),
('ST', 'home_affairs.reports.date_range', 'Nako ea matsatsi'),
('ST', 'home_affairs.reports.generate_preview', 'Hlahisa ponelopele'),
('ST', 'home_affairs.reports.clear_filters', 'Hlakola likgetho'),
('ST', 'home_affairs.reports.citizens_registered', 'Baahi ba ngolisitsweng'),
('ST', 'home_affairs.reports.citizens_verified', 'Baahi ba netefalitsoeng'),
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

('ST', 'traffic.dashboard.title', 'Litšebeletso tsa Sephethephethe'),
('ST', 'traffic.dashboard.subtitle', 'Laola laesense ea hao le linako tsa likopano.'),
('ST', 'traffic.dashboard.view_licence', 'Sheba laesense'),
('ST', 'traffic.dashboard.renew_licence', 'Ntlafatsa laesense'),
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

('ST', 'traffic.licence.title', 'Laesense ea ho kgweetsa'),
('ST', 'traffic.licence.licence_number', 'Nomoro ea laesense'),
('ST', 'traffic.licence.full_name', 'Lebitso le felletseng'),
('ST', 'traffic.licence.licence_type', 'Mofuta wa laesense'),
('ST', 'traffic.licence.issue_date', 'Letsatsi la ho ntshwa'),
('ST', 'traffic.licence.expiry_date', 'Letsatsi la ho fela'),
('ST', 'traffic.licence.status_valid', 'E sebetsa'),
('ST', 'traffic.licence.status_expired', 'E fedile'),
('ST', 'traffic.licence.renew_button', 'Ntlafatsa'),
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

('ST', 'traffic.renew.title', 'Ntlafatsa laesense'),
('ST', 'traffic.renew.step_review', 'Hlahloba'),
('ST', 'traffic.renew.step_payment', 'Tefo'),
('ST', 'traffic.renew.step_confirmation', 'Netefatso'),
('ST', 'traffic.renew.review_title', 'Hlahloba lintlha tsa hao'),
('ST', 'traffic.renew.review_subtitle', 'Netefatsa boitsebiso ba hao pele ho tefo.'),
('ST', 'traffic.renew.continue_payment', 'Tsoela pele ho tefo'),
('ST', 'traffic.renew.payment_title', 'Tefo'),
('ST', 'traffic.renew.mobile_number', 'Nomoro ea mohala'),
('ST', 'traffic.renew.pay_button', 'Lefa'),
('ST', 'traffic.renew.confirmation_title', 'Tefo e netefalitsoe'),
('ST', 'traffic.renew.reference_number', 'Nomoro ea nomoro ea tšupiso'),
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
('ST', 'traffic.appointments.clear_filters', 'Hlakola likgetho'),
('ST', 'traffic.appointments.table_date', 'Letsatsi'),
('ST', 'traffic.appointments.table_time', 'Nako'),
('ST', 'traffic.appointments.table_type', 'Mofuta'),
('ST', 'traffic.appointments.table_location', 'Sebaka'),
('ST', 'traffic.appointments.table_status', 'Boemo'),
('ST', 'traffic.appointments.table_actions', 'Liketso'),
('ST', 'traffic.appointments.cancel_button', 'Hlakola'),
('ST', 'traffic.appointments.no_results', 'Ha ho likopano tse fumanoeng.');

-- traffic.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.staff_dashboard.title', 'Traffic Staff Dashboard'),
('EN', 'traffic.staff_dashboard.pending_applications', 'Pending Applications'),
('EN', 'traffic.staff_dashboard.today_appointments', 'Today''s Appointments'),
('EN', 'traffic.staff_dashboard.licences_issued', 'Licences Issued'),
('EN', 'traffic.staff_dashboard.process_button', 'Process'),

('ST', 'traffic.staff_dashboard.title', 'Letlapa la litšebeletso ea basebetsi ba Sephethephethe'),
('ST', 'traffic.staff_dashboard.pending_applications', 'Likopo tse emetseng'),
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

('ST', 'traffic.processing.title', 'Sebetsa likopo'),
('ST', 'traffic.processing.subtitle', 'Hlahloba le ho sebetsa likopo tse emetseng tsa laesense.'),
('ST', 'traffic.processing.filter_status', 'Boemo'),
('ST', 'traffic.processing.filter_date', 'Letsatsi'),
('ST', 'traffic.processing.clear_filters', 'Hlakola likgetho'),
('ST', 'traffic.processing.table_reference', 'Nomoro ea tšupiso'),
('ST', 'traffic.processing.table_citizen', 'Moahi'),
('ST', 'traffic.processing.table_national_id', 'Nomoro ea boitsebiso'),
('ST', 'traffic.processing.table_date', 'Letsatsi'),
('ST', 'traffic.processing.table_status', 'Boemo'),
('ST', 'traffic.processing.table_actions', 'Liketso'),
('ST', 'traffic.processing.approve', 'Amohela'),
('ST', 'traffic.processing.request_info', 'Kopa tlhahisoleseling'),
('ST', 'traffic.processing.reject', 'Lahla'),
('ST', 'traffic.processing.no_results', 'Ha ho likopo tse fumanoeng.');

-- traffic.issue.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'traffic.issue.title', 'Issue Licence'),
('EN', 'traffic.issue.subtitle', 'Confirm details and issue the licence.'),
('EN', 'traffic.issue.sign_below', 'Sign below'),
('EN', 'traffic.issue.issue_button', 'Issue'),
('EN', 'traffic.issue.cancel_button', 'Cancel'),

('ST', 'traffic.issue.title', 'Ntsha laesense'),
('ST', 'traffic.issue.subtitle', 'Netefatsa lintlha mme o ntshe laesense.'),
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

('ST', 'police.dashboard.title', 'Litšebeletso tsa Sepolesa'),
('ST', 'police.dashboard.subtitle', 'Tlaleha linyeoe ’me u kope setifikeiti sa boitšoaro bo botle.'),
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
('ST', 'police.report.emergency_note', 'Bakeng sa tšohanyetso, letsetsa 112 hang-hang.'),
('ST', 'police.report.case_type', 'Mofuta wa nyeoe'),
('ST', 'police.report.case_type_theft', 'Bosholu'),
('ST', 'police.report.case_type_assault', 'Tlhaselo'),
('ST', 'police.report.case_type_fraud', 'Bomenemene'),
('ST', 'police.report.case_type_missing', 'Motho ea lahlehileng'),
('ST', 'police.report.case_type_other', 'Tse ling'),
('ST', 'police.report.incident_date', 'Letsatsi la ketsahalo'),
('ST', 'police.report.location', 'Sebaka'),
('ST', 'police.report.description', 'Tlhaloso'),
('ST', 'police.report.upload_evidence', 'Kenya bopaki'),
('ST', 'police.report.declaration', 'Boitlamo'),
('ST', 'police.report.declaration_text', 'Ke tiisa hore tlhahisoleseling e fanoeng ke ea nnete.'),
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
('ST', 'police.cases.clear_filters', 'Hlakola likgetho'),
('ST', 'police.cases.table_number', 'Nomoro ea nyeoe'),
('ST', 'police.cases.table_type', 'Mofuta'),
('ST', 'police.cases.table_date', 'Letsatsi'),
('ST', 'police.cases.table_status', 'Boemo'),
('ST', 'police.cases.table_actions', 'Liketso'),
('ST', 'police.cases.view_button', 'Sheba'),
('ST', 'police.cases.no_results', 'Ha ho linyewe tse fumanoeng.');

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

('ST', 'police.case_details.title', 'Lintlha tsa nyeoe'),
('ST', 'police.case_details.case_type', 'Mofuta wa nyeoe'),
('ST', 'police.case_details.date_reported', 'Letsatsi le tlalehilweng'),
('ST', 'police.case_details.incident_date', 'Letsatsi la ketsahalo'),
('ST', 'police.case_details.location', 'Sebaka'),
('ST', 'police.case_details.officer', 'Ofisiri'),
('ST', 'police.case_details.description', 'Tlhaloso'),
('ST', 'police.case_details.status_timeline', 'Tatelano ea boemo'),
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

('ST', 'police.clearance.title', 'Tumello ea sepolesa'),
('ST', 'police.clearance.subtitle', 'Etsa kopo ea setifikeiti sa tumello ea sepolesa.'),
('ST', 'police.clearance.purpose', 'Sepheo'),
('ST', 'police.clearance.station', 'Seteishene sa sepolesa'),
('ST', 'police.clearance.contact_number', 'Nomoro ea ho ikopanya'),
('ST', 'police.clearance.email', 'Imeile'),
('ST', 'police.clearance.upload_national_id', 'Kenya nomoro ea boitsebiso'),
('ST', 'police.clearance.declaration', 'Boitlamo'),
('ST', 'police.clearance.declaration_text', 'Ke tiisa hore tlhahisoleseling e fanoeng ke ea nnete.'),
('ST', 'police.clearance.submit_button', 'Romela'),
('ST', 'police.clearance.cancel_button', 'Hlakola');

-- police.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.staff_dashboard.title', 'Police Staff Dashboard'),
('EN', 'police.staff_dashboard.open_cases', 'Open Cases'),
('EN', 'police.staff_dashboard.closed_cases', 'Closed Cases'),
('EN', 'police.staff_dashboard.pending_updates', 'Pending Updates'),
('EN', 'police.staff_dashboard.manage_button', 'Manage'),

('ST', 'police.staff_dashboard.title', 'Letlapa la litšebeletso ea basebetsi ba Sepolesa'),
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

('ST', 'police.manage.title', 'Laola linyewe'),
('ST', 'police.manage.subtitle', 'Hlahloba le ho ntlafatsa maemo a linyewe.'),
('ST', 'police.manage.filter_status', 'Boemo'),
('ST', 'police.manage.filter_date', 'Letsatsi'),
('ST', 'police.manage.clear_filters', 'Hlakola likgetho'),
('ST', 'police.manage.table_number', 'Nomoro ea nyeoe'),
('ST', 'police.manage.table_citizen', 'Moahi'),
('ST', 'police.manage.table_type', 'Mofuta'),
('ST', 'police.manage.table_date', 'Letsatsi'),
('ST', 'police.manage.table_status', 'Boemo'),
('ST', 'police.manage.table_actions', 'Liketso'),
('ST', 'police.manage.update_button', 'Ntlafatsa'),
('ST', 'police.manage.no_results', 'Ha ho linyewe tse fumanoeng.');

-- police.update.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'police.update.title', 'Update Case'),
('EN', 'police.update.status_label', 'Status'),
('EN', 'police.update.notes_label', 'Notes'),
('EN', 'police.update.save_button', 'Save'),
('EN', 'police.update.cancel_button', 'Cancel'),

('ST', 'police.update.title', 'Ntlafatsa nyeoe'),
('ST', 'police.update.status_label', 'Boemo'),
('ST', 'police.update.notes_label', 'Lintlha'),
('ST', 'police.update.save_button', 'Boloka'),
('ST', 'police.update.cancel_button', 'Hlakola');

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

('ST', 'pensions.dashboard.title', 'Litšebeletso tsa penshene'),
('ST', 'pensions.dashboard.subtitle', 'Sheba lintlha tsa penshene ea hao ’me u netefatse hore li nepahetse.'),
('ST', 'pensions.dashboard.view_info', 'Sheba lintlha tsa penshene'),
('ST', 'pensions.dashboard.perform_verification', 'Etsa netefatso'),
('ST', 'pensions.dashboard.verification_history', 'Histori ea netefatso');

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

('ST', 'pensions.info.title', 'Lintlha tsa penshene'),
('ST', 'pensions.info.pension_type', 'Mofuta oa penshene'),
('ST', 'pensions.info.pension_number', 'Nomoro ea penshene'),
('ST', 'pensions.info.monthly_amount', 'Chelete ea kgwedi le kgwedi'),
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

('ST', 'pensions.verify.title', 'Netefatso ea penshene'),
('ST', 'pensions.verify.subtitle', 'Araba potso ea tšireletso ho netefatsa.'),
('ST', 'pensions.verify.security_question', 'Potso ea tšireletso'),
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
('ST', 'pensions.verify_success.message', 'Netefatso ea penshene ea hao e tlalehiloe.'),
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

('ST', 'pensions.history.title', 'Histori ea netefatso'),
('ST', 'pensions.history.filter_status', 'Boemo'),
('ST', 'pensions.history.filter_method', 'Mokgwa'),
('ST', 'pensions.history.filter_date', 'Letsatsi'),
('ST', 'pensions.history.clear_filters', 'Hlakola likgetho'),
('ST', 'pensions.history.table_date', 'Letsatsi'),
('ST', 'pensions.history.table_status', 'Boemo'),
('ST', 'pensions.history.table_method', 'Mokgwa'),
('ST', 'pensions.history.no_results', 'Ha ho lirekoto tsa netefatso tse fumanoeng.');

-- pensions.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.staff_dashboard.title', 'Pensions Staff Dashboard'),
('EN', 'pensions.staff_dashboard.active_pensioners', 'Active Pensioners'),
('EN', 'pensions.staff_dashboard.verifications_due', 'Verifications Due'),
('EN', 'pensions.staff_dashboard.payments_processed', 'Payments Processed'),
('EN', 'pensions.staff_dashboard.process_button', 'Process'),

('ST', 'pensions.staff_dashboard.title', 'Letlapa la litšebeletso ea basebetsi ba Penshene'),
('ST', 'pensions.staff_dashboard.active_pensioners', 'Batho ba fumanang penshene ba ntseng ba e fumana'),
('ST', 'pensions.staff_dashboard.verifications_due', 'Netefatso tse lokelang ho etsoa'),
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

('ST', 'pensions.process.title', 'Sebetsa likopo tsa penshene'),
('ST', 'pensions.process.subtitle', 'Hlahloba le ho netefatsa lintlha tsa batho ba fumanang penshene.'),
('ST', 'pensions.process.filter_status', 'Boemo'),
('ST', 'pensions.process.clear_filters', 'Hlakola likgetho'),
('ST', 'pensions.process.table_citizen', 'Motho ea fumanang penshene'),
('ST', 'pensions.process.table_national_id', 'Nomoro ea boitsebiso'),
('ST', 'pensions.process.table_last_verified', 'E netefalitsoeng la ho qetela'),
('ST', 'pensions.process.table_status', 'Boemo'),
('ST', 'pensions.process.table_actions', 'Liketso'),
('ST', 'pensions.process.confirm_button', 'Tiisa'),
('ST', 'pensions.process.no_results', 'Ha ho lintlafatso tse fumanoeng.');

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

('ST', 'passport.dashboard.title', 'Litšebeletso tsa Pasepoto'),
('ST', 'passport.dashboard.subtitle', 'Etsa kopo ea pasepoto, ntlafatsa, kapa hlahloba boemo.'),
('ST', 'passport.dashboard.apply', 'Etsa kopo ea pasepoto'),
('ST', 'passport.dashboard.renew', 'Ntlafatsa pasepoto'),
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

('ST', 'passport.apply.title', 'Etsa kopo ea pasepoto'),
('ST', 'passport.apply.step_review', 'Hlahloba'),
('ST', 'passport.apply.step_details', 'Lintlha'),
('ST', 'passport.apply.step_documents', 'Litokomane'),
('ST', 'passport.apply.step_submit', 'Romela'),
('ST', 'passport.apply.review_title', 'Hlahloba tlhahisoleseling ea hao'),
('ST', 'passport.apply.review_subtitle', 'Netefatsa hore lintlha tsa hao di nepahetse pele o tswela pele.'),
('ST', 'passport.apply.continue', 'Tsoela pele'),
('ST', 'passport.apply.details_title', 'Lintlha tsa pasepoto'),
('ST', 'passport.apply.passport_type', 'Mofuta wa pasepoto'),
('ST', 'passport.apply.passport_type_ordinary', 'E tlwaelehileng'),
('ST', 'passport.apply.passport_type_official', 'ea semmuso'),
('ST', 'passport.apply.collection_office', 'Ofisi ea ho nka'),
('ST', 'passport.apply.reason', 'Lebaka la kopo'),
('ST', 'passport.apply.documents_title', 'Kenya litokomane'),
('ST', 'passport.apply.upload_national_id', 'Kenya nomoro ea boitsebiso'),
('ST', 'passport.apply.upload_birth', 'Kenya setifikeiti sa tsoalo'),
('ST', 'passport.apply.upload_photo', 'Kenya senepe'),
('ST', 'passport.apply.photo_requirement', 'Senepe se lokela ho ba sa morao tjena, bokamorao bo hlakileng, ’me u se ke ua roala likhalase.'),
('ST', 'passport.apply.review_submit_title', 'Hlahloba le ho romela'),
('ST', 'passport.apply.summary_title', 'Kakaretso'),
('ST', 'passport.apply.declaration', 'Boitlamo'),
('ST', 'passport.apply.declaration_text', 'Ke tiisa hore tlhahisoleseling e fanoeng ke ea nnete.'),
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

('ST', 'passport.confirmation.title', 'Kopo e rometsoeng'),
('ST', 'passport.confirmation.message', 'Kopo ea hao ea pasepoto e rometsoeng.'),
('ST', 'passport.confirmation.reference_label', 'Nomoro ea tšupiso'),
('ST', 'passport.confirmation.applicant_label', 'Mokopi'),
('ST', 'passport.confirmation.date_label', 'Letsatsi'),
('ST', 'passport.confirmation.passport_type_label', 'Mofuta wa pasepoto'),
('ST', 'passport.confirmation.office_label', 'Ofisi ea ho nka'),
('ST', 'passport.confirmation.keep_safe', 'Boloka nomoro ea tšupiso sebakeng se sireletsehileng.'),
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
('ST', 'passport.status.clear_filters', 'Hlakola likgetho'),
('ST', 'passport.status.table_reference', 'Nomoro ea tšupiso'),
('ST', 'passport.status.table_date', 'Letsatsi'),
('ST', 'passport.status.table_status', 'Boemo'),
('ST', 'passport.status.no_results', 'Ha ho likopo tse fumanoeng.');

-- passport.staff_dashboard.*
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'passport.staff_dashboard.title', 'Passport Staff Dashboard'),
('EN', 'passport.staff_dashboard.pending', 'Pending'),
('EN', 'passport.staff_dashboard.approved_today', 'Approved Today'),
('EN', 'passport.staff_dashboard.rejected_today', 'Rejected Today'),
('EN', 'passport.staff_dashboard.process_button', 'Process'),
('EN', 'passport.staff_dashboard.history_button', 'History'),

('ST', 'passport.staff_dashboard.title', 'Letlapa la litšebeletso ea basebetsi ba Pasepoto'),
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

('ST', 'passport.process.title', 'Sebetsa likopo'),
('ST', 'passport.process.subtitle', 'Hlahloba le ho sebetsa likopo tsa pasepoto tse emetseng.'),
('ST', 'passport.process.filter_status', 'Boemo'),
('ST', 'passport.process.filter_date', 'Letsatsi'),
('ST', 'passport.process.clear_filters', 'Hlakola likgetho'),
('ST', 'passport.process.table_reference', 'Nomoro ea tšupiso'),
('ST', 'passport.process.table_citizen', 'Mokopi'),
('ST', 'passport.process.table_national_id', 'Nomoro ea boitsebiso'),
('ST', 'passport.process.table_date', 'Letsatsi'),
('ST', 'passport.process.table_status', 'Boemo'),
('ST', 'passport.process.table_actions', 'Liketso'),
('ST', 'passport.process.approve', 'Amohela'),
('ST', 'passport.process.request_info', 'Kopa tlhahisoleseling'),
('ST', 'passport.process.reject', 'Lahla'),
('ST', 'passport.process.no_results', 'Ha ho likopo tse fumanoeng.');

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

('ST', 'passport.history.title', 'Histori ea tsamaiso'),
('ST', 'passport.history.filter_status', 'Boemo'),
('ST', 'passport.history.filter_date', 'Letsatsi'),
('ST', 'passport.history.clear_filters', 'Hlakola likgetho'),
('ST', 'passport.history.table_reference', 'Nomoro ea tšupiso'),
('ST', 'passport.history.table_citizen', 'Mokopi'),
('ST', 'passport.history.table_date', 'Letsatsi'),
('ST', 'passport.history.table_status', 'Boemo'),
('ST', 'passport.history.print_button', 'Hatisa'),
('ST', 'passport.history.export_button', 'Romela'),
('ST', 'passport.history.no_results', 'Ha ho histori e fumanoeng.');

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

('ST', 'admin.dashboard.title', 'Letlapa la litšebeletso la motsamaisi'),
('ST', 'admin.dashboard.subtitle', 'Kakaretso ea sistimi le tsamaiso.'),
('ST', 'admin.dashboard.total_users', 'Kakaretso ea basebelisi'),
('ST', 'admin.dashboard.active_staff', 'Basebetsi ba sebetsang'),
('ST', 'admin.dashboard.pending_actions', 'Liketso tse emetseng'),
('ST', 'admin.dashboard.system_health', 'Bophelo ba sistimi'),
('ST', 'admin.dashboard.health_operational', 'E sebetsa'),
('ST', 'admin.dashboard.health_last_checked', 'E hlahlobilweng la ho qetela {time}'),
('ST', 'admin.dashboard.health_failed', 'Tlhahlobo ea bophelo e hlotsoe'),
('ST', 'admin.dashboard.add_user', 'Kenya mosebelisi'),
('ST', 'admin.dashboard.view_audit', 'Sheba Lirekoto tsa tlhahlobo'),
('ST', 'admin.dashboard.recent_activity', 'Ketso ea morao tjena'),
('ST', 'admin.dashboard.no_activity', 'Ha ho ketso ea morao tjena.');

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

('ST', 'admin.users.title', 'Tsamaiso ea basebelisi'),
('ST', 'admin.users.subtitle', 'Laola liakhaonto tsa baahi, basebetsi le balaodi.'),
('ST', 'admin.users.filter_username', 'Lebitso la mosebelisi'),
('ST', 'admin.users.filter_role', 'Karolo'),
('ST', 'admin.users.filter_status', 'Boemo'),
('ST', 'admin.users.clear_filters', 'Hlakola likgetho'),
('ST', 'admin.users.add_user', 'Kenya mosebelisi'),
('ST', 'admin.users.table_username', 'Lebitso la mosebelisi'),
('ST', 'admin.users.table_role', 'Karolo'),
('ST', 'admin.users.table_ministry', 'Lefapha'),
('ST', 'admin.users.table_status', 'Boemo'),
('ST', 'admin.users.table_actions', 'Liketso'),
('ST', 'admin.users.edit', 'Fetola'),
('ST', 'admin.users.deactivate', 'Timya'),
('ST', 'admin.users.activate', 'Dumella'),
('ST', 'admin.users.delete', 'Hlakola'),
('ST', 'admin.users.no_results', 'Ha ho basebelisi ba fumanoeng.'),
('ST', 'admin.users.role_citizen', 'Moahi'),
('ST', 'admin.users.role_staff', 'Mosebetsi'),
('ST', 'admin.users.role_admin', 'motsamaisi'),
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

('ST', 'admin.add_user.title', 'Kenya mosebelisi'),
('ST', 'admin.add_user.subtitle', 'Theha akhaonto e ntjha.'),
('ST', 'admin.add_user.section_account', 'Lintlha tsa akhaonto'),
('ST', 'admin.add_user.full_name', 'Lebitso le felletseng'),
('ST', 'admin.add_user.username', 'Lebitso la mosebelisi'),
('ST', 'admin.add_user.email', 'Imeile'),
('ST', 'admin.add_user.role', 'Karolo'),
('ST', 'admin.add_user.role_hint', 'Kgetha karolo ea akhaonto ena.'),
('ST', 'admin.add_user.ministry', 'Lefapha'),
('ST', 'admin.add_user.ministry_hint', 'E hlokahala bakeng sa liakhaonto tsa basebetsi.'),
('ST', 'admin.add_user.status', 'Boemo'),
('ST', 'admin.add_user.section_password', 'Phasewete'),
('ST', 'admin.add_user.password', 'Phasewete'),
('ST', 'admin.add_user.confirm_password', 'Netefatsa phasewete'),
('ST', 'admin.add_user.password_hint', 'Bonyane litlhaku tse 8, ho kenyeletswa nomoro e le nngwe.'),
('ST', 'admin.add_user.send_credentials', 'Romela lintlha tsa ho kena ho mosebelisi'),
('ST', 'admin.add_user.create_button', 'Theha mosebelisi'),
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

('ST', 'admin.edit_user.title', 'Fetola mosebelisi'),
('ST', 'admin.edit_user.subtitle_template', 'Ho fetolwa {username}'),
('ST', 'admin.edit_user.section_account', 'Lintlha tsa akhaonto'),
('ST', 'admin.edit_user.full_name', 'Lebitso le felletseng'),
('ST', 'admin.edit_user.username', 'Lebitso la mosebelisi'),
('ST', 'admin.edit_user.email', 'Imeile'),
('ST', 'admin.edit_user.role', 'Karolo'),
('ST', 'admin.edit_user.ministry', 'Lefapha'),
('ST', 'admin.edit_user.status', 'Boemo'),
('ST', 'admin.edit_user.section_password', 'Phasewete'),
('ST', 'admin.edit_user.new_password', 'Phasewete e ntjha'),
('ST', 'admin.edit_user.new_password_hint', 'Tlohela ho se na letho ho boloka phasewete ea hona joale.'),
('ST', 'admin.edit_user.confirm_password', 'Netefatsa phasewete'),
('ST', 'admin.edit_user.save_changes', 'Boloka liphetoho'),
('ST', 'admin.edit_user.cancel_button', 'Hlakola'),
('ST', 'admin.edit_user.danger_zone', 'Sebaka se kotsi'),
('ST', 'admin.edit_user.danger_zone_message', 'Liketso tsena di ke ke tsa kgutlisetswa morao.'),
('ST', 'admin.edit_user.activate_button', 'Dumella mosebelisi'),
('ST', 'admin.edit_user.delete_button', 'Hlakola mosebelisi');

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

('ST', 'admin.audit.title', 'Lirekoto tsa tlhahlobo'),
('ST', 'admin.audit.subtitle', 'Rekoto ea liketsahalo tsa sistimi.'),
('ST', 'admin.audit.filter_user', 'Mosebelisi'),
('ST', 'admin.audit.filter_action', 'Ketso'),
('ST', 'admin.audit.filter_date', 'Letsatsi'),
('ST', 'admin.audit.clear_filters', 'Hlakola likgetho'),
('ST', 'admin.audit.table_timestamp', 'Nako'),
('ST', 'admin.audit.table_user', 'Mosebelisi'),
('ST', 'admin.audit.table_action', 'Ketso'),
('ST', 'admin.audit.table_record', 'Rekoto'),
('ST', 'admin.audit.table_result', 'Sephetho'),
('ST', 'admin.audit.result_success', 'Katleho'),
('ST', 'admin.audit.result_failed', 'E hlotsoe'),
('ST', 'admin.audit.export_button', 'Romela'),
('ST', 'admin.audit.print_button', 'Hatisa'),
('ST', 'admin.audit.no_results', 'Ha ho lirekoto tsa audit tse fumanoeng.');

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
('ST', 'admin.settings.default_language', 'Puo ea kamehla'),
('ST', 'admin.settings.section_security', 'Tšireletso'),
('ST', 'admin.settings.session_timeout', 'Nako ea ho fela ha seshene (metsotso)'),
('ST', 'admin.settings.session_timeout_hint', 'Metsotso ea ho se sebetse pele o tswa.'),
('ST', 'admin.settings.password_policy', 'Leano la phasewete'),
('ST', 'admin.settings.password_policy_hint', 'Litlhoko tse fokolang tsa liphasewete.'),
('ST', 'admin.settings.failed_login_limit', 'Moedi wa ho hloleha ho kena'),
('ST', 'admin.settings.failed_login_hint', 'Palo ea liteko tse hlotsoengng pele ho notlellwa.'),
('ST', 'admin.settings.lockout_duration', 'Nako ea ho notlellwa (metsotso)'),
('ST', 'admin.settings.lockout_hint', 'Nako eo akhaonto e dula e notletswe.'),
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

('ST', 'admin.confirm.deactivate_title', 'Timya mosebelisi'),
('ST', 'admin.confirm.deactivate_message', 'Na u na le bonnete ba hore o batla ho timya {username}?'),
('ST', 'admin.confirm.deactivate_confirm', 'Timya'),
('ST', 'admin.confirm.deactivate_cancel', 'Hlakola'),
('ST', 'admin.confirm.activate_title', 'Dumella mosebelisi'),
('ST', 'admin.confirm.activate_message', 'Na u na le bonnete ba hore o batla ho dumella {username}?'),
('ST', 'admin.confirm.activate_confirm', 'Dumella'),
('ST', 'admin.confirm.delete_title_template', 'Hlakola {username}'),
('ST', 'admin.confirm.delete_message', 'Ketso ena e ke ke ea kgutlisetswa morao.'),
('ST', 'admin.confirm.delete_message_citizen', 'Sena se tla hlakola rekoto ea moahi ka ho sa feleng.'),
('ST', 'admin.confirm.delete_confirm_type', 'Ngola DELETE ho netefatsa'),
('ST', 'admin.confirm.delete_confirm_button', 'Hlakola'),
('ST', 'admin.confirm.delete_cancel', 'Hlakola'),
('ST', 'admin.confirm.unsaved_title', 'Diphetoho tse sa bolokwang'),
('ST', 'admin.confirm.unsaved_message', 'U na le liphetoho tse sa bolokwang. O tlohela?'),
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
('ST', 'misc.shared.optional_field', 'Ha se tlamo'),
('ST', 'misc.shared.upload_file', 'Kenya faele'),
('ST', 'misc.shared.drag_drop', 'Hula lifaele u li behe mona, kapa tobetsa ho li batla.'),
('ST', 'misc.shared.file_too_large', 'Faele e kgolo haholo. Boholo bo phahameng ke {size}.'),
('ST', 'misc.shared.invalid_file_type', 'Mofuta wa faele ha u dumellwe. Tse dumelletsweng: {types}.'),
('ST', 'misc.shared.are_you_sure_delete', 'Na u na le bonnete ba hore o batla ho hlakola ntho ena?'),
('ST', 'misc.shared.operation_successful', 'Ketso e phethilwe ka katleho.'),
('ST', 'misc.shared.operation_failed', 'Ketso e hlotsoe. Ka kopo leka hape.'),
('ST', 'misc.shared.no_permission', 'Ha u na tumello ea ho bona sena.'),
('ST', 'misc.shared.session_expired', 'Seshene ea hao e fedile. Ka kopo kena hape.'),
('ST', 'misc.shared.unsaved_changes', 'U na le liphetoho tse sa bolokwang.'),
('ST', 'misc.shared.saved_successfully', 'E bolokilwe ka katleho.'),
('ST', 'misc.shared.deleted_successfully', 'E hlakotsoeng ka katleho.'),
('ST', 'misc.shared.updated_successfully', 'E ntlafalitsoe ka katleho.'),
('ST', 'misc.shared.created_successfully', 'E thehiloe ka katleho.'),
('ST', 'misc.shared.submitted_successfully', 'E rometsoeng ka katleho.'),
('ST', 'misc.shared.select_option', '-- Khetha --'),
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
('ST', 'aria.user_menu', 'Lenane la mosebelisi'),
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
('ST', 'aria.capture_fingerprint', 'Nka kgati ea monwana'),
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
('ST', 'documents.list.title', 'Litokomane'),
('ST', 'documents.list.no_documents', 'Ha ho litokomane.'),
('ST', 'documents.list.view', 'Sheba'),
('ST', 'documents.list.download', 'Khoasolla'),
('ST', 'documents.list.delete', 'Hlakola'),
('ST', 'documents.preview.title', 'Ponelopele ea tokomane'),
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

('ST', 'biometrics.enrollment.title', 'Ngoliso ea biometrics'),
('ST', 'biometrics.enrollment.instruction', 'Nka likgati le setshwantsho sa sefahleho.'),
('ST', 'biometrics.fingerprint.title', 'Ho nka kgati ea monwana'),
('ST', 'biometrics.fingerprint.instruction', 'Beha monwana hodima sekena.'),
('ST', 'biometrics.fingerprint.capture_button', 'Nka'),
('ST', 'biometrics.fingerprint.retry_button', 'Leka hape'),
('ST', 'biometrics.facial.title', 'Ho nka setshwantsho sa sefahleho'),
('ST', 'biometrics.facial.instruction', 'Sheba ka ho otloloha khamereng.'),
('ST', 'biometrics.facial.capture_button', 'Nka'),
('ST', 'biometrics.facial.retry_button', 'Leka hape'),
('ST', 'biometrics.captured', 'E rekotiloe'),
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

('ST', 'filters.bar.apply', 'Sebedisa likgetho'),
('ST', 'filters.bar.clear', 'Hlakola'),
('ST', 'filters.bar.reset', 'Seta botjha'),
('ST', 'filters.clear.button', 'Hlakola likgetho');

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

('ST', 'ministry.shared.citizen_information', 'Tlhahisoleseling ea moahi'),
('ST', 'ministry.shared.verified_details', 'Lintlha tse netefalitsoeng'),
('ST', 'ministry.shared.not_verified', 'Ha e so netefatswe'),
('ST', 'ministry.shared.read_only', 'Tlhahisoleseling ena e ka balwa feela.'),
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
('ST', 'layout.citizen.title', 'Portal ea Moahi'),
('ST', 'layout.staff.title', 'Portal ea Basebetsi');

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
('ST', 'confirm.default_message', 'Na u na le bonnete ba hore u batla ho tsoela pele?'),
('ST', 'confirm.default_confirm', 'Tiisa'),
('ST', 'confirm.default_cancel', 'Hlakola');


-- ============================================================
-- PENSIONS ELIGIBILITY (Group C — core keys, kept in seed so a
-- fresh database has them on first run)
-- ============================================================

INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'pensions.eligibility.eligible', 'You qualify for this pension category.'),
('EN', 'pensions.eligibility.too_young', 'You are below the minimum age.'),
('EN', 'pensions.eligibility.no_government_service', 'Prior government service is required.'),
('EN', 'pensions.eligibility.insufficient_service', 'Not enough years of government service.'),
('EN', 'pensions.eligibility.no_record', 'Citizen record not found.'),
('EN', 'pensions.eligibility.death_certificate', 'A death certificate is on record.'),
('EN', 'pensions.eligibility.no_rules', 'Pension rules are not configured.'),
('EN', 'pensions.eligibility.checking', 'Checking your eligibility…'),
('EN', 'pensions.eligibility.current_age', 'Current age'),
('EN', 'pensions.eligibility.minimum_age', 'Minimum age'),
('EN', 'pensions.eligibility.government_years', 'Government service years'),
('EN', 'pensions.employment.title', 'Employment history'),
('EN', 'pensions.employment.add', 'Add employment'),
('EN', 'pensions.employment.employer', 'Employer name'),
('EN', 'pensions.employment.employer_type', 'Employer type'),
('EN', 'pensions.employment.position', 'Position'),
('EN', 'pensions.employment.start_date', 'Start date'),
('EN', 'pensions.employment.end_date', 'End date'),
('EN', 'pensions.employment.current', 'Current job'),
('EN', 'pensions.employment.notes', 'Notes'),
('EN', 'pensions.employment.empty', 'No employment history recorded.'),

('ST', 'pensions.eligibility.eligible', 'O tšoaneleha bakeng sa mofuta ona oa penshene.'),
('ST', 'pensions.eligibility.too_young', 'O ka tlase ho lilemo tse hlokahalang.'),
('ST', 'pensions.eligibility.no_government_service', 'Ho hlokahala tšebeletso ea mmuso pele.'),
('ST', 'pensions.eligibility.insufficient_service', 'Lilemo tsa tšebeletso ea mmuso ha lia lekana.'),
('ST', 'pensions.eligibility.no_record', 'Rekoto ea moahi ha ea fumanoa.'),
('ST', 'pensions.eligibility.death_certificate', 'Setifikeiti sa lefu se teng rekotong.'),
('ST', 'pensions.eligibility.no_rules', 'Melao ea penshene ha ea hlophisoa.'),
('ST', 'pensions.eligibility.checking', 'Ho hlahloba ho tšoaneleha ha hao…'),
('ST', 'pensions.eligibility.current_age', 'Lilemo tsa hona joale'),
('ST', 'pensions.eligibility.minimum_age', 'Lilemo tse hlokahalang'),
('ST', 'pensions.eligibility.government_years', 'Lilemo tsa tšebeletso ea mmuso'),
('ST', 'pensions.employment.title', 'Nalane ea mosebetsi'),
('ST', 'pensions.employment.add', 'Kenya mosebetsi'),
('ST', 'pensions.employment.employer', 'Lebitso la mohiri'),
('ST', 'pensions.employment.employer_type', 'Mofuta oa mohiri'),
('ST', 'pensions.employment.position', 'Boemo'),
('ST', 'pensions.employment.start_date', 'Letsatsi la ho qala'),
('ST', 'pensions.employment.end_date', 'Letsatsi la ho qeta'),
('ST', 'pensions.employment.current', 'Mosebetsi oa hona joale'),
('ST', 'pensions.employment.notes', 'Lintlha'),
('ST', 'pensions.employment.empty', 'Ha ho nalane ea mosebetsi e tlalehiloeng.');

COMMIT;

-- ================================================================
-- 005_translations_group_i.sql
-- ================================================================
-- Purpose:
--   Adds the translation keys for every new visible label introduced
--   in Groups A, C, D, E, F, and H. The seed file
--   (translations_seed.sql) begins with DELETE FROM translations and
--   should only be run on a fresh database. This migration is
--   append-only and safe to re-run: it uses
--   ON CONFLICT (language_code, translation_key) DO NOTHING, so it
--   never overwrites a translation an admin has already customised.
--
-- Fixed in this version (2026-10-17):
--   - pensions.dashboard.qualify_civil_service — Sesotho value was
--     truncated ("Penshene ea Tšebeletso ea "). Now reads
--     "Penshene ea Tšebeletso ea 'Muso".
--   - employment.history.description — Sesotho value was truncated
--     ("... ea Tšebeletso ea "). Now reads
--     "... ea Tšebeletso ea 'Muso".
--
-- Safe to run more than once.
--
-- Where to run it:
--   Neon / Supabase SQL editor, connected to the project database,
--   as the role that applied schema.sql. Run the whole file in one
--   execution.
--
-- Verify after running:
--   SELECT COUNT(*) FROM translations WHERE language_code = 'EN';
--   SELECT COUNT(*) FROM translations WHERE language_code = 'ST';
--   Both counts should include the new keys below.
--
-- Spot-check:
--   SELECT translation_value FROM translations
--   WHERE language_code = 'ST'
--     AND translation_key = 'pensions.dashboard.qualify_civil_service';
--   Expected: O tšoaneleha — Penshene ea Tšebeletso ea 'Muso
-- ================================================================

BEGIN;

INSERT INTO translations (language_code, translation_key, translation_value) VALUES

-- ────────────────────────────────────────────────────────────────
-- GROUP A — Services catalogue
-- ────────────────────────────────────────────────────────────────
('EN', 'services.list.title', 'Services'),
('EN', 'services.list.intro', 'Choose a service to apply for. Your application will be reviewed by the ministry staff.'),
('EN', 'services.list.information_only', 'Information only — no application required.'),
('EN', 'services.list.apply', 'Apply'),
('EN', 'services.list.no_services_title', 'No services available'),
('EN', 'services.list.no_services_message', 'This ministry has no services enabled at the moment. Please check back later, or choose a different ministry from your dashboard.'),
('EN', 'services.list.back_to_dashboard', 'Back to dashboard'),

('ST', 'services.list.title', 'Litšebeletso'),
('ST', 'services.list.intro', 'Kgetha tšebeletso eo o batlang ho e etsa kopo. Kopo ea hao e tla hlahlobjoa ke basebetsi ba lefapha.'),
('ST', 'services.list.information_only', 'Ke tlhahisoleseling feela — ha ho hlokahale kopo.'),
('ST', 'services.list.apply', 'Etsa kopo'),
('ST', 'services.list.no_services_title', 'Ha ho litšebeletso tse fumanehang'),
('ST', 'services.list.no_services_message', 'Lefapha lena ha le na litšebeletso tse ntseng li sebetsa hona joale. Ka kopo hlahloba hamorao, kapa kgetha lefapha le leng ho tsoa letlapeng la hao.'),
('ST', 'services.list.back_to_dashboard', 'Khutlela letlapeng la litšebeletso'),

-- ────────────────────────────────────────────────────────────────
-- GROUP C — Pension eligibility banner (labels only; the
-- eligibility messages themselves already live in the seed under
-- pensions.eligibility.*)
-- ────────────────────────────────────────────────────────────────
('EN', 'pensions.dashboard.qualify_old_age', 'You qualify — Old Age Pension'),
('EN', 'pensions.dashboard.qualify_civil_service', 'You qualify — Civil Service Pension'),
('EN', 'pensions.dashboard.not_eligible', 'Not eligible at this time'),
('EN', 'pensions.dashboard.current_age_template', 'Your current age is {currentAge}. Minimum age for this category is {minimumAge}.'),
('EN', 'pensions.dashboard.government_years_template', 'Government service on record: {years} year(s).'),
('EN', 'pensions.dashboard.pension_information', 'Pension information'),
('EN', 'pensions.dashboard.view', 'View'),
('EN', 'pensions.dashboard.verify_now', 'Verify now'),
('EN', 'pensions.dashboard.verification_history', 'Verification history'),
('EN', 'pensions.dashboard.verification_history_subtitle', 'Previous life verifications on your record.'),
('EN', 'pensions.dashboard.pension_application', 'Pension application'),
('EN', 'pensions.dashboard.pension_application_subtitle', 'Apply for a pension.'),
('EN', 'pensions.dashboard.pension_application_locked', 'Not available until you qualify.'),
('EN', 'pensions.dashboard.apply', 'Apply'),
('EN', 'pensions.verify.unavailable_title', 'Verification unavailable'),

('ST', 'pensions.dashboard.qualify_old_age', 'O tšoaneleha — Penshene ea Botsofali'),
('ST', 'pensions.dashboard.qualify_civil_service', 'O tšoaneleha — Penshene ea Tšebeletso ea ''Muso'),
('ST', 'pensions.dashboard.not_eligible', 'Ha o tšoanelehe hona joale'),
('ST', 'pensions.dashboard.current_age_template', 'Lilemo tsa hao tsa hona joale ke {currentAge}. Lilemo tse hlokahalang bakeng sa mofuta ona ke {minimumAge}.'),
('ST', 'pensions.dashboard.government_years_template', 'Tšebeletso ea mmuso e tlalehiloeng: lilemo tse {years}.'),
('ST', 'pensions.dashboard.pension_information', 'Lintlha tsa penshene'),
('ST', 'pensions.dashboard.view', 'Sheba'),
('ST', 'pensions.dashboard.verify_now', 'Netefatsa hona joale'),
('ST', 'pensions.dashboard.verification_history', 'Histori ea netefatso'),
('ST', 'pensions.dashboard.verification_history_subtitle', 'Netefatso tsa bophelo tse fetileng rekotong ea hao.'),
('ST', 'pensions.dashboard.pension_application', 'Kopo ea penshene'),
('ST', 'pensions.dashboard.pension_application_subtitle', 'Etsa kopo ea penshene.'),
('ST', 'pensions.dashboard.pension_application_locked', 'Ha e fumanehe ho fihlela o tšoaneleha.'),
('ST', 'pensions.dashboard.apply', 'Etsa kopo'),
('ST', 'pensions.verify.unavailable_title', 'Netefatso ha e fumanehe'),

-- ────────────────────────────────────────────────────────────────
-- GROUP C — Employment history (Complete Citizen Record)
-- ────────────────────────────────────────────────────────────────
('EN', 'employment.history.title', 'Employment history'),
('EN', 'employment.history.add', 'Add employment'),
('EN', 'employment.history.edit', 'Edit employment'),
('EN', 'employment.history.save', 'Save employment'),
('EN', 'employment.history.description', 'Record the citizen''s jobs. Pensions staff use government service years to assess Civil Service Pension eligibility.'),
('EN', 'employment.history.empty', 'No employment history recorded.'),
('EN', 'employment.history.employer_name', 'Employer name'),
('EN', 'employment.history.employer_type', 'Employer type'),
('EN', 'employment.history.position', 'Position'),
('EN', 'employment.history.start_date', 'Start date'),
('EN', 'employment.history.end_date', 'End date'),
('EN', 'employment.history.current', 'Current job'),
('EN', 'employment.history.notes', 'Notes'),
('EN', 'employment.history.error_employer_required', 'Employer name is required.'),
('EN', 'employment.history.error_start_required', 'Start date is required.'),
('EN', 'employment.history.error_save_failed', 'Could not save employment history.'),
('EN', 'employment.history.employer_type.government', 'Government'),
('EN', 'employment.history.employer_type.private', 'Private sector'),
('EN', 'employment.history.employer_type.self_employed', 'Self-employed'),
('EN', 'employment.history.employer_type.ngo', 'NGO'),
('EN', 'employment.history.employer_type.other', 'Other'),

('ST', 'employment.history.title', 'Nalane ea mosebetsi'),
('ST', 'employment.history.add', 'Kenya mosebetsi'),
('ST', 'employment.history.edit', 'Fetola mosebetsi'),
('ST', 'employment.history.save', 'Boloka mosebetsi'),
('ST', 'employment.history.description', 'Rekota mesebetsi ea moahi. Basebetsi ba Penshene ba sebelisa lilemo tsa tšebeletso ea mmuso ho hlahloba ho tšoaneleha ha Penshene ea Tšebeletso ea ''Muso.'),
('ST', 'employment.history.empty', 'Ha ho nalane ea mosebetsi e tlalehiloeng.'),
('ST', 'employment.history.employer_name', 'Lebitso la mohiri'),
('ST', 'employment.history.employer_type', 'Mofuta oa mohiri'),
('ST', 'employment.history.position', 'Boemo'),
('ST', 'employment.history.start_date', 'Letsatsi la ho qala'),
('ST', 'employment.history.end_date', 'Letsatsi la ho qeta'),
('ST', 'employment.history.current', 'Mosebetsi oa hona joale'),
('ST', 'employment.history.notes', 'Lintlha'),
('ST', 'employment.history.error_employer_required', 'Lebitso la mohiri lea hlokahala.'),
('ST', 'employment.history.error_start_required', 'Letsatsi la ho qala lea hlokahala.'),
('ST', 'employment.history.error_save_failed', 'Ha hoa ka ha boloka nalane ea mosebetsi.'),
('ST', 'employment.history.employer_type.government', 'Mmuso'),
('ST', 'employment.history.employer_type.private', 'Lekala la poraefete'),
('ST', 'employment.history.employer_type.self_employed', 'Boipheliso'),
('ST', 'employment.history.employer_type.ngo', 'NGO'),
('ST', 'employment.history.employer_type.other', 'Tse ling'),

-- ────────────────────────────────────────────────────────────────
-- GROUP D — Vehicle delete confirmation
-- ────────────────────────────────────────────────────────────────
('EN', 'traffic.vehicles.delete.title', 'Delete this vehicle?'),
('EN', 'traffic.vehicles.delete.message_template', '{registration} will be permanently removed.'),
('EN', 'traffic.vehicles.delete.confirm', 'Delete'),
('EN', 'traffic.vehicles.delete.error_fallback', 'Could not delete the vehicle.'),

('ST', 'traffic.vehicles.delete.title', 'Hlakola koloi ena?'),
('ST', 'traffic.vehicles.delete.message_template', '{registration} e tla tlosoa ka ho sa feleng.'),
('ST', 'traffic.vehicles.delete.confirm', 'Hlakola'),
('ST', 'traffic.vehicles.delete.error_fallback', 'Ha hoa ka ha hlakola koloi.'),

-- ────────────────────────────────────────────────────────────────
-- GROUP E — Citizen contact editing
-- ────────────────────────────────────────────────────────────────
('EN', 'citizen.contact.edit', 'Edit contact details'),
('EN', 'citizen.contact.save', 'Save changes'),
('EN', 'citizen.contact.cancel', 'Cancel'),
('EN', 'citizen.contact.error_phone', 'Please enter a valid phone number.'),
('EN', 'citizen.contact.error_email', 'Please enter a valid email address.'),
('EN', 'citizen.contact.success', 'Contact details updated.'),
('EN', 'citizen.contact.error_fallback', 'Could not save contact details.'),
('EN', 'citizen.profile.registration_unavailable', 'Registration link unavailable — use Citizen Search to find the registration'),

('ST', 'citizen.contact.edit', 'Fetola lintlha tsa ho ikopanya'),
('ST', 'citizen.contact.save', 'Boloka liphetoho'),
('ST', 'citizen.contact.cancel', 'Hlakola'),
('ST', 'citizen.contact.error_phone', 'Ka kopo kenya nomoro ea mohala e nepahetseng.'),
('ST', 'citizen.contact.error_email', 'Ka kopo kenya aterese ea imeile e nepahetseng.'),
('ST', 'citizen.contact.success', 'Lintlha tsa ho ikopanya li ntlafalitsoe.'),
('ST', 'citizen.contact.error_fallback', 'Ha hoa ka ha boloka lintlha tsa ho ikopanya.'),
('ST', 'citizen.profile.registration_unavailable', 'Khokahano ea ngoliso ha e fumanehe — sebelisa Batla Moahi ho fumana ngoliso'),

-- ────────────────────────────────────────────────────────────────
-- GROUP F — Home Affairs dashboard actions
-- ────────────────────────────────────────────────────────────────
('EN', 'home_affairs.dashboard.enquiries', 'Enquiries'),
('EN', 'home_affairs.dashboard.verify_document', 'Verify Document'),
('EN', 'home_affairs.dashboard.info_services', 'Info Services'),
('EN', 'home_affairs.dashboard.certificates', 'Certificates'),
('EN', 'home_affairs.dashboard.search_citizens', 'Search Citizens'),

('ST', 'home_affairs.dashboard.enquiries', 'Lipotso'),
('ST', 'home_affairs.dashboard.verify_document', 'Netefatsa tokomane'),
('ST', 'home_affairs.dashboard.info_services', 'Litšebeletso tsa tlhahisoleseling'),
('ST', 'home_affairs.dashboard.certificates', 'Litifi keiti'),
('ST', 'home_affairs.dashboard.search_citizens', 'Batla baahi'),

-- ────────────────────────────────────────────────────────────────
-- GROUP H — Finance dashboard error state
-- ────────────────────────────────────────────────────────────────
('EN', 'finance.staff_dashboard.error_title', 'Could not load payments'),
('EN', 'finance.staff_dashboard.retry', 'Retry'),

('ST', 'finance.staff_dashboard.error_title', 'Ha hoa ka ha kenya litefo'),
('ST', 'finance.staff_dashboard.retry', 'Leka hape')

ON CONFLICT (language_code, translation_key) DO NOTHING;

COMMIT;

-- ================================================================
-- Rollback (only if you need to undo this migration):
--
-- BEGIN;
-- DELETE FROM translations WHERE translation_key IN (
--   'services.list.title',
--   'services.list.intro',
--   'services.list.information_only',
--   'services.list.apply',
--   'services.list.no_services_title',
--   'services.list.no_services_message',
--   'services.list.back_to_dashboard',
--   'pensions.dashboard.qualify_old_age',
--   'pensions.dashboard.qualify_civil_service',
--   'pensions.dashboard.not_eligible',
--   'pensions.dashboard.current_age_template',
--   'pensions.dashboard.government_years_template',
--   'pensions.dashboard.pension_information',
--   'pensions.dashboard.view',
--   'pensions.dashboard.verify_now',
--   'pensions.dashboard.verification_history',
--   'pensions.dashboard.verification_history_subtitle',
--   'pensions.dashboard.pension_application',
--   'pensions.dashboard.pension_application_subtitle',
--   'pensions.dashboard.pension_application_locked',
--   'pensions.dashboard.apply',
--   'pensions.verify.unavailable_title',
--   'employment.history.title',
--   'employment.history.add',
--   'employment.history.edit',
--   'employment.history.save',
--   'employment.history.description',
--   'employment.history.empty',
--   'employment.history.employer_name',
--   'employment.history.employer_type',
--   'employment.history.position',
--   'employment.history.start_date',
--   'employment.history.end_date',
--   'employment.history.current',
--   'employment.history.notes',
--   'employment.history.error_employer_required',
--   'employment.history.error_start_required',
--   'employment.history.error_save_failed',
--   'employment.history.employer_type.government',
--   'employment.history.employer_type.private',
--   'employment.history.employer_type.self_employed',
--   'employment.history.employer_type.ngo',
--   'employment.history.employer_type.other',
--   'traffic.vehicles.delete.title',
--   'traffic.vehicles.delete.message_template',
--   'traffic.vehicles.delete.confirm',
--   'traffic.vehicles.delete.error_fallback',
--   'citizen.contact.edit',
--   'citizen.contact.save',
--   'citizen.contact.cancel',
--   'citizen.contact.error_phone',
--   'citizen.contact.error_email',
--   'citizen.contact.success',
--   'citizen.contact.error_fallback',
--   'citizen.profile.registration_unavailable',
--   'home_affairs.dashboard.enquiries',
--   'home_affairs.dashboard.verify_document',
--   'home_affairs.dashboard.info_services',
--   'home_affairs.dashboard.certificates',
--   'home_affairs.dashboard.search_citizens',
--   'finance.staff_dashboard.error_title',
--   'finance.staff_dashboard.retry'
-- );
-- COMMIT;
-- ================================================================