import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

/**
 * Fetch the current fee for one service code from the fee schedule.
 *
 *   const { fee, loading } = useServiceFee('TRAFFIC', 'LICENCE_RENEWAL');
 *
 * Returns:
 *   fee     — number (0 if none)
 *   currency
 *   loading — boolean
 */
export default function useServiceFee(ministry, serviceCode) {
  const [fee, setFee] = useState(0);
  const [currency, setCurrency] = useState('LSL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ministry || !serviceCode) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const data = await apiClient.get('/services/public', {
          params: { ministry },
        });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const match = list.find((s) => s.code === serviceCode);
        if (!match) {
          setError('Fee details for this service could not be found.');
          return;
        }
        setFee(Number(match.fee) || 0);
        setCurrency(match.fee_currency || 'LSL');
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load the service fee.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ministry, serviceCode]);

  return { fee, currency, loading, error };
}