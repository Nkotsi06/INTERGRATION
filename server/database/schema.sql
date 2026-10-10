-- ================================================================
-- INTEGRATED GOVERNMENT SERVICES SYSTEM (LESOTHO)
-- Complete Database Schema + Required Seed Data
-- ================================================================
-- Run this file once against a fresh PostgreSQL database.
--
-- BEFORE RUNNING:
--   1. Generate the admin bcrypt hash:
--        cd server
--        node scripts/generate-admin-hash.js
--   2. Copy the hash and paste it into the admin INSERT below
--      (look for: REPLACE_WITH_GENERATED_HASH)
-- ================================================================


-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ================================================================
-- SECTION 0: DROP EVERYTHING FIRST (safe reset)
-- ================================================================
-- Tables are dropped in reverse dependency order.
-- CASCADE ensures any remaining foreign keys or views are removed too.

DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS reference_formats CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS ministries CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS passport_applications CASCADE;
DROP TABLE IF EXISTS death_certificates CASCADE;
DROP TABLE IF EXISTS pension_verifications CASCADE;
DROP TABLE IF EXISTS pension_records CASCADE;
DROP TABLE IF EXISTS tax_clearances CASCADE;
DROP TABLE IF EXISTS tax_payments CASCADE;
DROP TABLE IF EXISTS tax_records CASCADE;
DROP TABLE IF EXISTS police_case_updates CASCADE;
DROP TABLE IF EXISTS police_cases CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS driving_tests CASCADE;
DROP TABLE IF EXISTS driver_licences CASCADE;
DROP TABLE IF EXISTS home_affairs_records CASCADE;
DROP TABLE IF EXISTS application_status_history CASCADE;
DROP TABLE IF EXISTS status_types CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS biometrics CASCADE;
DROP TABLE IF EXISTS signatures CASCADE;
DROP TABLE IF EXISTS citizen_documents CASCADE;
DROP TABLE IF EXISTS citizen_edit_history CASCADE;
DROP TABLE IF EXISTS document_types CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ================================================================
-- SECTION 1: SCHEMA (TABLES)
-- ================================================================

-- -----------------------------
-- 1. Users
-- -----------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN (
    'CITIZEN','ADMIN','HOME_AFFAIRS','TRAFFIC','POLICE','FINANCE','PENSIONS','PASSPORT'
  )),
  ministry VARCHAR(30),
  citizen_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_citizen_id ON users(citizen_id);


-- -----------------------------
-- 2. Citizens (Home Affairs master record)
-- -----------------------------
CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('MALE','FEMALE','OTHER')),
  place_of_birth VARCHAR(200),
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(255),
  father_name VARCHAR(200),
  mother_name VARCHAR(200),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_citizens_national_id ON citizens(national_id);
CREATE INDEX idx_citizens_verified ON citizens(is_verified);


-- -----------------------------
-- 2b. Citizen edit history
-- -----------------------------
CREATE TABLE citizen_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  field VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_citizen_edit_history_citizen
  ON citizen_edit_history(citizen_id);


-- -----------------------------
-- 3. Document Types (configurable)
-- -----------------------------
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  accepted_formats VARCHAR(100) NOT NULL DEFAULT 'pdf,jpg,jpeg,png',
  max_size_mb INTEGER NOT NULL DEFAULT 5,
  is_required BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_document_types_code ON document_types(code);


-- -----------------------------
-- 4. Citizen Documents
--    citizen_id is nullable so a document can be uploaded
--    before the citizen record exists (during record capture).
-- -----------------------------
CREATE TABLE citizen_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  document_type_code VARCHAR(50) NOT NULL REFERENCES document_types(code),
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','VERIFIED','REJECTED')),
  rejection_reason TEXT,
  uploaded_by UUID REFERENCES users(id),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_citizen ON citizen_documents(citizen_id);
CREATE INDEX idx_documents_status ON citizen_documents(status);
CREATE INDEX idx_citizen_documents_pending
  ON citizen_documents(citizen_id)
  WHERE citizen_id IS NULL;


-- -----------------------------
-- 5. Signatures
-- -----------------------------
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  document_type_code VARCHAR(50),
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signatures_citizen ON signatures(citizen_id);


