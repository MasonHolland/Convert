import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text, usePalette } from '@/components/Themed';
import { ConverterCard } from '@/src/components/ConverterCard';
import { PickerSheet, type PickerItem } from '@/src/components/PickerSheet';
import { SaveDefaultBar } from '@/src/components/SaveDefaultBar';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { formatNumber, parseAmount } from '@/src/lib/format';
import { CATEGORY_LABELS, convertUnit, getUnit, UNITS, type Category } from '@/src/lib/units';
import { useAppStore, type Pair } from '@/src/store/useAppStore';

const CATEGORIES: Category[] = ['weight', 'distance'];

export default function MeasureScreen() {
  const c = usePalette();
  const defaults = useAppStore((s) => s.measureDefaults);
  const setDefaults = useAppStore((s) => s.setMeasureDefaults);

  const [category, setCategory] = useState<Category>('weight');
  const [pairs, setPairs] = useState<Record<Category, Pair>>(defaults);
  const [amount, setAmount] = useState('1');
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);

  // Follow changes made on the Defaults screen (adjusting state during render, not in an effect).
  const [syncedDefaults, setSyncedDefaults] = useState(defaults);
  if (syncedDefaults !== defaults) {
    setSyncedDefaults(defaults);
    setPairs(defaults);
  }

  const pair = pairs[category];
  const from = getUnit(category, pair.from);
  const to = getUnit(category, pair.to);
  const value = parseAmount(amount);
  const result = value === null ? '—' : formatNumber(convertUnit(value, category, pair.from, pair.to));

  const setPair = (p: Pair) => setPairs((prev) => ({ ...prev, [category]: p }));
  const def = defaults[category];
  const isDefault = def.from === pair.from && def.to === pair.to;

  const items: PickerItem[] = useMemo(
    () =>
      UNITS[category].map((u) => ({
        id: u.id,
        title: u.name,
        subtitle: `${u.symbol} · ${u.system === 'metric' ? 'Metric' : u.system === 'imperial' ? 'Imperial / US' : 'Other'}`,
      })),
    [category],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.content}>
      <SegmentedControl
        options={CATEGORIES.map((k) => ({ value: k, label: CATEGORY_LABELS[k] }))}
        value={category}
        onChange={setCategory}
      />

      <View style={styles.gap} />

      <ConverterCard
        from={{ code: from.symbol, name: from.name, onPress: () => setPicking('from') }}
        to={{ code: to.symbol, name: to.name, onPress: () => setPicking('to') }}
        amount={amount}
        onChangeAmount={setAmount}
        result={result}
        onSwap={() => setPair({ from: pair.to, to: pair.from })}
      />

      <SaveDefaultBar
        isDefault={isDefault}
        defaultLabel={`${getUnit(category, def.from).symbol} → ${getUnit(category, def.to).symbol}`}
        onSave={() => setDefaults(category, pair)}
        onReset={() => setPair(def)}
      />

      {value !== null && (
        <View style={[styles.table, { backgroundColor: c.card }]}>
          <Text style={[styles.tableTitle, { color: c.secondaryText }]}>
            {formatNumber(value)} {from.symbol} in all units
          </Text>
          {UNITS[category]
            .filter((u) => u.id !== from.id)
            .map((u) => (
              <View key={u.id} style={[styles.tableRow, { borderTopColor: c.separator }]}>
                <Text style={styles.tableUnit}>{u.name}</Text>
                <Text style={styles.tableValue} selectable>
                  {formatNumber(convertUnit(value, category, from.id, u.id))} {u.symbol}
                </Text>
              </View>
            ))}
        </View>
      )}

      <PickerSheet
        visible={picking !== null}
        title={picking === 'from' ? 'Convert from' : 'Convert to'}
        items={items}
        selectedId={picking === 'from' ? pair.from : pair.to}
        onSelect={(id) => setPair(picking === 'from' ? { ...pair, from: id } : { ...pair, to: id })}
        onClose={() => setPicking(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  gap: { height: 16 },
  table: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 },
  tableTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', paddingVertical: 8 },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tableUnit: { fontSize: 16 },
  tableValue: { fontSize: 16, fontVariant: ['tabular-nums'] },
});
