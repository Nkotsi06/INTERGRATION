-- ================================================================
-- INTEGRATED GOVERNMENT SERVICES SYSTEM (LESOTHO)
-- Complete Database Schema — consolidated, deduplicated, and
-- corrections applied (2026-10-22, rev 2).
--
-- Run this file FIRST on a fresh PostgreSQL database, then run the
-- numbered migrations in order (see README of migrations).
--
-- SAFE TO RE-RUN: every DROP has IF EXISTS, every CREATE TABLE and
-- CREATE SEQUENCE is preceded by a DROP in Section 0 so a re-run
-- never hits "already exists". Verified against a partially
-- populated database.
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------
-- SECTION 0: DROP EVERYTHING (safe on fresh DB, safe on re-run)
-- ----------------------------------------------------------------
DROP VIEW  IF EXISTS admin_user_list CASCADE;
DROP VIEW  IF EXISTS admin_dashboard_stats CASCADE;
DROP VIEW  IF EXISTS finance_payment_summary CASCADE;

-- Certificate tables
DROP TABLE IF EXISTS divorce_certificates CASCADE;
DROP TABLE IF EXISTS death_certificates_new CASCADE;
DROP TABLE IF EXISTS birth_certificate_applications CASCADE;
DROP TABLE IF EXISTS birth_certificates CASCADE;
DROP TABLE IF EXISTS marriage_certificates CASCADE;
DROP TABLE IF EXISTS national_id_cards CASCADE;          -- ← was missing; caused the error

-- Finance
DROP TABLE IF EXISTS audit_findings CASCADE;
DROP TABLE IF EXISTS procurement_records CASCADE;
DROP TABLE IF EXISTS debt_records CASCADE;
DROP TABLE IF EXISTS budget_allocations CASCADE;
DROP TABLE IF EXISTS treasury_payments CASCADE;

-- Traffic
DROP TABLE IF EXISTS transport_permits CASCADE;
DROP TABLE IF EXISTS vehicle_licences CASCADE;
DROP TABLE IF EXISTS vehicle_inspections CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS driving_tests CASCADE;
DROP TABLE IF EXISTS driver_licences CASCADE;

-- Police
DROP TABLE IF EXISTS criminal_records CASCADE;
DROP TABLE IF EXISTS police_case_updates CASCADE;
DROP TABLE IF EXISTS police_cases CASCADE;

-- Pensions
DROP TABLE IF EXISTS pension_verifications CASCADE;
DROP TABLE IF EXISTS pension_records CASCADE;
DROP TABLE IF EXISTS pension_rules CASCADE;              -- ← was at bottom; moved up so section 1 doesn't hit it

-- Passport
DROP TABLE IF EXISTS passport_applications CASCADE;

-- Civil records / citizens
DROP TABLE IF EXISTS citizen_employment_history CASCADE; -- ← was at bottom; moved up
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

-- Shared / system
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS reference_formats CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS ministries CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- Information services
DROP TABLE IF EXISTS information_topics CASCADE;
DROP TABLE IF EXISTS enquiry_messages CASCADE;
DROP TABLE IF EXISTS document_enquiries CASCADE;

-- Services / payments
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS fee_schedule CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Sequences (IF EXISTS — was missing on the first two)
DROP SEQUENCE IF EXISTS citizen_national_id_serial_seq;
DROP SEQUENCE IF EXISTS birth_certificate_number_seq;
DROP SEQUENCE IF EXISTS driving_test_reference_seq;      -- ← was missing from drop list
DROP SEQUENCE IF EXISTS passport_number_seq;             -- ← was missing from drop list
DROP SEQUENCE IF EXISTS driver_licence_number_seq;       -- ← was missing from drop list

-- ================================================================
-- SECTION 1: CORE TABLES
-- ================================================================

CREATE SEQUENCE citizen_national_id_serial_seq START 1;
CREATE SEQUENCE birth_certificate_number_seq START 1;
CREATE SEQUENCE driving_test_reference_seq START 1;
CREATE SEQUENCE passport_number_seq START 1;
CREATE SEQUENCE driver_licence_number_seq START 1;

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
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_citizen_id ON users(citizen_id);

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

ALTER TABLE users
  ADD CONSTRAINT users_citizen_id_fkey
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE SET NULL;

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

CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  document_type_code VARCHAR(50),
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_signatures_citizen ON signatures(citizen_id);

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

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  service VARCHAR(30) NOT NULL,
  sub_type VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  data JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- Collection tracking (moved out of migration 006; safe on re-run)
  collected_at TIMESTAMP,
  collected_by_name VARCHAR(200),
  collected_by_staff_id UUID REFERENCES users(id),
  id_checked BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_applications_reference ON applications(reference_number);
CREATE INDEX idx_applications_citizen ON applications(citizen_id);
CREATE INDEX idx_applications_service_status ON applications(service, status);
CREATE INDEX idx_applications_sub_type ON applications(sub_type) WHERE sub_type IS NOT NULL;

CREATE TABLE status_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  colour_hex VARCHAR(10) NOT NULL DEFAULT '#7F8C8D',
  applies_to VARCHAR(30) NOT NULL DEFAULT 'application',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_history_application ON application_status_history(application_id);

CREATE TABLE home_affairs_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL,
  record_number VARCHAR(100) NOT NULL,
  issued_at TIMESTAMP DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX idx_ha_records_citizen ON home_affairs_records(citizen_id);

-- ================================================================
-- CERTIFICATE TABLES
-- ================================================================

CREATE TABLE birth_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  child_full_name VARCHAR(200) NOT NULL,
  child_date_of_birth DATE NOT NULL,
  child_gender VARCHAR(10),
  child_national_id VARCHAR(20),
  place_of_birth VARCHAR(200),
  mother_full_name VARCHAR(200),
  mother_national_id VARCHAR(30),
  father_full_name VARCHAR(200),
  father_national_id VARCHAR(30),
  request_type VARCHAR(30) NOT NULL DEFAULT 'NEW',
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  issued_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ISSUED','REJECTED','CANCELLED')),
  rejection_reason TEXT,
  certificate_pdf BYTEA,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_birth_certs_citizen ON birth_certificates(citizen_id);
CREATE INDEX idx_birth_certs_application ON birth_certificates(application_id);
CREATE INDEX idx_birth_certs_status ON birth_certificates(status);

CREATE TABLE birth_certificate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(40) UNIQUE NOT NULL,
  form_data JSONB NOT NULL,
  documents JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED'
    CHECK (status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED')),
  rejection_reason TEXT,
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  certificate_number VARCHAR(50),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_birth_application_status
  ON birth_certificate_applications(status, submitted_at);

CREATE TABLE death_certificates_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  deceased_full_name VARCHAR(200) NOT NULL,
  deceased_national_id VARCHAR(30),
  date_of_death DATE NOT NULL,
  place_of_death VARCHAR(200),
  cause_of_death VARCHAR(200),
  informant_full_name VARCHAR(200),
  informant_relationship VARCHAR(80),
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  issued_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ISSUED','REJECTED','CANCELLED')),
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_death_certs_new_citizen ON death_certificates_new(citizen_id);
CREATE INDEX idx_death_certs_new_application ON death_certificates_new(application_id);
CREATE INDEX idx_death_certs_new_status ON death_certificates_new(status);

CREATE TABLE marriage_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  spouse1_full_name VARCHAR(200) NOT NULL,
  spouse1_national_id VARCHAR(30),
  spouse2_full_name VARCHAR(200) NOT NULL,
  spouse2_national_id VARCHAR(30),
  marriage_date DATE NOT NULL,
  marriage_place VARCHAR(200),
  marriage_officiant VARCHAR(200),
  request_type VARCHAR(30) NOT NULL DEFAULT 'NEW',
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  issued_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ISSUED','REJECTED','CANCELLED')),
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_marriage_certs_citizen ON marriage_certificates(citizen_id);
CREATE INDEX idx_marriage_certs_application ON marriage_certificates(application_id);
CREATE INDEX idx_marriage_certs_status ON marriage_certificates(status);

CREATE TABLE divorce_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  spouse1_full_name VARCHAR(200) NOT NULL,
  spouse1_national_id VARCHAR(30),
  spouse2_full_name VARCHAR(200) NOT NULL,
  spouse2_national_id VARCHAR(30),
  divorce_date DATE NOT NULL,
  court_name VARCHAR(200),
  case_number VARCHAR(80),
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  issued_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ISSUED','REJECTED','CANCELLED')),
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_divorce_certs_citizen ON divorce_certificates(citizen_id);
CREATE INDEX idx_divorce_certs_application ON divorce_certificates(application_id);
CREATE INDEX idx_divorce_certs_status ON divorce_certificates(status);

CREATE TABLE national_id_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  card_number VARCHAR(20) NOT NULL,
  issued_at TIMESTAMP,
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ISSUED','REJECTED')),
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_national_id_cards_citizen
  ON national_id_cards(citizen_id);
CREATE INDEX idx_national_id_cards_application
  ON national_id_cards(application_id) WHERE application_id IS NOT NULL;

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
  test_reference VARCHAR(50) UNIQUE,
  score INTEGER,
  notes TEXT,
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

CREATE TABLE transport_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  permit_category VARCHAR(30) NOT NULL,
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

CREATE TABLE passport_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  passport_type VARCHAR(20) NOT NULL,
  reason VARCHAR(200),
  passport_number VARCHAR(50),
  collection_office VARCHAR(100),
  is_renewal BOOLEAN NOT NULL DEFAULT FALSE,
  previous_passport_number VARCHAR(30),
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(30) DEFAULT 'SUBMITTED',
  issued_at TIMESTAMP,
  issued_by UUID REFERENCES users(id),
  collected_at TIMESTAMP,
  collected_by_name VARCHAR(200),
  id_checked BOOLEAN DEFAULT FALSE,
  signature_id UUID REFERENCES signatures(id),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_passport_apps_application ON passport_applications(application_id);
CREATE INDEX idx_passport_apps_citizen ON passport_applications(citizen_id);
CREATE UNIQUE INDEX idx_passport_applications_number
  ON passport_applications(passport_number)
  WHERE passport_number IS NOT NULL;

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

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);

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

