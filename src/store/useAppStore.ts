import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { RatesSnapshot } from '../api/rates';
import type { Forecast, Place } from '../api/weather';
import type { Category } from '../lib/units';

export const CURRENT_LOCATION_ID = 'current';

export type Pair = { from: string; to: string };

type State = {
  savedPlaces: Place[];
  /** Last known device location (name filled via reverse geocoding). */
  currentPlace: Place | null;
  forecasts: Record<string, Forecast>;
  currencyDefaults: Pair & { favorites: string[] };
  measureDefaults: Record<Category, Pair>;
  cachedRates: RatesSnapshot | null;
};

type Actions = {
  addPlace: (place: Place) => void;
  removePlace: (id: string) => void;
  setCurrentPlace: (place: Place | null) => void;
  setForecast: (id: string, forecast: Forecast) => void;
  setCurrencyDefaults: (pair: Pair) => void;
  toggleFavoriteCurrency: (code: string) => void;
  setMeasureDefaults: (category: Category, pair: Pair) => void;
  setCachedRates: (snapshot: RatesSnapshot) => void;
};

export const useAppStore = create<State & Actions>()(
  persist(
    (set) => ({
      savedPlaces: [],
      currentPlace: null,
      forecasts: {},
      currencyDefaults: { from: 'USD', to: 'EUR', favorites: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'MXN'] },
      measureDefaults: {
        weight: { from: 'kg', to: 'lb' },
        distance: { from: 'km', to: 'mi' },
      },
      cachedRates: null,

      addPlace: (place) =>
        set((s) => (s.savedPlaces.some((p) => p.id === place.id) ? s : { savedPlaces: [...s.savedPlaces, place] })),
      removePlace: (id) =>
        set((s) => {
          const { [id]: _removed, ...forecasts } = s.forecasts;
          return { savedPlaces: s.savedPlaces.filter((p) => p.id !== id), forecasts };
        }),
      setCurrentPlace: (currentPlace) => set({ currentPlace }),
      setForecast: (id, forecast) => set((s) => ({ forecasts: { ...s.forecasts, [id]: forecast } })),
      setCurrencyDefaults: ({ from, to }) => set((s) => ({ currencyDefaults: { ...s.currencyDefaults, from, to } })),
      toggleFavoriteCurrency: (code) =>
        set((s) => {
          const favs = s.currencyDefaults.favorites;
          const favorites = favs.includes(code) ? favs.filter((c) => c !== code) : [...favs, code];
          return { currencyDefaults: { ...s.currencyDefaults, favorites } };
        }),
      setMeasureDefaults: (category, pair) =>
        set((s) => ({ measureDefaults: { ...s.measureDefaults, [category]: pair } })),
      setCachedRates: (cachedRates) => set({ cachedRates }),
    }),
    {
      name: 'convert-app',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** True once persisted state has been loaded from storage. */
export function hasHydrated(): boolean {
  return useAppStore.persist.hasHydrated();
}

export function onHydrated(cb: () => void): () => void {
  return useAppStore.persist.onFinishHydration(cb);
}
