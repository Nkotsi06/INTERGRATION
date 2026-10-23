-- Same content as the "005_translations_group_i.sql" block at the
-- bottom of translations_seed.sql. Run either this file OR the seed,
-- not both in the same session. Both use ON CONFLICT DO NOTHING.
BEGIN;

INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('EN', 'services.list.title', 'Services'),
('EN', 'services.list.intro', 'Choose a service to apply for. Your application will be reviewed by the ministry staff.'),
('EN', 'services.list.information_only', 'Information only — no application required.'),
('EN', 'services.list.apply', 'Apply'),
('EN', 'services.list.no_services_title', 'No services available'),
('EN', 'services.list.no_services_message', 'This ministry has no services enabled at the moment. Please check back later, or choose a different ministry from your dashboard.'),
('EN', 'services.list.back_to_dashboard', 'Back to dashboard'),
('ST', 'services.list.title', 'Litšebeletso'),
('ST', 'services.list.intro', 'Khetha tšebeletso eo o batlang ho e etsa kopo. Kopo ea hao e tla hlahlobjoa ke basebetsi ba lefapha.'),
('ST', 'services.list.information_only', 'Ke tlhahisoleseling feela — ha ho hlokahale kopo.'),
('ST', 'services.list.apply', 'Etsa kopo'),
('ST', 'services.list.no_services_title', 'Ha ho litšebeletso tse fumanehang'),
('ST', 'services.list.no_services_message', 'Lefapha lena ha le na litšebeletso tse ntseng li sebetsa hona joale. Ka kopo hlahloba hamorao, kapa kgetha lefapha le leng ho tsoa letlapeng la hao.'),
('ST', 'services.list.back_to_dashboard', 'Khutlela letlapeng la litšebeletso')
ON CONFLICT (language_code, translation_key) DO NOTHING;

COMMIT;