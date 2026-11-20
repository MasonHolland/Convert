/** Parses user input like "1,234.5" or "1234,5" into a number, or null if blank/invalid. */
export function parseAmount(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  // Treat a single comma with no dot as a decimal separator (e.g. "12,5").
  let normalized = trimmed;
  if (!normalized.includes('.') && (normalized.match(/,/g) ?? []).length === 1 && !/,\d{3}$/.test(normalized)) {
    normalized = normalized.replace(',', '.');
  } else {
    normalized = normalized.replace(/,/g, '');
  }
  if (!/^-?\d*\.?\d*$/.test(normalized) || normalized === '.' || normalized === '-') return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** Formats a converted measurement with sensible significant digits. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.0001 || abs >= 1e12)) return n.toExponential(4);
  const maxFraction = abs >= 1000 ? 2 : abs >= 1 ? 4 : 6;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: maxFraction }).format(n);
}

/** Formats a money amount with 2 decimals (more for tiny values). */
export function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const digits = abs !== 0 && abs < 0.01 ? 6 : 2;
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: digits === 2 ? 2 : 0,
    maximumFractionDigits: digits,
  }).format(n);
}
