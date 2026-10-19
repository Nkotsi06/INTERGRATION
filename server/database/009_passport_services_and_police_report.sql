BEGIN;

ALTER TABLE passport_applications
  ADD COLUMN IF NOT EXISTS passport_number VARCHAR(30),
  ADD COLUMN IF NOT EXISTS collection_office VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS previous_passport_number VARCHAR(30);

CREATE UNIQUE INDEX IF NOT EXISTS idx_passport_applications_number
  ON passport_applications(passport_number)
  WHERE passport_number IS NOT NULL;

CREATE SEQUENCE IF NOT EXISTS passport_number_seq START WITH 1;

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
      SELECT COALESCE(jsonb_agg(document_code), '[]'::jsonb)
        FROM jsonb_array_elements_text(required_documents) AS required_document(document_code)
      WHERE document_code <> 'PASSPORT_PHOTO'
    ),
    updated_at = NOW()
WHERE ministry = 'PASSPORT'
  AND required_documents @> '["PASSPORT_PHOTO"]'::jsonb;

INSERT INTO services
  (ministry, code, name, description, service_type, is_enabled,
   form_fields, required_documents, fee, display_order)
VALUES
  ('POLICE', 'POLICE_REPORT', 'Report a crime',
   'Submit a non-emergency incident report.',
   'APPLICATION', TRUE,
   '[{"key":"caseType","label":"Case type","type":"text","required":true},
     {"key":"incidentDate","label":"Incident date","type":"date","required":true},
     {"key":"location","label":"Location","type":"text","required":true},
     {"key":"description","label":"Description","type":"textarea","required":true}]'::jsonb,
   '["POLICE_EVIDENCE"]'::jsonb, 0, 20)
ON CONFLICT (ministry, code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    service_type = EXCLUDED.service_type,
    is_enabled = TRUE,
    form_fields = EXCLUDED.form_fields,
    required_documents = EXCLUDED.required_documents,
    updated_at = NOW();

COMMIT;
