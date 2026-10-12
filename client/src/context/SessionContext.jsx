import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getSession } from '../api/authApi';

const SessionContext = createContext(null);

const INITIAL_SESSION = {
  identityVerified: false,
  verifiedCitizenId: null,
  currentMinistry: null,
  temporaryPermissions: [],
};

export function SessionProvider({ children }) {
  const [session, setSession] = useState(INITIAL_SESSION);
  // Until the server answers, "not verified" really means "don't know yet".
  const [loading, setLoading] = useState(true);

  // Ask the server what the current token says. Call on load, after login,
  // and after the verification request succeeds.
  const refreshSession = useCallback(async () => {
    try {
      const data = await getSession();
      setSession((prev) => ({
        ...prev,
        identityVerified: !!data?.identityVerified,
        verifiedCitizenId: data?.verifiedCitizenId || null,
      }));
    } catch {
      setSession(INITIAL_SESSION); // not logged in, or token rejected
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Kept so existing callers still work, but it now trusts the server.
  const verifyIdentity = useCallback(() => refreshSession(), [refreshSession]);
  const clearVerification = useCallback(() => setSession(INITIAL_SESSION), []);
  const setMinistry = useCallback(
    (ministry) => setSession((prev) => ({ ...prev, currentMinistry: ministry })),
    []
  );

  const value = useMemo(
    () => ({ session, loading, refreshSession, verifyIdentity, clearVerification, setMinistry }),
    [session, loading, refreshSession, verifyIdentity, clearVerification, setMinistry]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}