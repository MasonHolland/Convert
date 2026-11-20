import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, usePalette } from '@/components/Themed';
import { Icon } from './Icon';

export type PickerItem = {
  id: string;
  title: string;
  subtitle?: string;
  leading?: string;
  pinned?: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selectedId?: string;
  searchable?: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  /** Optional star toggle shown on each row. */
  onTogglePin?: (id: string) => void;
};

/** iOS page-sheet list picker with optional search and pin (favorite) toggles. */
export function PickerSheet({ visible, title, items, selectedId, searchable, onSelect, onClose, onTogglePin }: Props) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || i.subtitle?.toLowerCase().includes(q),
    );
  }, [items, query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={[styles.sheet, { backgroundColor: c.background }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Done">
            <Text style={[styles.done, { color: c.tint }]}>Done</Text>
          </Pressable>
        </View>
        {searchable && (
          <View style={[styles.search, { backgroundColor: c.fill }]}>
            <Icon ios="magnifyingglass" android="search" size={16} color={c.secondaryText} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor={c.secondaryText}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              style={[styles.searchInput, { color: c.text }]}
            />
          </View>
        )}
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: c.separator }]} />}
          style={[styles.list, { backgroundColor: c.card }]}
          renderItem={({ item }) => {
            const selected = item.id === selectedId;
            return (
              <Pressable
                onPress={() => {
                  onSelect(item.id);
                  close();
                }}
                style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.cardPressed : c.card }]}
                accessibilityRole="button"
                accessibilityState={{ selected }}>
                {item.leading ? <Text style={styles.leading}>{item.leading}</Text> : null}
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={[styles.rowSubtitle, { color: c.secondaryText }]}>{item.subtitle}</Text>
                  ) : null}
                </View>
                {selected && <Icon ios="checkmark" android="check" size={18} color={c.tint} />}
                {onTogglePin && (
                  <Pressable
                    onPress={() => onTogglePin(item.id)}
                    hitSlop={10}
                    style={styles.pin}
                    accessibilityLabel={item.pinned ? 'Remove from favorites' : 'Add to favorites'}>
                    <Icon
                      ios={item.pinned ? 'star.fill' : 'star'}
                      android="star"
                      size={20}
                      color={item.pinned ? c.warm : c.tertiaryText}
                    />
                  </Pressable>
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  done: { fontSize: 17, fontWeight: '600' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 38,
  },
  searchInput: { flex: 1, fontSize: 17 },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  leading: { fontSize: 26 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 17 },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
  pin: { paddingLeft: 8 },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});
