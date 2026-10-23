UPDATE birth_certificates AS certificate
SET citizen_id = application.citizen_id
FROM birth_certificate_applications AS application
WHERE certificate.certificate_number = application.certificate_number
  AND certificate.citizen_id IS NULL
  AND application.citizen_id IS NOT NULL;
