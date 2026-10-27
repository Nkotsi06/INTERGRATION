BEGIN;

UPDATE document_types
SET is_active = FALSE
WHERE code = 'PASSPORT_PHOTO';

COMMIT;