CREATE TABLE reference_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  prefix VARCHAR(20) NOT NULL,
  year_format VARCHAR(10) NOT NULL DEFAULT 'YYYY',
  sequence_length INTEGER NOT NULL DEFAULT 5,
  example VARCHAR(100)
);

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

INSERT INTO languages (code, name, is_default, is_active) VALUES
('EN', 'English', true, true),
('ST', 'Sesotho', false, true);

INSERT INTO document_types (code, name, accepted_formats, max_size_mb, is_required, display_order) VALUES
('BIRTH_CERTIFICATE', 'Birth Certificate', 'pdf,jpg,jpeg,png', 5, true, 1),
('DEATH_CERTIFICATE', 'Death Certificate', 'pdf,jpg,jpeg,png', 5, false, 2),
('NATIONAL_ID', 'National ID Card', 'pdf,jpg,jpeg,png', 5, true, 3),
('DRIVERS_LICENCE', 'Driver''s Licence', 'pdf,jpg,jpeg,png', 5, false, 4),
('PASSPORT', 'Passport', 'pdf,jpg,jpeg,png', 5, false, 6),
('PASSPORT_PHOTO', 'Passport Photo', 'jpg,jpeg,png', 5, true, 7),
('POLICE_EVIDENCE', 'Police Evidence', 'pdf,jpg,jpeg,png', 5, false, 8);

INSERT INTO ministries (name, code, colour_hex, icon_name, display_order) VALUES
('Home Affairs', 'HOME_AFFAIRS', '#1A5276', 'home', 1),
('Traffic', 'TRAFFIC', '#B9770E', 'truck', 2),
('Police', 'POLICE', '#922B21', 'shield', 3),
('Finance', 'FINANCE', '#117864', 'dollar-sign', 4),
('Pensions', 'PENSIONS', '#7D3C98', 'users', 5),
('Passport', 'PASSPORT', '#17A2B8', 'globe', 6);

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
('biometric_max_attempts', '3', 'biometrics', 'Maximum biometric attempts', false),
('passport_validity_years', '10', 'passport', 'Validity period in years for adult passports', false),
('passport_minor_validity_years', '10', 'passport', 'Validity period in years for minor passports', false),
-- keys the System Settings page reads
('failed_login_limit', '5', 'security', 'Alias of max_login_attempts for the admin UI', false),
('account_lockout_duration', '15', 'security', 'Minutes an account stays locked', false),
('email_notifications', 'Enabled', 'notifications', 'Toggle email notifications', false),
('sms_notifications', 'Disabled', 'notifications', 'Toggle SMS notifications', false),
('notifications_poll_seconds', '60', 'notifications', 'Client-side poll interval', true);

