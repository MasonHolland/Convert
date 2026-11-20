import { useCallback, useEffect, useState } from 'react';

import { fetchRates } from '../api/rates';
import { useAppStore } from '../store/useAppStore';

/** Live exchange rates with offline fallback to the last cached snapshot. */
export function useRates() {
  const cached = useAppStore((s) => s.cachedRates);
  const setCached = useAppStore((s) => s.setCachedRates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      fetchRates()
        .then(
          (snapshot) => {
            setCached(snapshot);
            setError(null);
          },
          (e: unknown) => setError(e instanceof Error ? e.message : 'Could not load rates'),
        )
        .finally(() => setLoading(false)),
    [setCached],
  );

  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  // Fetch once when the screen mounts; pull-to-refresh handles the rest.
  useEffect(() => {
    load();
  }, [load]);

  return {
    rates: cached?.rates,
    updatedAt: cached?.updatedAt,
    loading,
    /** Set when the latest fetch failed (we may still have cached rates). */
    error,
    refresh,
  };
}
