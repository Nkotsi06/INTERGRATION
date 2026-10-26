BEGIN;

ALTER TABLE transport_permits
  ALTER COLUMN permit_category TYPE VARCHAR(30);

COMMIT;
