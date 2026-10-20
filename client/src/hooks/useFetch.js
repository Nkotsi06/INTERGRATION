import { useState, useEffect, useCallback } from 'react';

function useFetch(fetchFn, deps = [], options = {}) {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const pollInterval = Number(options.pollInterval);
    if (!Number.isFinite(pollInterval) || pollInterval <= 0) return undefined;
    const timer = window.setInterval(() => load(true), pollInterval);
    return () => window.clearInterval(timer);
  }, [load, options.pollInterval]);

  return { data, loading, error, refetch: load };
}

export default useFetch;