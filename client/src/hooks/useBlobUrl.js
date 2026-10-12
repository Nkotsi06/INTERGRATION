import { useEffect, useState } from 'react';

/**
 * Fetch a Blob once and expose a temporary object URL.
 * Revokes the URL on unmount. Ignores stale responses.
 *
 * @param {Function|null} fetchFn  a function returning a Promise<Blob>
 * @param {Array} deps             dependency array for refetching
 * @returns {string|null}          an object URL or null
 */
export default function useBlobUrl(fetchFn, deps = []) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let createdUrl = null;

    if (!fetchFn) {
      setUrl(null);
      return undefined;
    }

    (async () => {
      try {
        const blob = await fetchFn();
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setUrl(createdUrl);
      } catch {
        if (!cancelled) setUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return url;
}