-- -----------------------------
-- 6. Biometrics
-- -----------------------------
CREATE TABLE biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID UNIQUE NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  fingerprint_left_thumb TEXT,
  fingerprint_left_index TEXT,
  fingerprint_right_thumb TEXT,
  fingerprint_right_index TEXT,
  facial_image TEXT,
  enrolled_by UUID REFERENCES users(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_biometrics_citizen ON biometrics(citizen_id);


-- -----------------------------
-- 7. Applications
-- -----------------------------
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  service VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  data JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_applications_reference ON applications(reference_number);
CREATE INDEX idx_applications_citizen ON applications(citizen_id);
CREATE INDEX idx_applications_service_status ON applications(service, status);


-- -----------------------------
-- 8. Status Types (configurable)
-- -----------------------------
CREATE TABLE status_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  colour_hex VARCHAR(10) NOT NULL DEFAULT '#7F8C8D',
  applies_to VARCHAR(30) NOT NULL DEFAULT 'application',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);


-- -----------------------------
-- 9. Application Status History
-- -----------------------------
CREATE TABLE application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_application ON application_status_history(application_id);


-- -----------------------------
-- 10. Home Affairs Records
-- -----------------------------
CREATE TABLE home_affairs_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL,
  record_number VARCHAR(100) NOT NULL,
  issued_at TIMESTAMP DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_ha_records_citizen ON home_affairs_records(citizen_id);


-- -----------------------------
-- 11. Traffic
-- -----------------------------
CREATE TABLE driver_licences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  licence_number VARCHAR(50) UNIQUE NOT NULL,
  licence_type VARCHAR(10) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_licences_citizen ON driver_licences(citizen_id);

CREATE TABLE driving_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  test_type VARCHAR(20) NOT NULL,
  test_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  location VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'BOOKED' CHECK (status IN ('BOOKED','COMPLETED','CANCELLED','FAILED')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driving_tests_citizen ON driving_tests(citizen_id);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  make VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicles_citizen ON vehicles(citizen_id);


-- -----------------------------
-- 12. Police
-- -----------------------------
CREATE TABLE police_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(50) UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  case_type VARCHAR(50) NOT NULL,
  incident_date DATE,
  location VARCHAR(200),
  description TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_police_cases_number ON police_cases(case_number);
CREATE INDEX idx_police_cases_citizen ON police_cases(citizen_id);

CREATE TABLE police_case_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES police_cases(id) ON DELETE CASCADE,
  status VARCHAR(30),
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_case_updates_case ON police_case_updates(case_id);


-- -----------------------------
-- 13. Finance
-- -----------------------------
CREATE TABLE tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  tax_id VARCHAR(50) UNIQUE NOT NULL,
  employment_status VARCHAR(50),
  income_source VARCHAR(100),
  tax_year VARCHAR(10),
  status VARCHAR(20) DEFAULT 'PENDING',
  outstanding_balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tax_records_citizen ON tax_records(citizen_id);

CREATE TABLE tax_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  tax_record_id UUID REFERENCES tax_records(id),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(30),
  paid_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tax_payments_citizen ON tax_payments(citizen_id);

CREATE TABLE tax_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  certificate_id VARCHAR(50) UNIQUE NOT NULL,
  tin VARCHAR(50),
  legal_name VARCHAR(200),
  trading_name VARCHAR(200),
  nature_of_business VARCHAR(100),
  address TEXT,
  date_issued TIMESTAMP DEFAULT NOW(),
  valid_until DATE,
  verification_url VARCHAR(500)
);

CREATE INDEX idx_tax_clearances_citizen ON tax_clearances(citizen_id);


-- -----------------------------
-- 14. Pensions
-- -----------------------------
CREATE TABLE pension_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID UNIQUE NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  pension_type VARCHAR(30) NOT NULL,
  pension_number VARCHAR(50) UNIQUE NOT NULL,
  monthly_amount NUMERIC(12,2) NOT NULL,
  next_payment_date DATE,
  payment_status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pension_records_citizen ON pension_records(citizen_id);

CREATE TABLE pension_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'VERIFIED',
  method VARCHAR(30) DEFAULT 'FINGERPRINT',
  notes TEXT,
  verified_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pension_verifications_citizen ON pension_verifications(citizen_id);

CREATE TABLE death_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  date_of_death DATE NOT NULL,
  place_of_death VARCHAR(200),
  cause_of_death VARCHAR(200),
  registered_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_death_certificates_citizen ON death_certificates(citizen_id);


