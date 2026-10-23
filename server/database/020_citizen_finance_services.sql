BEGIN;

CREATE TABLE IF NOT EXISTS citizen_finance_employment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  employer_name VARCHAR(200) NOT NULL,
  position_title VARCHAR(200) NOT NULL,
  employment_type VARCHAR(20) NOT NULL
    CHECK (employment_type IN ('GOVERNMENT', 'PRIVATE', 'SELF_EMPLOYED', 'NGO', 'OTHER')),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  proof_file_path TEXT NOT NULL,
  proof_file_name VARCHAR(255) NOT NULL,
  proof_file_type VARCHAR(120) NOT NULL,
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_citizen_finance_employment_citizen
  ON citizen_finance_employment(citizen_id, created_at DESC);

COMMIT;
