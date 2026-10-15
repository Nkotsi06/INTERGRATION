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

  useEffect(() => {
    if (!ministry || !serviceCode) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;

    async function load() {
      try {
        const data = await apiClient.get('/services/public', {
          params: { ministry },
        });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const match = list.find((s) => s.code === serviceCode);
        if (match) {
          setFee(Number(match.fee) || 0);
          setCurrency(match.fee_currency || 'LSL');
        }
      } catch {
        // Non-fatal — page still works with fee = 0.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ministry, serviceCode]);

  return { fee, currency, loading };
}