export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

/** Rounds to a whole degree, avoiding "-0". */
export function roundDeg(n: number): number {
  const r = Math.round(n);
  return r === 0 ? 0 : r;
}

/** Both units from a Celsius value, rounded to whole degrees. */
export function dual(c: number): { c: number; f: number } {
  return { c: roundDeg(c), f: roundDeg(cToF(c)) };
}

/** "21°C / 70°F" */
export function formatDual(c: number): string {
  const d = dual(c);
  return `${d.c}°C / ${d.f}°F`;
}
