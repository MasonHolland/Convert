import { useCallback, useEffect, useState } from 'react';

import { fetchForecast, type Place } from '../api/weather';
import { useAppStore } from '../store/useAppStore';

/** Cached forecasts younger than this are shown without refetching on mount. */
const FRESH_MS = 10 * 60 * 1000;

function isFresh(id: string): boolean {
  const cached = useAppStore.getState().forecasts[id];
  return !!cached && Date.now() - cached.fetchedAt < FRESH_MS;
}

export function useForecast(place: Place) {
  const forecast = useAppStore((s) => s.forecasts[place.id]);
  const setForecast = useAppStore((s) => s.setForecast);
  const [loading, setLoading] = useState(() => !isFresh(place.id));
  const [error, setError] = useState<string | null>(null);
  const { id, latitude, longitude } = place;

  const load = useCallback(
    () =>
      fetchForecast(latitude, longitude)
        .then(
          (f) => {
            setForecast(id, f);
            setError(null);
          },
          (e: unknown) => setError(e instanceof Error ? e.message : 'Could not load weather'),
        )
        .finally(() => setLoading(false)),
    [id, latitude, longitude, setForecast],
  );

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    return load();
  }, [load]);

  // Fetch on mount (and when the coordinates change) unless the cache is fresh.
  useEffect(() => {
    if (!isFresh(id)) load();
  }, [id, load]);

  return { forecast, loading, error, refresh };
}
