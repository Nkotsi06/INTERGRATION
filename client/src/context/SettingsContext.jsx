import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { getPublicSettings } from '../api/settingsApi';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    systemName: 'Integrated Government Services',
    systemLogoPath: null,
    ministries: [],
    documentTypes: [],
    statusTypes: [],
    referenceFormats: [],
    defaultLanguage: 'EN',
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const data = await getPublicSettings();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (error) {
      if (error?.status !== 401 && error?.status !== 429) {
        console.error('Failed to load settings:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const getMinistry = useCallback(
    (code) => settings.ministries.find((m) => m.code === code),
    [settings.ministries]
  );

  const getMinistryColour = useCallback(
    (code) => {
      const ministry = getMinistry(code);
      return ministry?.colourHex || '#1A5276';
    },
    [getMinistry]
  );

  const value = useMemo(
    () => ({
      settings,
      loading,
      getMinistry,
      getMinistryColour,
      reload: loadSettings,
    }),
    [settings, loading, getMinistry, getMinistryColour, loadSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}