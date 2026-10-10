import { useLanguage } from '../../context/LanguageContext';

function LanguageToggle() {
  const { currentLanguage, languages, switchLanguage } = useLanguage();

  if (!languages || languages.length < 2) {
    return null;
  }

  return (
    <div className="language-toggle" role="group" aria-label="Language">
      {languages.map((lang, index) => (
        <span key={lang.code} className="language-toggle-item">
          <button
            type="button"
            className={`language-btn ${currentLanguage === lang.code ? 'active' : ''}`}
            onClick={() => switchLanguage(lang.code)}
            aria-label={`Switch to ${lang.name}`}
            aria-pressed={currentLanguage === lang.code}
          >
            {lang.code}
          </button>
          {index < languages.length - 1 && (
            <span className="language-sep" aria-hidden="true">|</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default LanguageToggle;