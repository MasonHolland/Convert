import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text, usePalette } from '@/components/Themed';
import { searchPlaces, type Place } from '@/src/api/weather';
import { Icon } from '@/src/components/Icon';
import { useAppStore } from '@/src/store/useAppStore';

export default function CitySearchScreen() {
  const c = usePalette();
  const addPlace = useAppStore((s) => s.addPlace);
  const savedIds = useAppStore((s) => s.savedPlaces.map((p) => p.id).join(','));
  const [query, setQuery] = useState('');
  const [settled, setSettled] = useState<{ q: string; results: Place[]; error: boolean }>({
    q: '',
    results: [],
    error: false,
  });

  // Debounced search; responses for outdated queries are ignored.
  const q = query.trim();
  const active = q.length >= 2;
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchPlaces(q).then(
        (results) => !cancelled && setSettled({ q, results, error: false }),
        () => !cancelled && setSettled({ q, results: [], error: true }),
      );
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, active]);

  const loading = active && settled.q !== q;
  const results = active ? settled.results : [];
  const error = active && !loading && settled.error;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const select = (place: Place) => {
    addPlace(place);
    close();
  };

  const saved = new Set(savedIds.split(','));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <View style={[styles.search, { backgroundColor: c.fill }]}>
          <Icon ios="magnifyingglass" android="search" size={16} color={c.secondaryText} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a city"
            placeholderTextColor={c.secondaryText}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={[styles.input, { color: c.text }]}
          />
        </View>
        <Pressable onPress={() => close()} hitSlop={10} accessibilityRole="button">
          <Text style={[styles.cancel, { color: c.tint }]}>Cancel</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator style={styles.spinner} />}
      {error && !loading && (
        <Text style={[styles.note, { color: c.secondaryText }]}>Search failed. Check your connection.</Text>
      )}
      {active && !loading && !error && results.length === 0 && (
        <Text style={[styles.note, { color: c.secondaryText }]}>No matches for “{q}”.</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => {
          const already = saved.has(item.id);
          return (
            <Pressable
              onPress={() => (already ? close() : select(item))}
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.cardPressed : 'transparent' }]}
              accessibilityRole="button">
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.name}</Text>
                {item.subtitle ? (
                  <Text style={[styles.sub, { color: c.secondaryText }]}>{item.subtitle}</Text>
                ) : null}
              </View>
              {already && <Icon ios="checkmark" android="check" size={16} color={c.tint} />}
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: c.separator }]} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 38, borderRadius: 10 },
  input: { flex: 1, fontSize: 17 },
  cancel: { fontSize: 17 },
  spinner: { marginTop: 16 },
  note: { textAlign: 'center', marginTop: 16, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  rowText: { flex: 1 },
  name: { fontSize: 17 },
  sub: { fontSize: 14, marginTop: 2 },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 20 },
});
