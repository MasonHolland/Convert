import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { Place } from '../api/weather';
import { CURRENT_LOCATION_ID, useAppStore } from '../store/useAppStore';

export type LocationStatus = 'checking' | 'granted' | 'denied' | 'unavailable';

type Resolution = { status: Exclude<LocationStatus, 'checking'>; place?: Place };

/** Asks for "when in use" permission, then resolves the device position and a friendly name. */
async function resolveCurrentPlace(): Promise<Resolution> {
  let perm = await Location.getForegroundPermissionsAsync();
  if (perm.status === 'undetermined' && perm.canAskAgain) {
    perm = await Location.requestForegroundPermissionsAsync();
  }
  if (perm.status !== 'granted') return { status: 'denied' };

  try {
    // A recent last-known fix is near-instant; fall back to a fresh one.
    const last = await Location.getLastKnownPositionAsync({ maxAge: 15 * 60 * 1000 }).catch(() => null);
    const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    const { latitude, longitude } = pos.coords;

    let name = 'My Location';
    let subtitle = '';
    try {
      const [addr] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addr) {
        name = addr.city ?? addr.subregion ?? addr.region ?? name;
        subtitle = [addr.region, addr.country].filter((p) => p && p !== name).join(', ');
      }
    } catch {
      // Reverse geocoding isn't available everywhere (e.g. web); the generic name is fine.
    }
    return { status: 'granted', place: { id: CURRENT_LOCATION_ID, name, subtitle, latitude, longitude } };
  } catch {
    // Permission granted but location services are off or timed out; keep any cached place.
    return { status: 'granted' };
  }
}

export function useCurrentPlace() {
  const currentPlace = useAppStore((s) => s.currentPlace);
  const setCurrentPlace = useAppStore((s) => s.setCurrentPlace);
  const [status, setStatus] = useState<LocationStatus>('checking');

  const locate = useCallback(
    () =>
      resolveCurrentPlace().then(
        (r) => {
          setStatus(r.status);
          if (r.place) setCurrentPlace(r.place);
        },
        () => setStatus('unavailable'),
      ),
    [setCurrentPlace],
  );

  useEffect(() => {
    locate();
  }, [locate]);

  return { currentPlace: status === 'granted' ? currentPlace : null, status, relocate: locate };
}
