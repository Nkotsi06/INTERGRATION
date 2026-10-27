BEGIN;

UPDATE services AS service
SET required_documents = COALESCE(
  (
    SELECT jsonb_agg(document.value)
    FROM jsonb_array_elements(service.required_documents) AS document(value)
    WHERE document.value <> '"PASSPORT_PHOTO"'::jsonb
  ),
  '[]'::jsonb
),
updated_at = NOW()
WHERE service.ministry = 'HOME_AFFAIRS'
  AND service.code IN ('NATIONAL_ID_APPLY', 'NATIONAL_ID_REPLACE')
  AND service.required_documents @> '["PASSPORT_PHOTO"]'::jsonb;

UPDATE services
SET required_documents = (
      SELECT COALESCE(jsonb_agg(document_code), '[]'::jsonb)
      FROM jsonb_array_elements_text(required_documents) AS document(document_code)
      WHERE document_code <> 'PASSPORT_PHOTO'
    ),
    updated_at = NOW()
WHERE ministry = 'PASSPORT'
  AND required_documents @> '["PASSPORT_PHOTO"]'::jsonb;

COMMIT;
