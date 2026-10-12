import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { login as apiLogin, logout as apiLogout, getSession } from '../api/authApi';
import { useSession } from './SessionContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearVerification } = useSession();

  const checkSession = useCallback(async () => {
    try {
      const session = await getSession();
      if (session?.user) setUser(session.user);
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (credentials, role) => {
    const response = await apiLogin(credentials, role);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      clearVerification();
    }
  }, [clearVerification]);

  const value = useMemo(
    () => ({ user, setUser, login, logout, loading, checkSession }),
    [user, login, logout, loading, checkSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}