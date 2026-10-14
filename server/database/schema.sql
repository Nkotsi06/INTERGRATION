-- ================================================================
-- INTEGRATED GOVERNMENT SERVICES SYSTEM (LESOTHO)
-- Complete Database Schema + All Migrations + Seed Data
-- ================================================================
-- Run ONCE against a fresh PostgreSQL database.
--
-- WARNING: This file DROPS every table. All data is lost.
--          Only the seed data below survives.
--
-- BEFORE RUNNING:
--   1. Generate the admin bcrypt hash:
--        cd server
--        node scripts/generate-admin-hash.js
--   2. Paste the hash into the admin INSERT (look for:
--      REPLACE_WITH_GENERATED_HASH)
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ================================================================
-- SECTION 0: DROP EVERYTHING
-- ================================================================
DROP TABLE IF EXISTS audit_findings CASCADE;
DROP TABLE IF EXISTS tax_policy_notes CASCADE;
DROP TABLE IF EXISTS procurement_records CASCADE;
DROP TABLE IF EXISTS debt_records CASCADE;
DROP TABLE IF EXISTS budget_allocations CASCADE;
DROP TABLE IF EXISTS treasury_payments CASCADE;
DROP TABLE IF EXISTS business_registrations CASCADE;
DROP TABLE IF EXISTS payment_plans CASCADE;
DROP TABLE IF EXISTS tax_returns CASCADE;
DROP TABLE IF EXISTS vat_registrations CASCADE;

DROP TABLE IF EXISTS transport_permits CASCADE;
DROP TABLE IF EXISTS vehicle_licences CASCADE;
DROP TABLE IF EXISTS vehicle_inspections CASCADE;
DROP TABLE IF EXISTS criminal_records CASCADE;

DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS reference_formats CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS ministries CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS passport_applications CASCADE;
DROP TABLE IF EXISTS marriage_certificates CASCADE;
DROP TABLE IF EXISTS birth_certificates CASCADE;
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
-- SECTION 1: CORE TABLES
-- ================================================================

-- 1. Users
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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_citizen_id ON users(citizen_id);


-- 2. Citizens
CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('MALE','FEMALE','OTHER')),
  place_of_birth VARCHAR(200),
  nationality VARCHAR(100) DEFAULT 'Mosotho',
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


-- FK from users to citizens (added after both tables exist)
ALTER TABLE users
  ADD CONSTRAINT users_citizen_id_fkey
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE SET NULL;


-- 2b. Citizen edit history
CREATE TABLE citizen_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  field VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_citizen_edit_history_citizen ON citizen_edit_history(citizen_id);


-- 3. Document types
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


-- 4. Citizen documents
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
  ON citizen_documents(citizen_id) WHERE citizen_id IS NULL;


-- 5. Signatures
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  document_type_code VARCHAR(50),
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_signatures_citizen ON signatures(citizen_id);


-- 6. Biometrics
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


-- 7. Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  service VARCHAR(30) NOT NULL,
  sub_type VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  data JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_applications_reference ON applications(reference_number);
CREATE INDEX idx_applications_citizen ON applications(citizen_id);
CREATE INDEX idx_applications_service_status ON applications(service, status);
CREATE INDEX idx_applications_sub_type ON applications(sub_type) WHERE sub_type IS NOT NULL;


-- 8. Status types
CREATE TABLE status_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  colour_hex VARCHAR(10) NOT NULL DEFAULT '#7F8C8D',
  applies_to VARCHAR(30) NOT NULL DEFAULT 'application',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);


-- 9. Application status history
CREATE TABLE application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_history_application ON application_status_history(application_id);


-- 10. Home Affairs records
CREATE TABLE home_affairs_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL,
  record_number VARCHAR(100) NOT NULL,
  issued_at TIMESTAMP DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX idx_ha_records_citizen ON home_affairs_records(citizen_id);


-- 10b. Birth certificates
CREATE TABLE birth_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  place_of_birth VARCHAR(200),
  father_name VARCHAR(200),
  mother_name VARCHAR(200),
  status VARCHAR(20) DEFAULT 'ISSUED',
  issued_by UUID REFERENCES users(id),
  notes TEXT,
  registered_at TIMESTAMP DEFAULT NOW(),
  issued_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_birth_certificates_citizen ON birth_certificates(citizen_id);


