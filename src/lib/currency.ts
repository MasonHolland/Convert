export type Rates = Record<string, number>;

/** Converts using rates quoted against a common base (1 base = rates[X] of X). */
export function convertCurrency(amount: number, from: string, to: string, rates: Rates): number | null {
  if (from === to) return amount;
  const rFrom = rates[from];
  const rTo = rates[to];
  if (!rFrom || !rTo) return null;
  return (amount / rFrom) * rTo;
}

/** Common currencies with names, shown first and used when the rate feed hasn't loaded yet. */
export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  NZD: 'New Zealand Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  HKD: 'Hong Kong Dollar',
  SGD: 'Singapore Dollar',
  INR: 'Indian Rupee',
  MXN: 'Mexican Peso',
  BRL: 'Brazilian Real',
  ARS: 'Argentine Peso',
  CLP: 'Chilean Peso',
  COP: 'Colombian Peso',
  PEN: 'Peruvian Sol',
  KRW: 'South Korean Won',
  TWD: 'New Taiwan Dollar',
  THB: 'Thai Baht',
  VND: 'Vietnamese Dong',
  IDR: 'Indonesian Rupiah',
  MYR: 'Malaysian Ringgit',
  PHP: 'Philippine Peso',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  ISK: 'Icelandic Króna',
  PLN: 'Polish Złoty',
  CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint',
  RON: 'Romanian Leu',
  BGN: 'Bulgarian Lev',
  TRY: 'Turkish Lira',
  ILS: 'Israeli New Shekel',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  QAR: 'Qatari Riyal',
  EGP: 'Egyptian Pound',
  ZAR: 'South African Rand',
  NGN: 'Nigerian Naira',
  KES: 'Kenyan Shilling',
  MAD: 'Moroccan Dirham',
  PKR: 'Pakistani Rupee',
  BDT: 'Bangladeshi Taka',
  LKR: 'Sri Lankan Rupee',
  UAH: 'Ukrainian Hryvnia',
  RUB: 'Russian Ruble',
};

export function currencyName(code: string): string {
  if (CURRENCY_NAMES[code]) return CURRENCY_NAMES[code];
  try {
    const dn = new Intl.DisplayNames(undefined, { type: 'currency' });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Flag emoji from the first two letters of an ISO 4217 code (works for most currencies). */
export function currencyFlag(code: string): string {
  const special: Record<string, string> = { EUR: '🇪🇺', XAF: '🌍', XOF: '🌍', XCD: '🌎', XPF: '🌏', ANG: '🇨🇼' };
  if (special[code]) return special[code];
  const cc = code.slice(0, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return '🏳️';
  return String.fromCodePoint(...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

/** All codes to offer: favorites first, then everything in the rate feed (or the known list), sorted. */
export function availableCodes(rates: Rates | undefined, favorites: string[]): string[] {
  const all = new Set<string>(rates ? Object.keys(rates) : Object.keys(CURRENCY_NAMES));
  const rest = [...all].filter((c) => !favorites.includes(c)).sort();
  return [...favorites.filter((f) => all.has(f)), ...rest];
}
