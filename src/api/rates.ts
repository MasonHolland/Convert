import type { Rates } from '../lib/currency';

export type RatesSnapshot = {
  base: string;
  rates: Rates;
  /** When the provider last updated the rates (ms since epoch). */
  updatedAt: number;
};

type ErApiResponse = {
  result: 'success' | 'error';
  base_code: string;
  time_last_update_unix: number;
  rates: Rates;
  'error-type'?: string;
};

/** Free, no-key rate feed (updated daily). https://www.exchangerate-api.com/docs/free */
export async function fetchRates(): Promise<RatesSnapshot> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
    if (!res.ok) throw new Error(`Rates request failed (${res.status})`);
    const data = (await res.json()) as ErApiResponse;
    if (data.result !== 'success') throw new Error(data['error-type'] ?? 'Rates unavailable');
    return { base: data.base_code, rates: data.rates, updatedAt: data.time_last_update_unix * 1000 };
  } finally {
    clearTimeout(timer);
  }
}