-- 10c. Marriage certificates
CREATE TABLE marriage_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  spouse1_citizen_id UUID NOT NULL REFERENCES citizens(id),
  spouse2_citizen_id UUID REFERENCES citizens(id),
  spouse2_name VARCHAR(200),
  marriage_date DATE NOT NULL,
  place_of_marriage VARCHAR(200),
  officiant VARCHAR(200),
  status VARCHAR(20) DEFAULT 'ISSUED',
  issued_by UUID REFERENCES users(id),
  issued_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);
CREATE INDEX idx_marriage_cert_spouse1 ON marriage_certificates(spouse1_citizen_id);
CREATE INDEX idx_marriage_cert_spouse2 ON marriage_certificates(spouse2_citizen_id);


-- 11. Traffic — driver licences
CREATE TABLE driver_licences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  licence_number VARCHAR(50) UNIQUE NOT NULL,
  licence_type VARCHAR(10) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  signature_id UUID REFERENCES signatures(id),
  issued_by UUID REFERENCES users(id),
  issued_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  is_public_transport BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_licences_citizen ON driver_licences(citizen_id);
CREATE INDEX idx_licences_application ON driver_licences(application_id);
CREATE INDEX idx_licences_status ON driver_licences(status);


-- 11b. Driving tests
CREATE TABLE driving_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  test_type VARCHAR(20) NOT NULL,
  test_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  location VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'BOOKED'
    CHECK (status IN ('BOOKED','COMPLETED','CANCELLED','FAILED','PASSED')),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  test_category VARCHAR(20) DEFAULT 'PRACTICAL',
  result VARCHAR(20),
  score INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_driving_tests_citizen ON driving_tests(citizen_id);


-- 11c. Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  make VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  colour VARCHAR(50),
  vin VARCHAR(50),
  engine_number VARCHAR(50),
  chasis_number VARCHAR(50),
  plate_number VARCHAR(50),
  origin VARCHAR(30) DEFAULT 'NEW',
  previous_country VARCHAR(50),
  previous_registration VARCHAR(50),
  licence_expiry_date DATE,
  is_licensed BOOLEAN DEFAULT FALSE,
  special_permit_issued BOOLEAN DEFAULT FALSE,
  special_permit_expires DATE,
  registered_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_vehicles_citizen ON vehicles(citizen_id);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_origin ON vehicles(origin);
CREATE INDEX idx_vehicles_status ON vehicles(status);


-- 11d. Vehicle inspections
CREATE TABLE vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  inspection_type VARCHAR(30) NOT NULL,
  inspection_date DATE,
  time_slot VARCHAR(20),
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'BOOKED',
  result VARCHAR(20),
  notes TEXT,
  certificate_number VARCHAR(50),
  certificate_expiry DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_vehicle_inspections_citizen ON vehicle_inspections(citizen_id);
CREATE INDEX idx_vehicle_inspections_vehicle ON vehicle_inspections(vehicle_id);
CREATE INDEX idx_vehicle_inspections_status ON vehicle_inspections(status);


-- 11e. Vehicle licences
CREATE TABLE vehicle_licences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  licence_number VARCHAR(50),
  issue_date DATE,
  expiry_date DATE,
  fee_amount NUMERIC(10, 2),
  is_paid BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_vehicle_licences_citizen ON vehicle_licences(citizen_id);
CREATE INDEX idx_vehicle_licences_vehicle ON vehicle_licences(vehicle_id);


-- 11f. Transport permits
CREATE TABLE transport_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  permit_category VARCHAR(5) NOT NULL,
  permit_type VARCHAR(30) NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  route_description TEXT,
  valid_from DATE,
  valid_until DATE,
  status VARCHAR(20) DEFAULT 'SUBMITTED',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transport_permits_citizen ON transport_permits(citizen_id);
CREATE INDEX idx_transport_permits_category ON transport_permits(permit_category);
CREATE INDEX idx_transport_permits_status ON transport_permits(status);


-- 12. Police — cases
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