INSERT INTO reference_formats (name, prefix, year_format, sequence_length, example) VALUES
('APPLICATION',            'REF', 'YYYY', 5, 'REF-2026-00001'),
('PASSPORT_APPLICATION',   'PPT', 'YYYY', 5, 'PPT-2026-00001'),
('PASSPORT_NUMBER',        'PPN', 'YYYY', 6, 'PPN-2026-000001'),
('TRAFFIC_RENEWAL',        'TRF', 'YYYY', 5, 'TRF-2026-00001'),
('POLICE_CASE',            'POL', 'YYYY', 5, 'POL-2026-00001'),
('BIRTH_CERTIFICATE',      'BC',  'YYYY', 6, 'BC-2026-000001'),
('DEATH_CERTIFICATE',      'DC',  'YYYY', 6, 'DC-2026-000001'),
('MARRIAGE_CERTIFICATE',   'MC',  'YYYY', 6, 'MC-2026-000001'),
('DIVORCE_CERTIFICATE',    'DVC', 'YYYY', 6, 'DVC-2026-000001'),
('VEHICLE_REGISTRATION',   'VEH', 'YYYY', 5, 'VEH-2026-00001'),
('VEHICLE_INSPECTION',     'INS', 'YYYY', 5, 'INS-2026-00001'),
('VEHICLE_LICENCE',        'LIC', 'YYYY', 5, 'LIC-2026-00001'),
('TRANSPORT_PERMIT',       'TP',  'YYYY', 5, 'TP-2026-00001'),
('CRIMINAL_RECORD',        'CR',  'YYYY', 5, 'CR-2026-00001'),
('LEARNERS_LICENCE',       'LL',  'YYYY', 5, 'LL-2026-00001'),
('DRIVING_LICENCE',        'DL',  'YYYY', 5, 'DL-2026-00001'),
('PUBLIC_DRIVING_PERMIT',  'PDP', 'YYYY', 5, 'PDP-2026-00001'),
('DRIVERS_LICENCE_NUMBER', 'DLN', 'YYYY', 6, 'DLN-2026-000001');

INSERT INTO status_types (code, name, colour_hex, applies_to, display_order) VALUES
('DRAFT',               'Draft',               '#7F8C8D', 'application',  1),
('SUBMITTED',           'Submitted',           '#2E86C1', 'application',  2),
('UNDER_REVIEW',        'Under Review',        '#F1C40F', 'application',  3),
('APPROVED',            'Approved',            '#27AE60', 'application',  4),
('REJECTED',            'Rejected',            '#E74C3C', 'application',  5),
('COMPLETED',           'Completed',           '#27AE60', 'application',  6),
('UNDER_INVESTIGATION', 'Under Investigation', '#F1C40F', 'case',         7),
('UPDATED',             'Updated',             '#2E86C1', 'case',         8),
('CLOSED',              'Closed',              '#27AE60', 'case',         9),
('PENDING',             'Pending',             '#F1C40F', 'certificate', 10),
('ISSUED',              'Issued',              '#27AE60', 'certificate', 11),
('CANCELLED',           'Cancelled',           '#7F8C8D', 'certificate', 12);

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
-- SECTION 4: PAYMENTS AND FEE SCHEDULE
-- ================================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  ministry VARCHAR(30) NOT NULL,
  service VARCHAR(80),
  application_reference VARCHAR(80),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'LSL',
  method VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED'
    CHECK (status IN ('PENDING','COMPLETED','FAILED','REFUNDED')),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  reference_number VARCHAR(80),
  received_by UUID REFERENCES users(id) ON DELETE SET NULL,
  paid_at TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_citizen ON payments(citizen_id);
CREATE INDEX idx_payments_ministry ON payments(ministry);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_receipt ON payments(receipt_number);

CREATE TABLE fee_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry VARCHAR(30) NOT NULL,
  service_code VARCHAR(80) NOT NULL,
  service_name VARCHAR(160) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'LSL',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (ministry, service_code)
);
CREATE INDEX idx_fee_schedule_ministry ON fee_schedule(ministry);

