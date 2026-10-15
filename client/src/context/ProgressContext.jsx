import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [activeCount, setActiveCount] = useState(0);
  const counterRef = useRef(0);

  const start = useCallback(() => {
    counterRef.current += 1;
    setActiveCount(counterRef.current);
  }, []);

  const stop = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    setActiveCount(counterRef.current);
  }, []);

  const value = useMemo(
    () => ({ activeCount, start, stop, isActive: activeCount > 0 }),
    [activeCount, start, stop]
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}