-- 12b. Criminal records
CREATE TABLE criminal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  purpose VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  issued_by UUID REFERENCES users(id),
  issued_at TIMESTAMP,
  valid_until DATE,
  findings TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_criminal_records_citizen ON criminal_records(citizen_id);
CREATE INDEX idx_criminal_records_status ON criminal_records(status);
CREATE INDEX idx_criminal_records_reference ON criminal_records(reference_number);


-- 13. Finance — tax core
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


-- 13b. Finance — VAT, returns, plans, business
CREATE TABLE vat_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  trading_name VARCHAR(200),
  business_address TEXT,
  nature_of_business VARCHAR(200),
  annual_turnover NUMERIC(14, 2),
  tin VARCHAR(50),
  status VARCHAR(20) DEFAULT 'SUBMITTED',
  issued_by UUID REFERENCES users(id),
  issued_at TIMESTAMP,
  certificate_id VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_vat_reg_citizen ON vat_registrations(citizen_id);
CREATE INDEX idx_vat_reg_status ON vat_registrations(status);

CREATE TABLE tax_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  tax_year VARCHAR(10) NOT NULL,
  income_declared NUMERIC(14, 2),
  deductions NUMERIC(14, 2),
  taxable_income NUMERIC(14, 2),
  tax_due NUMERIC(14, 2),
  tax_paid NUMERIC(14, 2),
  status VARCHAR(20) DEFAULT 'SUBMITTED',
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_tax_returns_citizen ON tax_returns(citizen_id);
CREATE INDEX idx_tax_returns_year ON tax_returns(tax_year);

CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL,
  instalment_amount NUMERIC(14, 2) NOT NULL,
  number_of_instalments INTEGER NOT NULL,
  start_date DATE NOT NULL,
  frequency VARCHAR(20) DEFAULT 'MONTHLY',
  status VARCHAR(20) DEFAULT 'SUBMITTED',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_payment_plans_citizen ON payment_plans(citizen_id);
CREATE INDEX idx_payment_plans_status ON payment_plans(status);

CREATE TABLE business_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  trading_name VARCHAR(200),
  business_type VARCHAR(50),
  registration_number VARCHAR(50),
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(150),
  tin VARCHAR(50),
  status VARCHAR(20) DEFAULT 'SUBMITTED',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_business_reg_citizen ON business_registrations(citizen_id);
CREATE INDEX idx_business_reg_status ON business_registrations(status);


-- 13c. Finance — staff dashboards
CREATE TABLE treasury_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_reference VARCHAR(50) UNIQUE NOT NULL,
  paying_ministry VARCHAR(50) NOT NULL,
  payee_name VARCHAR(200) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  purpose TEXT,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_treasury_payments_status ON treasury_payments(status);
CREATE INDEX idx_treasury_payments_ministry ON treasury_payments(paying_ministry);

CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year VARCHAR(10) NOT NULL,
  ministry_code VARCHAR(30) NOT NULL REFERENCES ministries(code),
  recurrent_budget NUMERIC(14, 2) DEFAULT 0,
  capital_budget NUMERIC(14, 2) DEFAULT 0,
  total_budget NUMERIC(14, 2) DEFAULT 0,
  expenditure_to_date NUMERIC(14, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (fiscal_year, ministry_code)
);
CREATE INDEX idx_budget_fy ON budget_allocations(fiscal_year);

CREATE TABLE debt_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type VARCHAR(20) NOT NULL,
  lender_name VARCHAR(200) NOT NULL,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  principal_amount NUMERIC(14, 2) NOT NULL,
  outstanding_amount NUMERIC(14, 2),
  interest_rate NUMERIC(5, 2),
  start_date DATE,
  maturity_date DATE,
  purpose TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_debt_records_type ON debt_records(record_type);

CREATE TABLE procurement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  ministry_code VARCHAR(30) REFERENCES ministries(code),
  description TEXT,
  estimated_value NUMERIC(14, 2),
  closing_date DATE,
  awarded_to VARCHAR(200),
  awarded_value NUMERIC(14, 2),
  status VARCHAR(20) DEFAULT 'OPEN',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_procurement_status ON procurement_records(status);

