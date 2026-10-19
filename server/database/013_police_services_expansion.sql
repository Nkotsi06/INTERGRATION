BEGIN;

INSERT INTO services
  (ministry, code, name, description, service_type, is_enabled,
   form_fields, required_documents, fee, display_order)
VALUES
  ('POLICE', 'POLICE_CLEARANCE', 'Clearance certificate',
   'Apply for a police clearance certificate.',
   'APPLICATION', TRUE,
   '[{"key":"purpose","label":"Purpose","type":"text","required":true},
     {"key":"station","label":"Collection station","type":"text","required":true},
     {"key":"contactNumber","label":"Contact number","type":"text","required":false},
     {"key":"email","label":"Email","type":"email","required":false}]'::jsonb,
   '["NATIONAL_ID"]'::jsonb, 150, 21),
  ('POLICE', 'POLICE_REPORT', 'Report a crime',
   'Submit a non-emergency incident report.',
   'APPLICATION', TRUE,
   '[{"key":"caseType","label":"Case type","type":"text","required":true},
     {"key":"incidentDate","label":"Incident date","type":"date","required":true},
     {"key":"location","label":"Location","type":"text","required":true},
     {"key":"description","label":"Description","type":"textarea","required":true}]'::jsonb,
   '["POLICE_EVIDENCE"]'::jsonb, 0, 20),
  ('POLICE', 'POLICE_CRIMINAL_RECORD', 'Criminal record check',
   'Request a criminal record check.',
   'APPLICATION', TRUE,
   '[{"key":"purpose","label":"Purpose","type":"text","required":true}]'::jsonb,
   '["NATIONAL_ID"]'::jsonb, 200, 22),
  ('POLICE', 'POLICE_LOST_PROPERTY', 'Report lost or stolen property',
   'Report lost or stolen property to the police.',
   'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 23),
  ('POLICE', 'POLICE_ACCIDENT', 'Traffic accident report',
   'Submit a traffic accident report.',
   'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 24),
  ('POLICE', 'POLICE_STATEMENTS', 'Police reports and statements',
   'Request police reports and submit statements.',
   'APPLICATION', TRUE, '[]'::jsonb, '[]'::jsonb, 0, 25)
ON CONFLICT (ministry, code) DO NOTHING;

COMMIT;