CREATE OR REPLACE VIEW finance_payment_summary AS
SELECT
  ministry,
  COUNT(*)::int                                        AS payment_count,
  COALESCE(SUM(amount), 0)::numeric(14,2)              AS total_amount,
  COUNT(*) FILTER (WHERE paid_at::date = CURRENT_DATE)::int AS today_count,
  COALESCE(SUM(amount) FILTER (WHERE paid_at::date = CURRENT_DATE), 0)::numeric(14,2) AS today_amount,
  COUNT(*) FILTER (WHERE date_trunc('month', paid_at) = date_trunc('month', CURRENT_DATE))::int AS month_count,
  COALESCE(SUM(amount) FILTER (WHERE date_trunc('month', paid_at) = date_trunc('month', CURRENT_DATE)), 0)::numeric(14,2) AS month_amount
FROM payments
WHERE status = 'COMPLETED'
GROUP BY ministry;

-- ================================================================
-- SECTION 5: SERVICE CATALOGUE
-- ================================================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry VARCHAR(30) NOT NULL,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  service_type VARCHAR(20) NOT NULL DEFAULT 'APPLICATION'
    CHECK (service_type IN ('APPLICATION','INFORMATION','STAFF_TASK')),
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'LSL',
  display_order INTEGER NOT NULL DEFAULT 0,
  unavailable_message TEXT,
  fee_code VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (ministry, code)
);
CREATE INDEX idx_services_ministry ON services(ministry);
CREATE INDEX idx_services_enabled ON services(is_enabled);

INSERT INTO services (ministry, code, name, description, service_type, is_enabled, form_fields, required_documents, fee, display_order) VALUES
('HOME_AFFAIRS', 'NATIONAL_ID_APPLY', 'Apply for a National ID',
 'Apply for a new national identity document.', 'APPLICATION', TRUE,
 '[{"key":"reason","label":"Reason","type":"text","required":false}]'::jsonb,
 '["NATIONAL_ID","BIRTH_CERTIFICATE","PASSPORT_PHOTO"]'::jsonb, 0, 10),
('HOME_AFFAIRS', 'NATIONAL_ID_REPLACE', 'Replace a National ID',
 'Replace a lost or damaged national identity document.', 'APPLICATION', TRUE,
 '[{"key":"reason","label":"Reason for replacement","type":"text","required":true}]'::jsonb,
 '["BIRTH_CERTIFICATE","PASSPORT_PHOTO"]'::jsonb, 0, 20),
('HOME_AFFAIRS', 'BIRTH_CERTIFICATE_APPLY', 'Birth certificate',
 'Register a birth or request a birth certificate.', 'APPLICATION', TRUE,
 '[{"key":"childFullName","label":"Child full name","type":"text","required":true},
   {"key":"childDateOfBirth","label":"Child date of birth","type":"date","required":true},
   {"key":"childGender","label":"Child gender","type":"text","required":true},
   {"key":"placeOfBirth","label":"Place of birth","type":"text","required":true},
   {"key":"motherFullName","label":"Mother full name","type":"text","required":true},
   {"key":"motherNationalId","label":"Mother National ID","type":"text","required":true},
   {"key":"fatherFullName","label":"Father full name","type":"text","required":false},
   {"key":"fatherNationalId","label":"Father National ID","type":"text","required":false},
   {"key":"requestType","label":"Request type (new or replacement)","type":"text","required":true}]'::jsonb,
 '["NATIONAL_ID","BIRTH_CERTIFICATE"]'::jsonb, 0, 30),
('HOME_AFFAIRS', 'DEATH_CERTIFICATE_APPLY', 'Death certificate',
 'Register a death or request a death certificate.', 'APPLICATION', TRUE,
 '[{"key":"deceasedFullName","label":"Deceased full name","type":"text","required":true},
   {"key":"deceasedNationalId","label":"Deceased National ID","type":"text","required":true},
   {"key":"dateOfDeath","label":"Date of death","type":"date","required":true},
   {"key":"placeOfDeath","label":"Place of death","type":"text","required":true},
   {"key":"causeOfDeath","label":"Cause of death","type":"text","required":false},
   {"key":"informantFullName","label":"Informant full name","type":"text","required":true},
   {"key":"informantRelationship","label":"Relationship to deceased","type":"text","required":true}]'::jsonb,
 '["NATIONAL_ID"]'::jsonb, 0, 40),
