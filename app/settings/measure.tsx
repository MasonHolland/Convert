import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Row, Section } from '@/src/components/Grouped';
import { PickerSheet, type PickerItem } from '@/src/components/PickerSheet';
import { CATEGORY_LABELS, getUnit, UNITS, type Category } from '@/src/lib/units';
import { useAppStore } from '@/src/store/useAppStore';

const CATEGORIES: Category[] = ['weight', 'distance'];

export default function MeasureDefaultsScreen() {
  const defaults = useAppStore((s) => s.measureDefaults);
  const setDefaults = useAppStore((s) => s.setMeasureDefaults);
  const [picking, setPicking] = useState<{ category: Category; side: 'from' | 'to' } | null>(null);

  const items: PickerItem[] = useMemo(
    () =>
      picking
        ? UNITS[picking.category].map((u) => ({ id: u.id, title: u.name, subtitle: u.symbol }))
        : [],
    [picking],
  );

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {CATEGORIES.map((category) => {
        const pair = defaults[category];
        return (
          <Section key={category} title={CATEGORY_LABELS[category]}>
            <Row
              first
              label="Convert from"
              value={getUnit(category, pair.from).name}
              onPress={() => setPicking({ category, side: 'from' })}
            />
            <Row
              label="Convert to"
              value={getUnit(category, pair.to).name}
              onPress={() => setPicking({ category, side: 'to' })}
            />
          </Section>
        );
      })}

      <PickerSheet
        visible={picking !== null}
        title={picking ? `Default ${picking.side}` : ''}
        items={items}
        selectedId={picking ? defaults[picking.category][picking.side] : undefined}
        onSelect={(id) => {
          if (!picking) return;
          const pair = defaults[picking.category];
          setDefaults(picking.category, picking.side === 'from' ? { ...pair, from: id } : { ...pair, to: id });
        }}
        onClose={() => setPicking(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
});