-- -----------------------------
-- 15. Passport
-- -----------------------------
CREATE TABLE passport_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  passport_type VARCHAR(20) NOT NULL,
  reason VARCHAR(200),
  status VARCHAR(30) DEFAULT 'SUBMITTED',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_passport_apps_application ON passport_applications(application_id);
CREATE INDEX idx_passport_apps_citizen ON passport_applications(citizen_id);


-- -----------------------------
-- 16. Appointments
-- -----------------------------
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  service VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'SCHEDULED',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_citizen ON appointments(citizen_id);


-- -----------------------------
-- 17. Audit Logs
-- -----------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  record_type VARCHAR(50),
  record_id VARCHAR(100),
  result VARCHAR(30),
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(username);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);


-- -----------------------------
-- 18. Notifications
-- -----------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);


-- -----------------------------
-- 19. Ministries (configurable)
-- -----------------------------
CREATE TABLE ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  colour_hex VARCHAR(10) NOT NULL,
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- -----------------------------
-- 20. System Settings (configurable)
-- -----------------------------
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  category VARCHAR(50),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- -----------------------------
-- 21. Reference Formats (configurable)
-- -----------------------------
CREATE TABLE reference_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  prefix VARCHAR(20) NOT NULL,
  year_format VARCHAR(10) NOT NULL DEFAULT 'YYYY',
  sequence_length INTEGER NOT NULL DEFAULT 5,
  example VARCHAR(100)
);


-- -----------------------------
-- 22. Languages + Translations
-- -----------------------------
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(5) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code VARCHAR(5) NOT NULL REFERENCES languages(code),
  translation_key VARCHAR(100) NOT NULL,
  translation_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (language_code, translation_key)
);

CREATE INDEX idx_translations_lang ON translations(language_code);


-- ================================================================
-- SECTION 2: SEED DATA (REQUIRED ONLY)
-- ================================================================


-- -----------------------------
-- 1. Admin Credentials
-- -----------------------------
-- Username: Nqosa
-- Password: Lomile@12 (bcrypt hashed)
--
-- IMPORTANT:
--   Replace the hash below with the one generated by:
--       cd server
--       node scripts/generate-admin-hash.js
-- -----------------------------
INSERT INTO users (username, email, password_hash, full_name, role, status)
VALUES (
  'Nqosa',
  'nqosa@gov.ls',
  '$2b$10$A7uO.mQKP5/XrAEwHYIsPePWWWgOtZtUiC/yvsGA9UxqoL19KTtn6',
  'Nqosa Administrator',
  'ADMIN',
  'ACTIVE'
);


-- -----------------------------
-- 2. Languages
-- -----------------------------
INSERT INTO languages (code, name, is_default, is_active) VALUES
('EN', 'English', true, true),
('ST', 'Sesotho', false, true);


-- -----------------------------
-- 3. Translations (common keys)
-- -----------------------------
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'welcome.title', 'Welcome'),
('ST', 'welcome.title', 'Rea u amohela'),
('EN', 'login.button', 'Login'),
('ST', 'login.button', 'Kena'),
('EN', 'register.button', 'Register'),
('ST', 'register.button', 'Ngolisa'),
('EN', 'verify.button', 'Verify'),
('ST', 'verify.button', 'Netefatsa'),
('EN', 'dashboard.title', 'Dashboard'),
('ST', 'dashboard.title', 'Dashboard'),
('EN', 'logout.button', 'Logout'),
('ST', 'logout.button', 'Tsoa'),
('EN', 'services.title', 'Government Services'),
('ST', 'services.title', 'Litšebeletso tsa Mmuso'),
('EN', 'search.button', 'Search'),
('ST', 'search.button', 'Batla'),
('EN', 'save.button', 'Save'),
('ST', 'save.button', 'Boloka'),
('EN', 'cancel.button', 'Cancel'),
('ST', 'cancel.button', 'Hlakola'),
('EN', 'submit.button', 'Submit'),
('ST', 'submit.button', 'Romela');