('HOME_AFFAIRS', 'MARRIAGE_CERTIFICATE_APPLY', 'Marriage certificate',
 'Register a marriage or request a marriage certificate.', 'APPLICATION', TRUE,
 '[{"key":"spouse1FullName","label":"Spouse 1 full name","type":"text","required":true},
   {"key":"spouse1NationalId","label":"Spouse 1 National ID","type":"text","required":true},
   {"key":"spouse2FullName","label":"Spouse 2 full name","type":"text","required":true},
   {"key":"spouse2NationalId","label":"Spouse 2 National ID","type":"text","required":true},
   {"key":"marriageDate","label":"Date of marriage","type":"date","required":true},
   {"key":"marriagePlace","label":"Place of marriage","type":"text","required":true},
   {"key":"marriageOfficiant","label":"Officiant name","type":"text","required":true},
   {"key":"requestType","label":"Request type (new or certified copy)","type":"text","required":true}]'::jsonb,
 '["NATIONAL_ID"]'::jsonb, 0, 50),
('HOME_AFFAIRS', 'DIVORCE_CERTIFICATE_APPLY', 'Divorce certificate',
 'Register a divorce or request a certified divorce record.', 'APPLICATION', TRUE,
 '[{"key":"spouse1FullName","label":"Spouse 1 full name","type":"text","required":true},
   {"key":"spouse1NationalId","label":"Spouse 1 National ID","type":"text","required":true},
   {"key":"spouse2FullName","label":"Former spouse full name","type":"text","required":true},
   {"key":"spouse2NationalId","label":"Former spouse National ID","type":"text","required":false},
   {"key":"divorceDate","label":"Date of divorce","type":"date","required":true},
   {"key":"courtName","label":"Court name","type":"text","required":true},
   {"key":"caseNumber","label":"Court case number","type":"text","required":true}]'::jsonb,
 '["NATIONAL_ID"]'::jsonb, 0, 60),
('HOME_AFFAIRS', 'NAME_CHANGE_APPLY', 'Name change or amendment',
 'Change a surname or amend identity and civil records.', 'APPLICATION', TRUE,
 '[{"key":"currentFullName","label":"Current full name","type":"text","required":true},
   {"key":"currentNationalId","label":"Current National ID","type":"text","required":true},
   {"key":"requestedFullName","label":"Requested new full name","type":"text","required":true},
   {"key":"reason","label":"Reason for change","type":"textarea","required":true},
   {"key":"supportingDetails","label":"Supporting details","type":"textarea","required":false}]'::jsonb,
 '["NATIONAL_ID","BIRTH_CERTIFICATE"]'::jsonb, 0, 70),
