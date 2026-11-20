import { describe, expect, it } from '@jest/globals';

import { parseForecast } from '../src/api/weather';
import { formatHour, formatWeekday } from '../src/lib/time';

const hours = Array.from({ length: 48 }, (_, i) => {
  const day = 20 + Math.floor(i / 24);
  return `2026-11-${day}T${String(i % 24).padStart(2, '0')}:00`;
});

const sample = {
  timezone: 'Europe/London',
  current: { time: '2026-11-20T04:15', temperature_2m: 7.5, apparent_temperature: 5.5 },
  hourly: { time: hours, temperature_2m: hours.map((_, i) => i) },
  daily: {
    time: ['2026-11-20', '2026-11-21'],
    temperature_2m_max: [9.6, 10.3],
    temperature_2m_min: [6.4, 6.1],
  },
};

describe('parseForecast', () => {
  const f = parseForecast(sample, 123);

  it('maps current and today', () => {
    expect(f.current).toEqual({ time: '2026-11-20T04:15', temp: 7.5, feelsLike: 5.5 });
    expect(f.today).toEqual({ high: 9.6, low: 6.4 });
    expect(f.fetchedAt).toBe(123);
  });

  it('starts hourly at the current hour and keeps 24 entries', () => {
    expect(f.hourly).toHaveLength(24);
    expect(f.hourly[0]).toEqual({ time: '2026-11-20T04:00', temp: 4 });
    expect(f.hourly[23].time).toBe('2026-11-21T03:00');
  });

  it('maps daily highs and lows', () => {
    expect(f.daily[1]).toEqual({ date: '2026-11-21', high: 10.3, low: 6.1 });
  });
});

describe('time formatting', () => {
  it('formats the location wall-clock time without device timezone shifts', () => {
    expect(formatHour('2026-11-20T14:00')).toMatch(/14|2/);
    expect(formatWeekday('2026-11-20')).toMatch(/Fri/);
  });
});