-- -----------------------------
-- 4. Document Types
-- -----------------------------
INSERT INTO document_types (code, name, accepted_formats, max_size_mb, is_required, display_order) VALUES
('BIRTH_CERTIFICATE', 'Birth Certificate', 'pdf,jpg,jpeg,png', 5, true, 1),
('DEATH_CERTIFICATE', 'Death Certificate', 'pdf,jpg,jpeg,png', 5, false, 2),
('NATIONAL_ID', 'National ID Card', 'pdf,jpg,jpeg,png', 5, true, 3),
('DRIVERS_LICENCE', 'Driver''s Licence', 'pdf,jpg,jpeg,png', 5, false, 4),
('TAX_CLEARANCE', 'Tax Clearance Certificate', 'pdf,jpg,jpeg,png', 5, false, 5),
('PASSPORT', 'Passport', 'pdf,jpg,jpeg,png', 5, false, 6),
('PASSPORT_PHOTO', 'Passport Photo', 'jpg,jpeg,png', 5, true, 7),
('POLICE_EVIDENCE', 'Police Evidence', 'pdf,jpg,jpeg,png', 5, false, 8);


-- -----------------------------
-- 5. Ministries
-- -----------------------------
INSERT INTO ministries (name, code, colour_hex, icon_name, display_order) VALUES
('Home Affairs', 'HOME_AFFAIRS', '#1A5276', 'home', 1),
('Traffic', 'TRAFFIC', '#B9770E', 'truck', 2),
('Police', 'POLICE', '#922B21', 'shield', 3),
('Finance', 'FINANCE', '#117864', 'dollar-sign', 4),
('Pensions', 'PENSIONS', '#7D3C98', 'users', 5),
('Passport', 'PASSPORT', '#17A2B8', 'globe', 6);


-- -----------------------------
-- 6. System Settings
-- -----------------------------
INSERT INTO system_settings (key, value, category, description, is_public) VALUES
('system_name', 'Integrated Government Services', 'general', 'Display name for the system', true),
('system_logo_path', '', 'general', 'Path to system logo', true),
('default_language', 'EN', 'general', 'Default system language', true),
('supported_languages', 'EN,ST', 'general', 'Comma-separated language codes', true),
('session_timeout_minutes', '30', 'security', 'Session inactivity timeout', false),
('password_min_length', '8', 'security', 'Minimum password length', false),
('password_require_number', 'true', 'security', 'Require at least one number', false),
('max_login_attempts', '5', 'security', 'Max failed login attempts', false),
('upload_max_size_mb', '5', 'files', 'Maximum file upload size', false),
('upload_allowed_formats', 'pdf,jpg,jpeg,png', 'files', 'Allowed file formats', false),
('biometric_fingerprint_enabled', 'true', 'biometrics', 'Enable fingerprint capture', false),
('biometric_facial_enabled', 'true', 'biometrics', 'Enable facial capture', false),
('biometric_match_threshold', '85', 'biometrics', 'Match threshold percent', false);


-- -----------------------------
-- 7. Reference Formats
-- -----------------------------
INSERT INTO reference_formats (name, prefix, year_format, sequence_length, example) VALUES
('APPLICATION', 'REF', 'YYYY', 5, 'REF-2026-00001'),
('PASSPORT_APPLICATION', 'PPT', 'YYYY', 5, 'PPT-2026-00001'),
('TRAFFIC_RENEWAL', 'TRF', 'YYYY', 5, 'TRF-2026-00001'),
('TAX_PAYMENT', 'TAX', 'YYYY', 5, 'TAX-2026-00001'),
('POLICE_CASE', 'POL', 'YYYY', 5, 'POL-2026-00001');


-- -----------------------------
-- 8. Status Types
-- -----------------------------
INSERT INTO status_types (code, name, colour_hex, applies_to, display_order) VALUES
('DRAFT', 'Draft', '#7F8C8D', 'application', 1),
('SUBMITTED', 'Submitted', '#2E86C1', 'application', 2),
('UNDER_REVIEW', 'Under Review', '#F1C40F', 'application', 3),
('APPROVED', 'Approved', '#27AE60', 'application', 4),
('REJECTED', 'Rejected', '#E74C3C', 'application', 5),
('COMPLETED', 'Completed', '#27AE60', 'application', 6),
('UNDER_INVESTIGATION', 'Under Investigation', '#F1C40F', 'case', 7),
('UPDATED', 'Updated', '#2E86C1', 'case', 8),
('CLOSED', 'Closed', '#27AE60', 'case', 9);



