import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { getLanguages, getTranslations } from '../api/settingsApi';
import LanguageObserver, { buildLookup } from '../i18n/LanguageObserver';

const LanguageContext = createContext(null);

const EN_CODE = 'EN';

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('language') || import.meta.env.VITE_DEFAULT_LANGUAGE || 'EN'
  );
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState({});
  const [enTranslations, setEnTranslations] = useState({});
  const [lookup, setLookup] = useState(null);
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);

  // Load available languages (non-blocking).
  useEffect(() => {
    getLanguages()
      .then((data) => setLanguages(data || []))
      .catch(() => {});
  }, []);

  // Load English reference map (non-blocking).
  useEffect(() => {
    let cancelled = false;
    getTranslations(EN_CODE)
      .then((data) => { if (!cancelled) setEnTranslations(data || {}); })
      .catch(() => { if (!cancelled) setEnTranslations({}); });
    return () => { cancelled = true; };
  }, []);

  // Load current language (non-blocking).
  useEffect(() => {
    let cancelled = false;
    getTranslations(currentLanguage)
      .then((data) => { if (!cancelled) setTranslations(data || {}); })
      .catch(() => { if (!cancelled) setTranslations({}); });
    localStorage.setItem('language', currentLanguage);
    return () => { cancelled = true; };
  }, [currentLanguage]);

  // Ready as soon as English is loaded, OR after 3 seconds, whichever is first.
  // This guarantees the app never hangs on "Loading…" because of a slow or
  // unreachable backend.
  useEffect(() => {
    if (Object.keys(enTranslations).length > 0) {
      setReady(true);
      return;
    }
    const t = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(t);
  }, [enTranslations]);

  // Build reverse lookup for the observer.
  useEffect(() => {
    if (currentLanguage === EN_CODE) {
      setLookup(null);
      setVersion((v) => v + 1);
      return;
    }
    if (Object.keys(enTranslations).length === 0) return;
    if (Object.keys(translations).length === 0) return;
    setLookup(buildLookup(enTranslations, translations));
    setVersion((v) => v + 1);
  }, [currentLanguage, translations, enTranslations]);

  const t = useCallback(
    (key, vars) => {
      let value = translations[key] || enTranslations[key] || key;
      if (vars && typeof vars === 'object') {
        Object.keys(vars).forEach((k) => {
          value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
        });
      }
      return value;
    },
    [translations, enTranslations]
  );

  const switchLanguage = useCallback((langCode) => {
    setCurrentLanguage(langCode);
  }, []);

  const value = useMemo(
    () => ({ currentLanguage, languages, switchLanguage, t }),
    [currentLanguage, languages, switchLanguage, t]
  );

  if (!ready) {
    return (
      <div className="page-loading" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      <LanguageObserver lookup={lookup} version={version} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}