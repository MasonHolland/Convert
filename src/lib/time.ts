/**
 * Open-Meteo returns local wall-clock times for the location ("2026-11-20T14:00").
 * We format them as UTC so the device's own timezone never shifts them.
 */
function wallClock(iso: string): Date {
  const [d, t = '00:00'] = iso.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, min] = t.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, day, h, min));
}

export function formatHour(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', timeZone: 'UTC' }).format(wallClock(iso));
}

export function formatWeekday(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' }).format(wallClock(isoDate));
}

export function formatUpdated(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
