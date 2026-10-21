BEGIN;

DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN
    SELECT schemaname, viewname
    FROM pg_views
    WHERE schemaname = current_schema()
      AND (
        definition ILIKE '%tax_records%'
        OR definition ILIKE '%tax_payments%'
        OR definition ILIKE '%payment_plans%'
        OR definition ILIKE '%vat_registrations%'
        OR definition ILIKE '%business_registrations%'
      )
  LOOP
    EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS generate_tax_id() CASCADE;
DROP SEQUENCE IF EXISTS tax_id_seq CASCADE;
DROP SEQUENCE IF EXISTS tax_id_generator_seq CASCADE;

DELETE FROM payments
WHERE UPPER(COALESCE(service, '')) IN (
  'TAX_PAYMENT', 'TAX_REGISTER', 'TAX_CLEARANCE', 'TAX_RETURN',
  'VAT_REGISTRATION', 'PAYMENT_PLAN', 'BUSINESS_REGISTRATION'
);

DELETE FROM fee_schedule
WHERE UPPER(service_code) IN (
  'TAX_REGISTER', 'TAX_PROFILE', 'TAX_PAYMENT', 'TAX_CLEARANCE',
  'VAT_REGISTRATION', 'TAX_RETURN', 'PAYMENT_PLAN', 'BUSINESS_REGISTRATION'
);

DELETE FROM services
WHERE UPPER(code) IN (
  'TAX_REGISTER', 'TAX_PROFILE', 'TAX_PAYMENT', 'TAX_CLEARANCE',
  'VAT_REGISTRATION', 'TAX_RETURN', 'PAYMENT_PLAN', 'BUSINESS_REGISTRATION'
);

DELETE FROM reference_formats
WHERE UPPER(name) IN (
  'TAX_PAYMENT', 'TAX_RETURN', 'VAT_REGISTRATION',
  'PAYMENT_PLAN', 'BUSINESS_REGISTRATION'
);

DELETE FROM document_types WHERE UPPER(code) = 'TAX_CLEARANCE';
DELETE FROM translations
WHERE translation_key ILIKE 'finance.%'
   OR translation_key ILIKE '%tax%'
   OR translation_key ILIKE '%vat%'
   OR translation_key ILIKE '%business_registration%'
   OR translation_key ILIKE '%payment_plan%';

DROP TABLE IF EXISTS tax_clearances CASCADE;
DROP TABLE IF EXISTS tax_payments CASCADE;
DROP TABLE IF EXISTS tax_records CASCADE;
DROP TABLE IF EXISTS tax_returns CASCADE;
DROP TABLE IF EXISTS vat_registrations CASCADE;
DROP TABLE IF EXISTS payment_plans CASCADE;
DROP TABLE IF EXISTS business_registrations CASCADE;
DROP TABLE IF EXISTS tax_policy_notes CASCADE;

COMMIT;
