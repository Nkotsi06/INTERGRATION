-- Collection tracking columns on applications. schema.sql already
-- adds these behind a guard, so this migration is a no-op after a
-- fresh schema.sql run. Kept for compatibility with earlier installs
-- that ran schema.sql before those columns existed.
BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='applications' AND column_name='collected_at') THEN
    ALTER TABLE applications ADD COLUMN collected_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='applications' AND column_name='collected_by_name') THEN
    ALTER TABLE applications ADD COLUMN collected_by_name VARCHAR(200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='applications' AND column_name='collected_by_staff_id') THEN
    ALTER TABLE applications ADD COLUMN collected_by_staff_id UUID REFERENCES users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='applications' AND column_name='id_checked') THEN
    ALTER TABLE applications ADD COLUMN id_checked BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
COMMIT;