CREATE SEQUENCE IF NOT EXISTS citizen_national_id_serial_seq START 1;
CREATE SEQUENCE IF NOT EXISTS birth_certificate_number_seq START 1;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE birth_certificates
  ADD COLUMN IF NOT EXISTS certificate_pdf BYTEA;

CREATE TABLE IF NOT EXISTS birth_certificate_applications (
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

CREATE INDEX IF NOT EXISTS idx_birth_application_status
  ON birth_certificate_applications(status, submitted_at);
