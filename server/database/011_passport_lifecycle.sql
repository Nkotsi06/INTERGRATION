BEGIN;

ALTER TABLE passport_applications
  ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS collected_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS collected_by_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS id_checked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS signature_id UUID REFERENCES signatures(id);

ALTER TABLE passport_applications
  ALTER COLUMN passport_number TYPE VARCHAR(50);

CREATE SEQUENCE IF NOT EXISTS passport_number_seq START WITH 1;

SELECT setval(
  'passport_number_seq',
  COALESCE(
    (
      SELECT MAX(substring(passport_number FROM '[0-9]+$')::bigint)
      FROM passport_applications
      WHERE passport_number LIKE 'PPN-%'
    ),
    0
  ) + 1,
  FALSE
);

INSERT INTO reference_formats (name, prefix, year_format, sequence_length, example)
VALUES ('PASSPORT_NUMBER', 'PPN', 'YYYY', 6, 'PPN-2026-000001')
ON CONFLICT DO NOTHING;

COMMIT;