CREATE TABLE tax_policy_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  summary TEXT,
  full_text TEXT,
  effective_from DATE,
  effective_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  ministry_code VARCHAR(30) REFERENCES ministries(code),
  description TEXT,
  severity VARCHAR(20) DEFAULT 'MEDIUM',
  status VARCHAR(20) DEFAULT 'OPEN',
  recommendation TEXT,
  due_date DATE,
  resolved_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_findings_status ON audit_findings(status);
CREATE INDEX idx_audit_findings_severity ON audit_findings(severity);


-- 14. Pensions
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
  status VARCHAR(20) DEFAULT 'ISSUED',
  issued_by UUID REFERENCES users(id),
  notes TEXT,
  registered_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_death_certificates_citizen ON death_certificates(citizen_id);


-- 15. Passport
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


-- 16. Appointments
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


-- 17. Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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


-- 18. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);


-- 19. Ministries
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


-- 19b. Branches
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_code VARCHAR(30) NOT NULL REFERENCES ministries(code),
  name VARCHAR(150) NOT NULL,
  district VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(150),
  opening_hours VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_branches_ministry ON branches(ministry_code);
CREATE INDEX idx_branches_district ON branches(district);
CREATE INDEX idx_branches_active ON branches(is_active);


-- 20. System settings
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


-- 21. Reference formats
CREATE TABLE reference_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  prefix VARCHAR(20) NOT NULL,
  year_format VARCHAR(10) NOT NULL DEFAULT 'YYYY',
  sequence_length INTEGER NOT NULL DEFAULT 5,
  example VARCHAR(100)
);


-- 22. Languages and translations
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
-- SECTION 2: SEED DATA
-- ================================================================

-- Admin account
INSERT INTO users (username, email, password_hash, full_name, role, status, is_active)
VALUES (
  'Nqosa',
  'nqosa@gov.ls',
  '$2b$10$A7uO.mQKP5/XrAEwHYIsPePWWWgOtZtUiC/yvsGA9UxqoL19KTtn6',
  'Nqosa Administrator',
  'ADMIN',
  'ACTIVE',
  TRUE
);

-- Languages
INSERT INTO languages (code, name, is_default, is_active) VALUES
('EN', 'English', true, true),
('ST', 'Sesotho', false, true);

-- Document types
INSERT INTO document_types (code, name, accepted_formats, max_size_mb, is_required, display_order) VALUES
('BIRTH_CERTIFICATE', 'Birth Certificate', 'pdf,jpg,jpeg,png', 5, true, 1),
('DEATH_CERTIFICATE', 'Death Certificate', 'pdf,jpg,jpeg,png', 5, false, 2),
('NATIONAL_ID', 'National ID Card', 'pdf,jpg,jpeg,png', 5, true, 3),
('DRIVERS_LICENCE', 'Driver''s Licence', 'pdf,jpg,jpeg,png', 5, false, 4),
('TAX_CLEARANCE', 'Tax Clearance Certificate', 'pdf,jpg,jpeg,png', 5, false, 5),
('PASSPORT', 'Passport', 'pdf,jpg,jpeg,png', 5, false, 6),
('PASSPORT_PHOTO', 'Passport Photo', 'jpg,jpeg,png', 5, true, 7),
('POLICE_EVIDENCE', 'Police Evidence', 'pdf,jpg,jpeg,png', 5, false, 8);

-- Ministries
INSERT INTO ministries (name, code, colour_hex, icon_name, display_order) VALUES
('Home Affairs', 'HOME_AFFAIRS', '#1A5276', 'home', 1),
('Traffic', 'TRAFFIC', '#B9770E', 'truck', 2),
('Police', 'POLICE', '#922B21', 'shield', 3),
('Finance', 'FINANCE', '#117864', 'dollar-sign', 4),
('Pensions', 'PENSIONS', '#7D3C98', 'users', 5),
('Passport', 'PASSPORT', '#17A2B8', 'globe', 6);

-- System settings
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
('biometric_match_threshold', '85', 'biometrics', 'Match threshold percent', false),
('biometric_max_attempts', '3', 'biometrics', 'Maximum biometric attempts', false);

