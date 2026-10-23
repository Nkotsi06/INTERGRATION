-- ================================================================
-- 010_reference_format_fix.sql
-- ================================================================
-- Purpose:
--   Migrations 009 and 011 both point at the same physical sequence
--   (passport_number_seq), but 009 looks for passport numbers with
--   prefix 'PPT-%' and 011 resets the sequence based on 'PPN-%'.
--   Because 011 runs after 009, it resets the counter backwards and
--   two passport numbers can collide. Similarly the initial reference
--   format was called PASSPORT_APPLICATION with prefix 'PPT' — a
--   different concept from PASSPORT_NUMBER with prefix 'PPN'.
--
--   This migration does two things:
--
--     1. Ensures BOTH formats exist (they represent different
--        things: application reference vs. passport number).
--     2. Adjusts the sequence so the maximum of BOTH prefixes is
--        preserved (using GREATEST), which is what 009 and 011
--        should have done from the start.
--
-- Safe to re-run.
-- ================================================================
BEGIN;

-- Ensure BOTH reference formats exist with the correct prefixes.
INSERT INTO reference_formats (name, prefix, year_format, sequence_length, example) VALUES
  ('PASSPORT_APPLICATION', 'PPT', 'YYYY', 5, 'PPT-2026-00001'),
  ('PASSPORT_NUMBER',      'PPN', 'YYYY', 6, 'PPN-2026-000001')
ON CONFLICT (name) DO NOTHING;

-- Advance the sequence past any existing PPT-YYYY-NNNNN AND PPN-YYYY-NNNNNN.
SELECT setval(
  'passport_number_seq',
  GREATEST(
    (SELECT last_value FROM passport_number_seq),
    COALESCE((
      SELECT MAX(substring(passport_number FROM '[0-9]+$')::bigint)
        FROM passport_applications
       WHERE passport_number LIKE 'PPT-%'
    ), 0),
    COALESCE((
      SELECT MAX(substring(passport_number FROM '[0-9]+$')::bigint)
        FROM passport_applications
       WHERE passport_number LIKE 'PPN-%'
    ), 0)
  ) + 1,
  FALSE
);

COMMIT;