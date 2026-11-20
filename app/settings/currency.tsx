import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Row, Section } from '@/src/components/Grouped';
import { PickerSheet, type PickerItem } from '@/src/components/PickerSheet';
import { availableCodes, currencyFlag, currencyName } from '@/src/lib/currency';
import { useAppStore } from '@/src/store/useAppStore';

type Picking = 'from' | 'to' | 'favorite' | null;

export default function CurrencyDefaultsScreen() {
  const defaults = useAppStore((s) => s.currencyDefaults);
  const setDefaults = useAppStore((s) => s.setCurrencyDefaults);
  const toggleFavorite = useAppStore((s) => s.toggleFavoriteCurrency);
  const rates = useAppStore((s) => s.cachedRates?.rates);
  const [picking, setPicking] = useState<Picking>(null);

  const items: PickerItem[] = useMemo(
    () =>
      availableCodes(rates, picking === 'favorite' ? [] : defaults.favorites)
        .filter((code) => picking !== 'favorite' || !defaults.favorites.includes(code))
        .map((code) => ({
          id: code,
          title: code,
          subtitle: currencyName(code),
          leading: currencyFlag(code),
          pinned: defaults.favorites.includes(code),
        })),
    [rates, defaults.favorites, picking],
  );

  const onSelect = (code: string) => {
    if (picking === 'from') setDefaults({ from: code, to: code === defaults.to ? defaults.from : defaults.to });
    else if (picking === 'to') setDefaults({ from: code === defaults.from ? defaults.to : defaults.from, to: code });
    else if (picking === 'favorite') toggleFavorite(code);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Section title="Default pair" footer="The Currency tab opens on this pair every time.">
        <Row
          first
          label="Convert from"
          leading={currencyFlag(defaults.from)}
          value={defaults.from}
          onPress={() => setPicking('from')}
        />
        <Row
          label="Convert to"
          leading={currencyFlag(defaults.to)}
          value={defaults.to}
          onPress={() => setPicking('to')}
        />
      </Section>

      <Section title="Favorites" footer="Favorites are pinned to the top of the currency list and appear as quick picks.">
        {defaults.favorites.map((code, i) => (
          <Row
            key={code}
            first={i === 0}
            label={`${code} — ${currencyName(code)}`}
            leading={currencyFlag(code)}
            onRemove={() => toggleFavorite(code)}
          />
        ))}
        <Row first={defaults.favorites.length === 0} label="Add Favorite…" tint onPress={() => setPicking('favorite')} />
      </Section>

      <PickerSheet
        visible={picking !== null}
        title={picking === 'favorite' ? 'Add favorite' : picking === 'from' ? 'Default from' : 'Default to'}
        items={items}
        searchable
        selectedId={picking === 'from' ? defaults.from : picking === 'to' ? defaults.to : undefined}
        onSelect={onSelect}
        onClose={() => setPicking(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
});