-- ============================================================
-- ADMIN MODULE MIGRATION
-- Run in Neon's Query Tool.
-- ============================================================

-- 1. Add is_active to users, if not already present.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

UPDATE users SET is_active = (status = 'ACTIVE') WHERE is_active IS NULL;

-- 2. Safe FK behaviour: deleting a user must not delete
--    citizens or break the audit log.
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_citizen_id_fkey;
ALTER TABLE users
  ADD CONSTRAINT users_citizen_id_fkey
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE SET NULL;

ALTER TABLE audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. BEFORE DELETE safety net: refuse to delete an active user.
CREATE OR REPLACE FUNCTION refuse_delete_active_user()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_active = TRUE THEN
    RAISE EXCEPTION 'Deactivate this user before deleting.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_delete_user ON users;
CREATE TRIGGER before_delete_user
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION refuse_delete_active_user();

-- 4. Deactivate procedure with last-admin guard.
CREATE OR REPLACE PROCEDURE deactivate_user(
  p_user_id UUID,
  p_admin_id UUID
)
LANGUAGE plpgsql AS $$
DECLARE
  v_role VARCHAR(30);
  v_status VARCHAR(20);
  v_remaining INTEGER;
BEGIN
  SELECT role, status INTO v_role, v_status FROM users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  IF v_status = 'INACTIVE' THEN
    RETURN;
  END IF;

  IF v_role = 'ADMIN' THEN
    SELECT COUNT(*) INTO v_remaining
    FROM users
    WHERE role = 'ADMIN' AND is_active = TRUE AND id <> p_user_id;
    IF v_remaining = 0 THEN
      RAISE EXCEPTION 'You cannot deactivate the last active administrator.';
    END IF;
  END IF;

  UPDATE users
  SET status = 'INACTIVE', is_active = FALSE, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- 5. Delete procedure with the "deactivate first" rule.
CREATE OR REPLACE PROCEDURE delete_user(
  p_user_id UUID,
  p_admin_id UUID
)
LANGUAGE plpgsql AS $$
DECLARE
  v_username VARCHAR(50);
  v_role VARCHAR(30);
  v_is_active BOOLEAN;
BEGIN
  SELECT username, role, is_active INTO v_username, v_role, v_is_active
  FROM users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  IF v_is_active = TRUE THEN
    RAISE EXCEPTION 'Deactivate this user before deleting.';
  END IF;

  INSERT INTO audit_logs (user_id, username, action, record_type, record_id, result)
  VALUES (p_admin_id, 'admin', 'Delete User', 'USER', v_username, 'SUCCESS');

  DELETE FROM users WHERE id = p_user_id;
END;
$$;

-- 6. View: readable user list for the admin table.
CREATE OR REPLACE VIEW admin_user_list AS
SELECT
  u.id,
  u.username,
  u.full_name,
  u.email,
  u.role,
  u.ministry,
  u.status,
  u.is_active,
  u.created_at,
  CASE
    WHEN u.role = 'CITIZEN' THEN 'Not applicable'
    WHEN u.role = 'ADMIN'   THEN 'Administration'
    WHEN u.ministry IS NULL THEN '—'
    ELSE INITCAP(REPLACE(u.ministry, '_', ' '))
  END AS ministry_label
FROM users u;

-- 7. View: dashboard stat counts.
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users)::int                                            AS total_users,
  (SELECT COUNT(*) FROM users WHERE role <> 'CITIZEN' AND status = 'ACTIVE')::int AS active_staff,
  (
    (SELECT COUNT(*) FROM applications WHERE status IN ('SUBMITTED','UNDER_REVIEW'))
    + (SELECT COUNT(*) FROM police_cases WHERE status IN ('SUBMITTED','UNDER_INVESTIGATION'))
  )::int AS pending_actions;


  
-- ================================================================
-- DONE
-- ================================================================
-- The database now has:
--   - All tables including citizen_edit_history and biometrics
--   - 1 admin account
--   - 2 languages + 22 translations
--   - 8 document types
--   - 6 ministries
--   - 13 system settings
--   - 5 reference formats
--   - 9 status types
--
-- NOT included (by design):
--   - Staff accounts
--   - Sample citizens
--   - Test data (licences, pension, police cases)
--
-- You can create staff accounts and citizens through the app.
-- ================================================================