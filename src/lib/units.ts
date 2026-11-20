export type Category = 'weight' | 'distance';

export type Unit = {
  id: string;
  name: string;
  symbol: string;
  system: 'metric' | 'imperial' | 'other';
  /** How many base units (grams or metres) one of this unit equals. */
  factor: number;
};

export const UNITS: Record<Category, Unit[]> = {
  weight: [
    { id: 'mg', name: 'Milligram', symbol: 'mg', system: 'metric', factor: 0.001 },
    { id: 'g', name: 'Gram', symbol: 'g', system: 'metric', factor: 1 },
    { id: 'kg', name: 'Kilogram', symbol: 'kg', system: 'metric', factor: 1000 },
    { id: 't', name: 'Metric ton', symbol: 't', system: 'metric', factor: 1_000_000 },
    { id: 'oz', name: 'Ounce', symbol: 'oz', system: 'imperial', factor: 28.349523125 },
    { id: 'lb', name: 'Pound', symbol: 'lb', system: 'imperial', factor: 453.59237 },
    { id: 'st', name: 'Stone', symbol: 'st', system: 'imperial', factor: 6350.29318 },
  ],
  distance: [
    { id: 'mm', name: 'Millimetre', symbol: 'mm', system: 'metric', factor: 0.001 },
    { id: 'cm', name: 'Centimetre', symbol: 'cm', system: 'metric', factor: 0.01 },
    { id: 'm', name: 'Metre', symbol: 'm', system: 'metric', factor: 1 },
    { id: 'km', name: 'Kilometre', symbol: 'km', system: 'metric', factor: 1000 },
    { id: 'in', name: 'Inch', symbol: 'in', system: 'imperial', factor: 0.0254 },
    { id: 'ft', name: 'Foot', symbol: 'ft', system: 'imperial', factor: 0.3048 },
    { id: 'yd', name: 'Yard', symbol: 'yd', system: 'imperial', factor: 0.9144 },
    { id: 'mi', name: 'Mile', symbol: 'mi', system: 'imperial', factor: 1609.344 },
    { id: 'nmi', name: 'Nautical mile', symbol: 'nmi', system: 'other', factor: 1852 },
  ],
};

export const CATEGORY_LABELS: Record<Category, string> = {
  weight: 'Weight',
  distance: 'Distance',
};

export function getUnit(category: Category, id: string): Unit {
  const unit = UNITS[category].find((u) => u.id === id);
  if (!unit) throw new Error(`Unknown ${category} unit: ${id}`);
  return unit;
}

export function convertUnit(value: number, category: Category, fromId: string, toId: string): number {
  if (fromId === toId) return value;
  const from = getUnit(category, fromId);
  const to = getUnit(category, toId);
  return (value * from.factor) / to.factor;
}
