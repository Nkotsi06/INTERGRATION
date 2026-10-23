INSERT INTO system_settings (key, value, category, description, is_public)
VALUES
  ('passport_validity_years', '10', 'passport', 'Validity period in years for adult passports', false),
  ('passport_minor_validity_years', '10', 'passport', 'Validity period in years for minor passports', false)
ON CONFLICT (key) DO NOTHING;

WITH passport_dates AS (
  SELECT
    passport.id,
    COALESCE(passport.issue_date, passport.issued_at::date) AS issue_date,
    CASE
      WHEN application.data->>'serviceCode' = 'PASSPORT_MINOR'
        THEN minor_validity.value
      ELSE adult_validity.value
    END AS validity_value
  FROM passport_applications AS passport
  JOIN applications AS application ON application.id = passport.application_id
  LEFT JOIN system_settings AS adult_validity
    ON adult_validity.key = 'passport_validity_years'
  LEFT JOIN system_settings AS minor_validity
    ON minor_validity.key = 'passport_minor_validity_years'
  WHERE passport.expiry_date IS NULL
    AND COALESCE(passport.issue_date, passport.issued_at::date) IS NOT NULL
),
parsed_dates AS (
  SELECT
    id,
    issue_date,
    CASE WHEN validity_value ~ '^[0-9]+$' THEN validity_value::integer END AS validity_years
  FROM passport_dates
),
valid_dates AS (
  SELECT id, issue_date, validity_years
  FROM parsed_dates
  WHERE validity_years BETWEEN 1 AND 100
)
UPDATE passport_applications AS passport
SET issue_date = valid_dates.issue_date,
    expiry_date = (
      make_date(
        EXTRACT(YEAR FROM valid_dates.issue_date)::integer + valid_dates.validity_years,
        EXTRACT(MONTH FROM valid_dates.issue_date)::integer,
        1
      ) +
      (EXTRACT(DAY FROM valid_dates.issue_date)::integer - 1) * INTERVAL '1 day' -
      INTERVAL '1 day'
    )::date
FROM valid_dates
WHERE passport.id = valid_dates.id;
