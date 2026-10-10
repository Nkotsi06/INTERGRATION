import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { getLanguages, getTranslations } from '../api/settingsApi';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('language') || import.meta.env.VITE_DEFAULT_LANGUAGE || 'EN'
  );
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState({});

  const loadLanguages = useCallback(async () => {
    try {
      const data = await getLanguages();
      setLanguages(data);
    } catch (error) {
      if (error?.status !== 401 && error?.status !== 429) {
        console.error('Failed to load languages:', error);
      }
    }
  }, []);

  const loadTranslations = useCallback(async (langCode) => {
    try {
      const data = await getTranslations(langCode);
      setTranslations(data);
    } catch (error) {
      if (error?.status !== 401 && error?.status !== 429) {
        console.error('Failed to load translations:', error);
      }
    }
  }, []);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  useEffect(() => {
    loadTranslations(currentLanguage);
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage, loadTranslations]);

  const t = useCallback((key) => translations[key] || key, [translations]);

  const switchLanguage = useCallback((langCode) => {
    setCurrentLanguage(langCode);
  }, []);

  const value = useMemo(
    () => ({ currentLanguage, languages, switchLanguage, t }),
    [currentLanguage, languages, switchLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}