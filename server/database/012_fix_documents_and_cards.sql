BEGIN;

CREATE TABLE IF NOT EXISTS national_id_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  card_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ISSUED', 'REJECTED')),
  issued_at TIMESTAMP,
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE national_id_cards
  ADD COLUMN IF NOT EXISTS citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS card_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS collected_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS collected_by_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS collected_by_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS id_checked BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE birth_certificates
  ADD COLUMN IF NOT EXISTS child_national_id VARCHAR(20);

ALTER TABLE IF EXISTS driving_licences
  ADD COLUMN IF NOT EXISTS signature_id UUID REFERENCES signatures(id) ON DELETE SET NULL;

ALTER TABLE driver_licences
  ADD COLUMN IF NOT EXISTS signature_id UUID REFERENCES signatures(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_national_id_cards_citizen
  ON national_id_cards(citizen_id);
CREATE INDEX IF NOT EXISTS idx_national_id_cards_application
  ON national_id_cards(application_id)
  WHERE application_id IS NOT NULL;

COMMIT;
