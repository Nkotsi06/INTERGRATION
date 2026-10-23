BEGIN;

CREATE TABLE IF NOT EXISTS government_employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS government_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id VARCHAR(20) NOT NULL UNIQUE,
  employer_id UUID NOT NULL REFERENCES government_employers(id) ON DELETE RESTRICT,
  employee_number VARCHAR(80) NOT NULL,
  start_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'RETIRED', 'RESIGNED')),
  end_date DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (
    (status = 'ACTIVE' AND end_date IS NULL)
    OR (status IN ('RETIRED', 'RESIGNED') AND end_date IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_government_employees_employer
  ON government_employees(employer_id);
CREATE INDEX IF NOT EXISTS idx_government_employees_status
  ON government_employees(status);

CREATE TABLE IF NOT EXISTS government_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id VARCHAR(20) NOT NULL,
  debt_type VARCHAR(120) NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'OUTSTANDING'
    CHECK (status IN ('OUTSTANDING', 'CLEARED')),
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  date_cleared TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK ((status = 'CLEARED' AND date_cleared IS NOT NULL) OR status <> 'CLEARED')
);
CREATE INDEX IF NOT EXISTS idx_government_debts_national_id
  ON government_debts(national_id);
CREATE INDEX IF NOT EXISTS idx_government_debts_status
  ON government_debts(status);

COMMIT;
