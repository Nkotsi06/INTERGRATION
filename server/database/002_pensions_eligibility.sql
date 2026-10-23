BEGIN;

CREATE TABLE IF NOT EXISTS pension_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pension_type VARCHAR(30) NOT NULL UNIQUE,
  minimum_age INTEGER NOT NULL DEFAULT 0,
  minimum_service_years INTEGER NOT NULL DEFAULT 0,
  requires_government_service BOOLEAN NOT NULL DEFAULT FALSE,
  monthly_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'LSL',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pension_rules_active ON pension_rules(is_active);

INSERT INTO pension_rules
  (pension_type, minimum_age, minimum_service_years, requires_government_service, monthly_amount, currency, is_active, notes)
VALUES
  ('OLD_AGE',      70, 0, FALSE, 1000.00, 'LSL', TRUE, 'Universal old-age pension'),
  ('CIVIL_SERVICE',55, 20, TRUE,  0.00, 'LSL', TRUE, 'Requires 20 years of government service')
ON CONFLICT (pension_type) DO NOTHING;

CREATE TABLE IF NOT EXISTS citizen_employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  employer_name VARCHAR(200) NOT NULL,
  employer_type VARCHAR(30) NOT NULL DEFAULT 'PRIVATE'
    CHECK (employer_type IN ('GOVERNMENT','PRIVATE','SELF_EMPLOYED','NGO','OTHER')),
  position_title VARCHAR(200),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (is_current = TRUE OR end_date IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_citizen_employment_citizen
  ON citizen_employment_history(citizen_id);
CREATE INDEX IF NOT EXISTS idx_citizen_employment_type
  ON citizen_employment_history(employer_type);

COMMIT;