('HOME_AFFAIRS', 'IMMIGRATION_INFO', 'Immigration information',
 'Visa, residence permits, and immigration procedures.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 100),
('HOME_AFFAIRS', 'CITIZENSHIP_INFO', 'Citizenship information',
 'Apply for citizenship, naturalisation, or restoration.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 110),
('HOME_AFFAIRS', 'REFUGEE_INFO', 'Refugee and asylum information',
 'Refugee procedures, documentation, and the Refugee Coordinating Unit.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 120),
('HOME_AFFAIRS', 'LIVESTOCK_INFO', 'Livestock registration information',
 'Livestock registration, identification, and ownership records.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 130),
('HOME_AFFAIRS', 'DOCUMENT_VERIFY_INFO', 'Document verification and enquiries',
 'Confirm a certificate or identity document, or enquire about a delayed application.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 140);

INSERT INTO services (ministry, code, name, description, service_type, is_enabled, form_fields, required_documents, fee, display_order) VALUES
('PASSPORT', 'PASSPORT_NEW', 'New passport',
 'Apply for a first passport.', 'APPLICATION', TRUE, '[]'::jsonb,
 '["NATIONAL_ID","BIRTH_CERTIFICATE","PASSPORT_PHOTO"]'::jsonb, 500, 10),
('PASSPORT', 'PASSPORT_RENEWAL', 'Renew passport',
 'Renew an expiring passport.', 'APPLICATION', TRUE,
 '[{"key":"oldPassportNumber","label":"Old passport number","type":"text","required":true},
   {"key":"oldPassportExpiry","label":"Old passport expiry","type":"date","required":false},
   {"key":"collectionOffice","label":"Collection office","type":"text","required":true}]'::jsonb,
 '["NATIONAL_ID","PASSPORT_PHOTO"]'::jsonb, 500, 20),
('PASSPORT', 'PASSPORT_LOST', 'Lost or stolen passport',
 'Report a lost or stolen passport and request a replacement.', 'APPLICATION', TRUE,
 '[{"key":"oldPassportNumber","label":"Old passport number","type":"text","required":false},
   {"key":"circumstances","label":"Circumstances","type":"textarea","required":true},
   {"key":"policeCaseNumber","label":"Police case number","type":"text","required":false},
   {"key":"collectionOffice","label":"Collection office","type":"text","required":true}]'::jsonb,
 '["NATIONAL_ID","POLICE_EVIDENCE","PASSPORT_PHOTO"]'::jsonb, 700, 30),
('PASSPORT', 'PASSPORT_URGENT', 'Urgent passport',
 'Expedited passport for travel within 14 days.', 'APPLICATION', TRUE,
 '[{"key":"travelDate","label":"Travel date","type":"date","required":true},
   {"key":"travelReason","label":"Reason for travel","type":"textarea","required":true},
   {"key":"collectionOffice","label":"Collection office","type":"text","required":true}]'::jsonb,
 '["NATIONAL_ID","BIRTH_CERTIFICATE","PASSPORT_PHOTO"]'::jsonb, 1200, 40),
('PASSPORT', 'PASSPORT_OFFICIAL', 'Official or diplomatic passport',
 'Official and diplomatic passports require prior authorisation.', 'APPLICATION', TRUE,
 '[{"key":"authorisingBody","label":"Authorising body","type":"text","required":true},
   {"key":"authorisationReference","label":"Authorisation reference","type":"text","required":true},
   {"key":"justification","label":"Justification","type":"textarea","required":true}]'::jsonb,
 '["NATIONAL_ID","PASSPORT_PHOTO"]'::jsonb, 700, 50),
('PASSPORT', 'PASSPORT_MINOR', 'Minor passport',
 'Passport for a child under 16, with parent or guardian consent.', 'APPLICATION', TRUE,
 '[{"key":"childFullName","label":"Child full name","type":"text","required":true},
   {"key":"childDateOfBirth","label":"Child date of birth","type":"date","required":true},
   {"key":"childNationalId","label":"Child National ID","type":"text","required":false},
   {"key":"guardianFullName","label":"Parent or guardian full name","type":"text","required":true},
   {"key":"guardianNationalId","label":"Parent or guardian National ID","type":"text","required":true},
   {"key":"guardianRelationship","label":"Relationship","type":"text","required":true},
   {"key":"collectionOffice","label":"Collection office","type":"text","required":true}]'::jsonb,
 '["BIRTH_CERTIFICATE","PASSPORT_PHOTO"]'::jsonb, 500, 60);

INSERT INTO services (ministry, code, name, description, service_type, is_enabled, form_fields, required_documents, fee, display_order) VALUES
('POLICE', 'POLICE_CLEARANCE', 'Police clearance certificate',
 'Apply for a certificate confirming your criminal record status.', 'APPLICATION', FALSE,
 '[{"key":"purpose","label":"Purpose","type":"text","required":true}]'::jsonb,
 '["NATIONAL_ID"]'::jsonb, 150, 10),
('POLICE', 'POLICE_REPORT', 'Report a crime',
 'Submit a non-emergency incident report.', 'APPLICATION', FALSE,
 '[{"key":"caseType","label":"Case type","type":"text","required":true},
   {"key":"incidentDate","label":"Incident date","type":"date","required":true},
   {"key":"location","label":"Location","type":"text","required":true},
   {"key":"description","label":"Description","type":"textarea","required":true}]'::jsonb,
 '["POLICE_EVIDENCE"]'::jsonb, 0, 20),
('POLICE', 'POLICE_CRIMINAL_RECORD', 'Criminal record check',
 'Request your own criminal record.', 'APPLICATION', FALSE, '[]'::jsonb,
 '["NATIONAL_ID"]'::jsonb, 200, 30);

