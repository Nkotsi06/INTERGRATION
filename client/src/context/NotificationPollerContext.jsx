import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './AuthContext';

const NotificationPollerContext = createContext(null);

// Default poll interval in seconds. Override by adding a row to
// system_settings with key 'notifications_poll_seconds'.
const DEFAULT_INTERVAL = 60;

export function NotificationPollerProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestBatch, setLatestBatch] = useState(null); // { count, at }
  const previousCountRef = useRef(0);
  const intervalRef = useRef(DEFAULT_INTERVAL * 1000);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      previousCountRef.current = 0;
      return;
    }
    try {
      const data = await apiClient.get('/notifications/unread-count');
      const count = data?.count ?? 0;
      const previous = previousCountRef.current;

      if (count > previous) {
        // New batch arrived — remember it so the banner can show once.
        setLatestBatch({ count, at: Date.now() });
      }
      previousCountRef.current = count;
      setUnreadCount(count);
    } catch {
      // Silent — polling should never break the page.
    }
  }, [user]);

  // Read the interval from public settings once.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/settings/public')
      .then((s) => {
        if (cancelled) return;
        const seconds = Number(s?.notifications_poll_seconds);
        if (Number.isFinite(seconds) && seconds > 0) {
          intervalRef.current = seconds * 1000;
        }
      })
      .catch(() => { /* keep default */ });
    return () => {
      cancelled = true;
    };
  }, []);

  // Poll on the interval while logged in.
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      previousCountRef.current = 0;
      return undefined;
    }
    refresh();
    const id = setInterval(refresh, intervalRef.current);
    return () => clearInterval(id);
  }, [user, refresh]);

  const dismissBatch = useCallback(() => setLatestBatch(null), []);

  const clearAll = useCallback(() => {
    setUnreadCount(0);
    previousCountRef.current = 0;
    setLatestBatch(null);
  }, []);

  const value = useMemo(
    () => ({
      unreadCount,
      latestBatch,
      refresh,
      dismissBatch,
      clearAll,
    }),
    [unreadCount, latestBatch, refresh, dismissBatch, clearAll]
  );

  return (
    <NotificationPollerContext.Provider value={value}>
      {children}
    </NotificationPollerContext.Provider>
  );
}

export function useNotificationPoller() {
  const ctx = useContext(NotificationPollerContext);
  if (!ctx) {
    throw new Error(
      'useNotificationPoller must be used within NotificationPollerProvider'
    );
  }
  return ctx;
}