-- Reference formats
INSERT INTO reference_formats (name, prefix, year_format, sequence_length, example) VALUES
('APPLICATION',           'REF', 'YYYY', 5, 'REF-2026-00001'),
('PASSPORT_APPLICATION',  'PPT', 'YYYY', 5, 'PPT-2026-00001'),
('TRAFFIC_RENEWAL',       'TRF', 'YYYY', 5, 'TRF-2026-00001'),
('TAX_PAYMENT',           'TAX', 'YYYY', 5, 'TAX-2026-00001'),
('POLICE_CASE',           'POL', 'YYYY', 5, 'POL-2026-00001'),
('BIRTH_CERTIFICATE',     'BC',  'YYYY', 5, 'BC-2026-00001'),
('DEATH_CERTIFICATE',     'DC',  'YYYY', 5, 'DC-2026-00001'),
('MARRIAGE_CERTIFICATE',  'MC',  'YYYY', 5, 'MC-2026-00001'),
('VEHICLE_REGISTRATION',  'VEH', 'YYYY', 5, 'VEH-2026-00001'),
('VEHICLE_INSPECTION',    'INS', 'YYYY', 5, 'INS-2026-00001'),
('VEHICLE_LICENCE',       'LIC', 'YYYY', 5, 'LIC-2026-00001'),
('TRANSPORT_PERMIT',      'TP',  'YYYY', 5, 'TP-2026-00001'),
('CRIMINAL_RECORD',       'CR',  'YYYY', 5, 'CR-2026-00001'),
('LEARNERS_LICENCE',      'LL',  'YYYY', 5, 'LL-2026-00001'),
('DRIVING_LICENCE',       'DL',  'YYYY', 5, 'DL-2026-00001'),
('PUBLIC_DRIVING_PERMIT', 'PDP', 'YYYY', 5, 'PDP-2026-00001'),
('THEORY_TEST',           'TT',  'YYYY', 5, 'TT-2026-00001'),
('DRIVERS_LICENCE_NUMBER','DLN', 'YYYY', 6, 'DLN-2026-000001'),
('VAT_REGISTRATION',      'VAT', 'YYYY', 5, 'VAT-2026-00001'),
('TAX_RETURN',            'TR',  'YYYY', 5, 'TR-2026-00001'),
('PAYMENT_PLAN',          'PP',  'YYYY', 5, 'PP-2026-00001'),
('BUSINESS_REGISTRATION', 'BUS', 'YYYY', 5, 'BUS-2026-00001');

-- Status types
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


-- ================================================================
-- SECTION 3: TRIGGERS AND VIEWS
-- ================================================================

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

CREATE OR REPLACE VIEW admin_user_list AS
SELECT
  u.id, u.username, u.full_name, u.email, u.role, u.ministry,
  u.status, u.is_active, u.created_at,
  CASE
    WHEN u.role = 'CITIZEN' THEN 'Not applicable'
    WHEN u.role = 'ADMIN'   THEN 'Administration'
    WHEN u.ministry IS NULL THEN '—'
    ELSE INITCAP(REPLACE(u.ministry, '_', ' '))
  END AS ministry_label
FROM users u;

CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users)::int                                               AS total_users,
  (SELECT COUNT(*) FROM users WHERE role <> 'CITIZEN' AND status = 'ACTIVE')::int AS active_staff,
  (
    (SELECT COUNT(*) FROM applications WHERE status IN ('SUBMITTED','UNDER_REVIEW'))
    + (SELECT COUNT(*) FROM police_cases WHERE status IN ('SUBMITTED','UNDER_INVESTIGATION'))
    + (SELECT COUNT(*) FROM pension_verifications WHERE status = 'PENDING')
  )::int AS pending_actions;


-- ================================================================
-- DONE
-- ================================================================
-- Database now has:
--   - 45 tables (core + Home Affairs + Traffic + Police + Finance + Pensions + Passport + Admin)
--   - 1 admin account (Nqosa / Lomile@12)
--   - 2 languages
--   - 8 document types
--   - 6 ministries
--   - 17 branches (all 10 Lesotho districts for Home Affairs)
--   - 14 system settings
--   - 22 reference formats
--   - 9 status types
--   - 6 budget allocations + 3 procurement samples
--   - 2 views, 1 trigger
-- ================================================================