-- Insert French translations from the JSON file into the database
INSERT INTO website_translations (original_text, translated_text, target_language, page_path, source_language, is_active) VALUES
('Master business skills with', 'Maîtrisez les compétences commerciales avec', 'fr', '/', 'en', true),
('TopOne Academy', 'Académie TopOne', 'fr', '/', 'en', true),
('Join the Business Fundamentals League and gain confidence through visual learning', 'Rejoignez la Ligue des Fondamentaux du Business et gagnez en confiance grâce à l''apprentissage visuel', 'fr', '/', 'en', true),
('Transform your business skills with', 'Transformez vos compétences commerciales avec', 'fr', '/', 'en', true),
('bite-sized visual lessons', 'leçons visuelles digestes', 'fr', '/', 'en', true),
('designed to make complex concepts simple and actionable.', 'conçues pour rendre les concepts complexes simples et réalisables.', 'fr', '/', 'en', true),
('Join Business League', 'Rejoindre la Ligue Business', 'fr', '/', 'en', true),
('Watch Preview', 'Voir l''aperçu', 'fr', '/', 'en', true),
('Your Career?', 'Votre Carrière ?', 'fr', '/', 'en', true),
('Join', 'Rejoignez', 'fr', '/', 'en', true),
('10,000+ successful professionals', '10 000+ professionnels prospères', 'fr', '/', 'en', true),
('who accelerated their careers with our proven system.', 'qui ont accéléré leur carrière avec notre système éprouvé.', 'fr', '/', 'en', true),
('Start your journey today - completely FREE!', 'Commencez votre parcours aujourd''hui - complètement GRATUIT !', 'fr', '/', 'en', true)
ON CONFLICT (original_text, target_language, page_path) DO UPDATE SET
translated_text = EXCLUDED.translated_text,
is_active = true,
updated_at = now();