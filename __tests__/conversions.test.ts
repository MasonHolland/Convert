import { describe, expect, it } from '@jest/globals';
import { cToF, fToC, dual, formatDual } from '../src/lib/temperature';
import { convertUnit, UNITS } from '../src/lib/units';
import { convertCurrency, availableCodes, currencyFlag } from '../src/lib/currency';
import { parseAmount } from '../src/lib/format';

describe('temperature', () => {
  it('converts fixed points', () => {
    expect(cToF(0)).toBe(32);
    expect(cToF(100)).toBe(212);
    expect(cToF(-40)).toBe(-40);
    expect(fToC(212)).toBe(100);
  });
  it('rounds to whole degrees without -0', () => {
    expect(dual(21.3)).toEqual({ c: 21, f: 70 });
    expect(Object.is(dual(-0.2).c, -0)).toBe(false);
    expect(formatDual(0)).toBe('0°C / 32°F');
  });
});

describe('units', () => {
  it('converts weight', () => {
    expect(convertUnit(1, 'weight', 'kg', 'lb')).toBeCloseTo(2.20462, 5);
    expect(convertUnit(16, 'weight', 'oz', 'lb')).toBeCloseTo(1, 10);
    expect(convertUnit(1, 'weight', 'st', 'lb')).toBeCloseTo(14, 4);
  });
  it('converts distance', () => {
    expect(convertUnit(1, 'distance', 'mi', 'km')).toBeCloseTo(1.609344, 10);
    expect(convertUnit(12, 'distance', 'in', 'ft')).toBeCloseTo(1, 10);
    expect(convertUnit(1, 'distance', 'nmi', 'm')).toBe(1852);
  });
  it('is identity for same unit and round-trips every pair', () => {
    for (const category of ['weight', 'distance'] as const) {
      for (const a of UNITS[category]) {
        expect(convertUnit(7.5, category, a.id, a.id)).toBe(7.5);
        for (const b of UNITS[category]) {
          const there = convertUnit(7.5, category, a.id, b.id);
          expect(convertUnit(there, category, b.id, a.id)).toBeCloseTo(7.5, 8);
        }
      }
    }
  });
  it('throws on unknown unit', () => {
    expect(() => convertUnit(1, 'weight', 'kg', 'xx')).toThrow();
  });
});

describe('currency', () => {
  const rates = { USD: 1, EUR: 0.5, JPY: 150 };
  it('converts via base', () => {
    expect(convertCurrency(10, 'USD', 'EUR', rates)).toBe(5);
    expect(convertCurrency(1, 'EUR', 'JPY', rates)).toBe(300);
  });
  it('round-trips', () => {
    const jpy = convertCurrency(42, 'EUR', 'JPY', rates)!;
    expect(convertCurrency(jpy, 'JPY', 'EUR', rates)).toBeCloseTo(42, 10);
  });
  it('returns null for unknown codes', () => {
    expect(convertCurrency(1, 'USD', 'XYZ', rates)).toBeNull();
  });
  it('orders favorites first', () => {
    expect(availableCodes(rates, ['JPY'])).toEqual(['JPY', 'EUR', 'USD']);
  });
  it('builds flags', () => {
    expect(currencyFlag('USD')).toBe('🇺🇸');
    expect(currencyFlag('EUR')).toBe('🇪🇺');
  });
});

describe('parseAmount', () => {
  it.each([
    ['', null],
    ['12', 12],
    ['12.5', 12.5],
    ['12,5', 12.5],
    ['1,234', 1234],
    ['1,234.56', 1234.56],
    ['.5', 0.5],
    ['abc', null],
    ['.', null],
  ])('%p -> %p', (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });
});
