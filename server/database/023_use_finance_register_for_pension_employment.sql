BEGIN;

UPDATE services
SET form_fields = '[
  {"key":"pensionType","label":"Pension type","type":"text","required":true},
  {"key":"bankName","label":"Bank name","type":"text","required":true},
  {"key":"bankAccountNumber","label":"Bank account number","type":"text","required":true},
  {"key":"branchCode","label":"Branch code","type":"text","required":false}
]'::jsonb,
updated_at = NOW()
WHERE ministry = 'PENSIONS'
  AND code = 'PENSION_APPLICATION';

COMMIT;
