import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

const SessionContext = createContext(null);

const INITIAL_SESSION = {
  identityVerified: false,
  verifiedCitizenId: null,
  currentMinistry: null,
  temporaryPermissions: [],
};

export function SessionProvider({ children }) {
  const [session, setSession] = useState(INITIAL_SESSION);

  const verifyIdentity = useCallback((citizenId) => {
    setSession((prev) => ({
      ...prev,
      identityVerified: true,
      verifiedCitizenId: citizenId,
    }));
  }, []);

  const clearVerification = useCallback(() => {
    setSession(INITIAL_SESSION);
  }, []);

  const setMinistry = useCallback((ministry) => {
    setSession((prev) => ({ ...prev, currentMinistry: ministry }));
  }, []);

  const value = useMemo(
    () => ({ session, verifyIdentity, clearVerification, setMinistry }),
    [session, verifyIdentity, clearVerification, setMinistry]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}