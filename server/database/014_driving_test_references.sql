ALTER TABLE driving_tests
  ADD COLUMN IF NOT EXISTS test_reference VARCHAR(50) UNIQUE;

CREATE SEQUENCE IF NOT EXISTS driving_test_reference_seq START WITH 1;
