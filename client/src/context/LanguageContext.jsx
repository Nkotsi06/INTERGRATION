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
  const [translations, setTranslations] = useState({});       // current lang { key: value }
  const [enTranslations, setEnTranslations] = useState({});   // English  { key: value }
  const [lookup, setLookup] = useState(null);                 // reverse map for observer
  const [version, setVersion] = useState(0);                  // bump to re-run observer
  const [ready, setReady] = useState(false);                  // both maps loaded

  // ── Load available languages once ─────────────────────────────────────
  useEffect(() => {
    getLanguages()
      .then((data) => setLanguages(data || []))
      .catch((error) => {
        if (error?.status !== 401 && error?.status !== 429) {
          console.error('Failed to load languages:', error);
        }
      });
  }, []);

  // ── Always keep an English map for the observer to reference ──────────
  useEffect(() => {
    let cancelled = false;
    getTranslations(EN_CODE)
      .then((data) => {
        if (!cancelled) setEnTranslations(data || {});
      })
      .catch((error) => {
        if (error?.status !== 401 && error?.status !== 429) {
          console.error('Failed to load English translations:', error);
        }
        // Even on error, mark English as "loaded" so the app can render.
        if (!cancelled) setEnTranslations({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Load the current language on change ───────────────────────────────
  useEffect(() => {
    let cancelled = false;
    getTranslations(currentLanguage)
      .then((data) => {
        if (!cancelled) setTranslations(data || {});
      })
      .catch((error) => {
        if (error?.status !== 401 && error?.status !== 429) {
          console.error('Failed to load translations:', error);
        }
        if (!cancelled) setTranslations({});
      });
    localStorage.setItem('language', currentLanguage);
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  // ── Mark ready once both maps are present ─────────────────────────────
  useEffect(() => {
    const enLoaded = Object.keys(enTranslations).length > 0;
    const currentLoaded = Object.keys(translations).length > 0;
    if (currentLanguage === EN_CODE) {
      setReady(enLoaded);
      return;
    }
    setReady(enLoaded && currentLoaded);
  }, [currentLanguage, enTranslations, translations]);

  // ── Build the reverse lookup whenever either map changes ──────────────
  useEffect(() => {
    if (currentLanguage === EN_CODE) {
      setLookup(null);
      setVersion((v) => v + 1);
      return;
    }
    if (Object.keys(enTranslations).length === 0) return;
    if (Object.keys(translations).length === 0) return;

    const map = buildLookup(enTranslations, translations);
    setLookup(map);
    setVersion((v) => v + 1);
  }, [currentLanguage, translations, enTranslations]);

  // ── t() for pages that already consume it (kept for future use) ───────
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

  // Wait for the translation maps before mounting the app. This prevents a
  // flash of English text when the user's saved language is not English.
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