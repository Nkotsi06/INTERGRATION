import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => removeNotification(id), duration);
      }
      return id;
    },
    [removeNotification]
  );

  const success = useCallback(
    (message) => addNotification(message, 'success'),
    [addNotification]
  );
  const error = useCallback(
    (message) => addNotification(message, 'error'),
    [addNotification]
  );
  const warning = useCallback(
    (message) => addNotification(message, 'warning'),
    [addNotification]
  );
  const info = useCallback(
    (message) => addNotification(message, 'info'),
    [addNotification]
  );

  const value = useMemo(
    () => ({
      notifications,
      success,
      error,
      warning,
      info,
      removeNotification,
    }),
    [notifications, success, error, warning, info, removeNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationViewport
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

function NotificationViewport({ notifications, onDismiss }) {
  if (notifications.length === 0) return null;
  return (
    <div className="notification-viewport" role="region" aria-live="polite">
      {notifications.map((n) => (
        <div key={n.id} className={`notification notification-${n.type}`}>
          <span>{n.message}</span>
          <button
            type="button"
            className="notification-close"
            onClick={() => onDismiss(n.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}