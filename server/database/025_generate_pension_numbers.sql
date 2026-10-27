BEGIN;

CREATE SEQUENCE IF NOT EXISTS pension_number_seq START 1;

DO $$
DECLARE
  max_serial BIGINT;
BEGIN
  SELECT MAX((regexp_match(pension_number, '^LS-PEN-[0-9]{4}-([0-9]+)$'))[1]::BIGINT)
    INTO max_serial
    FROM pension_records
   WHERE pension_number ~ '^LS-PEN-[0-9]{4}-[0-9]+$';

  IF max_serial IS NULL THEN
    PERFORM setval('pension_number_seq', 1, FALSE);
  ELSE
    PERFORM setval('pension_number_seq', max_serial, TRUE);
  END IF;
END
$$;

COMMIT;
