BEGIN;

-- Enable the three base police services seeded by schema.sql.
UPDATE services
   SET is_enabled = TRUE, updated_at = NOW()
 WHERE ministry = 'POLICE'
   AND is_enabled = FALSE;

COMMIT;