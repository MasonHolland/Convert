import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Text, usePalette } from '@/components/Themed';
import { ConverterCard } from '@/src/components/ConverterCard';
import { Icon } from '@/src/components/Icon';
import { PickerSheet, type PickerItem } from '@/src/components/PickerSheet';
import { SaveDefaultBar } from '@/src/components/SaveDefaultBar';
import { useRates } from '@/src/hooks/useRates';
import { availableCodes, convertCurrency, currencyFlag, currencyName } from '@/src/lib/currency';
import { formatMoney, parseAmount } from '@/src/lib/format';
import { useAppStore, type Pair } from '@/src/store/useAppStore';

export default function CurrencyScreen() {
  const c = usePalette();
  const defaults = useAppStore((s) => s.currencyDefaults);
  const setDefaults = useAppStore((s) => s.setCurrencyDefaults);
  const toggleFavorite = useAppStore((s) => s.toggleFavoriteCurrency);
  const { rates, updatedAt, loading, error, refresh } = useRates();

  const [pair, setPair] = useState<Pair>({ from: defaults.from, to: defaults.to });
  const [amount, setAmount] = useState('1');
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);

  // Follow changes to the default pair made on the Defaults screen (not favorites edits).
  const defaultKey = `${defaults.from}>${defaults.to}`;
  const [syncedKey, setSyncedKey] = useState(defaultKey);
  if (syncedKey !== defaultKey) {
    setSyncedKey(defaultKey);
    setPair({ from: defaults.from, to: defaults.to });
  }

  const value = parseAmount(amount);
  const converted = value !== null && rates ? convertCurrency(value, pair.from, pair.to, rates) : null;
  const unitRate = rates ? convertCurrency(1, pair.from, pair.to, rates) : null;
  const isDefault = pair.from === defaults.from && pair.to === defaults.to;

  const items: PickerItem[] = useMemo(
    () =>
      availableCodes(rates, defaults.favorites).map((code) => ({
        id: code,
        title: code,
        subtitle: currencyName(code),
        leading: currencyFlag(code),
        pinned: defaults.favorites.includes(code),
      })),
    [rates, defaults.favorites],
  );

  const quickPicks = defaults.favorites.filter((f) => f !== pair.from);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <ConverterCard
        from={{
          code: pair.from,
          name: currencyName(pair.from),
          leading: currencyFlag(pair.from),
          onPress: () => setPicking('from'),
        }}
        to={{
          code: pair.to,
          name: currencyName(pair.to),
          leading: currencyFlag(pair.to),
          onPress: () => setPicking('to'),
        }}
        amount={amount}
        onChangeAmount={setAmount}
        result={converted === null ? '—' : formatMoney(converted)}
        onSwap={() => setPair({ from: pair.to, to: pair.from })}
      />

      <SaveDefaultBar
        isDefault={isDefault}
        defaultLabel={`${defaults.from} → ${defaults.to}`}
        onSave={() => setDefaults(pair)}
        onReset={() => setPair({ from: defaults.from, to: defaults.to })}
      />

      {quickPicks.length > 0 && (
        <View>
          <Text style={[styles.sectionTitle, { color: c.secondaryText }]}>Favorites</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {quickPicks.map((code) => {
              const active = code === pair.to;
              return (
                <Pressable
                  key={code}
                  onPress={() => setPair({ ...pair, to: code })}
                  style={[styles.chip, { backgroundColor: active ? c.tint : c.card }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}>
                  <Text style={styles.chipFlag}>{currencyFlag(code)}</Text>
                  <Text style={[styles.chipText, active && { color: c.tintText }]}>{code}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={[styles.status, { backgroundColor: c.card }]}>
        {unitRate !== null ? (
          <Text style={styles.rate}>
            1 {pair.from} = {formatMoney(unitRate)} {pair.to}
          </Text>
        ) : (
          <Text style={styles.rate}>{loading ? 'Loading rates…' : 'No rates available yet'}</Text>
        )}
        {updatedAt ? (
          <Text style={[styles.meta, { color: c.secondaryText }]}>
            Rates as of {new Date(updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        ) : null}
        {error ? (
          <View style={styles.errorRow}>
            <Icon ios="wifi.slash" android="wifi_off" size={13} color={c.warm} />
            <Text style={[styles.meta, { color: c.warm }]}>
              {rates ? 'Offline — showing saved rates' : 'Could not load rates. Pull down to retry.'}
            </Text>
          </View>
        ) : null}
      </View>

      <PickerSheet
        visible={picking !== null}
        title={picking === 'from' ? 'Convert from' : 'Convert to'}
        items={items}
        searchable
        selectedId={picking === 'from' ? pair.from : pair.to}
        onSelect={(id) => setPair(picking === 'from' ? { ...pair, from: id } : { ...pair, to: id })}
        onClose={() => setPicking(null)}
        onTogglePin={toggleFavorite}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  chips: { gap: 8, paddingBottom: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  chipFlag: { fontSize: 18 },
  chipText: { fontSize: 15, fontWeight: '600' },
  status: { marginTop: 20, borderRadius: 16, padding: 16, gap: 6 },
  rate: { fontSize: 17, fontWeight: '500' },
  meta: { fontSize: 13 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