INSERT INTO services (ministry, code, name, description, service_type, is_enabled, form_fields, required_documents, fee, display_order) VALUES
('PENSIONS', 'PENSION_APPLICATION', 'Pension application',
 'Apply for a state pension.', 'APPLICATION', TRUE,
 '[{"key":"pensionType","label":"Pension type","type":"text","required":true},
   {"key":"employmentHistory","label":"Previous employment","type":"textarea","required":true},
   {"key":"bankName","label":"Bank name","type":"text","required":true},
   {"key":"bankAccountNumber","label":"Bank account number","type":"text","required":true},
   {"key":"branchCode","label":"Branch code","type":"text","required":false}]'::jsonb,
 '["NATIONAL_ID","BIRTH_CERTIFICATE"]'::jsonb, 0, 10),
('PENSIONS', 'PENSION_ESTIMATE', 'Benefits estimate',
 'Estimate your future pension benefit.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 20),
('PENSIONS', 'PENSION_LIFE_VERIFY', 'Life verification',
 'Confirm your existence to keep receiving your pension.', 'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 30),
('PENSIONS', 'PENSION_CLAIM_TRACKING', 'Claim tracking',
 'Track the status of your pension or gratuity claim.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 40),
('PENSIONS', 'PENSION_SURVIVOR_INFO', 'Survivor or beneficiary guidance',
 'Guidance on survivor and beneficiary claims.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 50);

INSERT INTO services (ministry, code, name, description, service_type, is_enabled, form_fields, required_documents, fee, display_order) VALUES
('TRAFFIC', 'DRIVERS_LICENCE_VIEW', 'View driving licence',
 'See your current driving licence and its status.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 10),
('TRAFFIC', 'DRIVING_LICENCE', 'Apply for a new driving licence',
 'Apply for a driving licence after passing your practical test.', 'APPLICATION', TRUE,
 '[]'::jsonb, '[]'::jsonb, 300, 15),
('TRAFFIC', 'LICENCE_RENEWAL', 'Renew driving licence',
 'Renew an expiring driving licence.', 'APPLICATION', TRUE,
 '[{"key":"mobile","label":"Mobile number for payment","type":"text","required":true}]'::jsonb,
 '[]'::jsonb, 250, 20),
('TRAFFIC', 'DRIVING_TEST_BOOKING', 'Book a driving test',
 'Book a learner''s or driver''s licence test.', 'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 100, 30),
('TRAFFIC', 'MY_APPOINTMENTS', 'My appointments',
 'View and manage your driving test appointments.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 40),
('TRAFFIC', 'MY_VEHICLES', 'My vehicles',
 'Register and manage your vehicles.', 'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 350, 50),
('TRAFFIC', 'MY_INSPECTIONS', 'Vehicle inspections',
 'Book a roadworthiness inspection.', 'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 120, 60),
('TRAFFIC', 'MY_VEHICLE_LICENCES', 'Vehicle licences',
 'Apply for a vehicle licence.', 'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 150, 70),
('TRAFFIC', 'MY_TRANSPORT_PERMITS', 'Transport permits',
 'Apply for a transport permit.', 'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 400, 80),
('TRAFFIC', 'MY_TRAFFIC_APPLICATIONS', 'My traffic applications',
 'Track your traffic licence and permit applications.', 'INFORMATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 90);

INSERT INTO fee_schedule (ministry, service_code, service_name, amount, is_active)
SELECT ministry, code, name, fee, TRUE
FROM services
WHERE fee > 0;

UPDATE services
SET fee_code = code
WHERE fee > 0 AND fee_code IS NULL;

-- ================================================================
-- SECTION 6: INFORMATION TOPICS AND ENQUIRIES
-- ================================================================

CREATE TABLE information_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  contact_details TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE enquiry_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES document_enquiries(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO information_topics (code, title, content) VALUES
('IMMIGRATION_INFO', 'Immigration & Visas', 'Information regarding temporary and permanent residence permits, visas, and border control.'),
('CITIZENSHIP_INFO', 'Citizenship', 'Information regarding citizenship by birth, descent, naturalisation, and restoration.'),
('REFUGEE_INFO', 'Refugee & Asylum', 'Procedures, documentation, and support for refugees and asylum seekers in Lesotho.'),
('LIVESTOCK_INFO', 'Livestock Registration', 'Registration, identification, and ownership records for livestock.')
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- END OF SCHEMA
-- ================================================================