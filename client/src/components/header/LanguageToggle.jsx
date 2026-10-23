import { useLanguage } from '../../context/LanguageContext';
import { FiGlobe } from '../../utils/actionIcons';

function LanguageToggle() {
  const { currentLanguage, switchLanguage, languages } = useLanguage();

  if (!languages || languages.length < 2) return null;

  return (
    <div className="language-toggle" role="group" aria-label="Language">
      <FiGlobe className="ui-icon language-icon" aria-hidden="true" focusable="false" />
      {languages.map((lang, index) => (
        <span key={lang.code}>
          <button
            type="button"
            className={`language-btn ${currentLanguage === lang.code ? 'active' : ''}`}
            onClick={() => switchLanguage(lang.code)}
            aria-pressed={currentLanguage === lang.code}
          >
            {lang.code}
          </button>
          {index < languages.length - 1 && <span className="language-sep">|</span>}
        </span>
      ))}
    </div>
  );
}

export default LanguageToggle;