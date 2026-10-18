BEGIN;

ALTER TABLE birth_certificates
  ADD COLUMN IF NOT EXISTS child_national_id VARCHAR(20);

UPDATE birth_certificates bc
SET child_national_id = c.national_id
FROM citizens c
WHERE bc.citizen_id = c.id
  AND bc.child_national_id IS NULL;

CREATE TABLE IF NOT EXISTS national_id_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  card_number VARCHAR(20) NOT NULL,
  issued_at TIMESTAMP,
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ISSUED', 'REJECTED')),
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_national_id_cards_citizen
  ON national_id_cards(citizen_id);
CREATE INDEX IF NOT EXISTS idx_national_id_cards_application
  ON national_id_cards(application_id)
  WHERE application_id IS NOT NULL;

INSERT INTO national_id_cards
  (citizen_id, application_id, card_number, issued_at, status)
SELECT a.citizen_id, a.id, c.national_id, COALESCE(a.updated_at, NOW()), 'ISSUED'
FROM applications a
JOIN citizens c ON c.id = a.citizen_id
WHERE a.service = 'HOME_AFFAIRS'
  AND a.data->>'serviceCode' IN ('NATIONAL_ID_APPLY', 'NATIONAL_ID_REPLACE')
  AND a.status IN ('READY_FOR_COLLECTION', 'COLLECTED')
  AND NOT EXISTS (
    SELECT 1 FROM national_id_cards card WHERE card.application_id = a.id
  );

CREATE SEQUENCE IF NOT EXISTS passport_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS driver_licence_number_seq START WITH 1;

ALTER TABLE passport_applications
  ADD COLUMN IF NOT EXISTS passport_number VARCHAR(30),
  ADD COLUMN IF NOT EXISTS collection_office VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS previous_passport_number VARCHAR(30),
  ADD COLUMN IF NOT EXISTS issue_date DATE,
  ADD COLUMN IF NOT EXISTS expiry_date DATE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_passport_applications_number
  ON passport_applications(passport_number)
  WHERE passport_number IS NOT NULL;

SELECT setval(
  'driver_licence_number_seq',
  GREATEST(
    (SELECT last_value FROM driver_licence_number_seq),
    COALESCE(
      (SELECT MAX(substring(licence_number FROM '[0-9]+$')::bigint)
       FROM driver_licences
       WHERE licence_number LIKE 'DLN-%'),
      0
    ) + 1
  ),
  FALSE
);

SELECT setval(
  'passport_number_seq',
  GREATEST(
    (SELECT last_value FROM passport_number_seq),
    COALESCE(
      (SELECT MAX(substring(passport_number FROM '[0-9]+$')::bigint)
       FROM passport_applications
       WHERE passport_number LIKE 'PPT-%'),
      0
    ) + 1
  ),
  FALSE
);

UPDATE services
SET required_documents = (
      SELECT COALESCE(jsonb_agg(doc), '[]'::jsonb)
      FROM jsonb_array_elements_text(required_documents) AS doc
      WHERE doc NOT IN ('NATIONAL_ID', 'BIRTH_CERTIFICATE')
    ),
    updated_at = NOW()
WHERE ministry = 'HOME_AFFAIRS'
  AND (
    required_documents @> '["NATIONAL_ID"]'::jsonb
    OR required_documents @> '["BIRTH_CERTIFICATE"]'::jsonb
  );

INSERT INTO services
  (ministry, code, name, description, service_type, is_enabled,
   form_fields, required_documents, fee, display_order)
VALUES
  ('TRAFFIC', 'DRIVING_LICENCE', 'Apply for a new driving licence',
   'Apply for a driving licence after passing your practical test.',
   'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 300, 15)
ON CONFLICT (ministry, code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    service_type = EXCLUDED.service_type,
    is_enabled = EXCLUDED.is_enabled,
    fee = EXCLUDED.fee,
    updated_at = NOW();

COMMIT;
