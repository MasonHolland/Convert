import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, usePalette } from '@/components/Themed';
import type { Place } from '@/src/api/weather';
import { Icon } from '@/src/components/Icon';
import { WeatherPage } from '@/src/components/WeatherPage';
import { useCurrentPlace } from '@/src/hooks/useCurrentPlace';
import { CURRENT_LOCATION_ID, useAppStore } from '@/src/store/useAppStore';

/** Tab bar height on iOS; content scrolls under it. */
const TAB_BAR_SPACE = 56;

export default function WeatherScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentPlace, status } = useCurrentPlace();
  const savedPlaces = useAppStore((s) => s.savedPlaces);
  const removePlace = useAppStore((s) => s.removePlace);
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList<Place>>(null);

  const places = useMemo(
    () => (currentPlace ? [currentPlace, ...savedPlaces] : savedPlaces),
    [currentPlace, savedPlaces],
  );

  // Jump to a city right after it's added (state adjusted during render; the effect only scrolls).
  const [prevCount, setPrevCount] = useState(savedPlaces.length);
  const [jump, setJump] = useState<{ index: number; n: number } | null>(null);
  if (prevCount !== savedPlaces.length) {
    setPrevCount(savedPlaces.length);
    if (savedPlaces.length > prevCount) {
      const index = places.length - 1;
      setPage(index);
      setJump((j) => ({ index, n: (j?.n ?? 0) + 1 }));
    }
  }
  useEffect(() => {
    if (!jump) return;
    const id = requestAnimationFrame(() => listRef.current?.scrollToIndex({ index: jump.index, animated: false }));
    return () => cancelAnimationFrame(id);
  }, [jump]);
  const activePage = Math.min(page, Math.max(places.length - 1, 0));

  const confirmRemove = (place: Place) =>
    Alert.alert(`Remove ${place.name}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePlace(place.id) },
    ]);

  const addButton = (
    <Pressable
      onPress={() => router.push('/city-search')}
      style={[styles.addButton, { top: insets.top + 6, backgroundColor: c.card }]}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Add city">
      <Icon ios="plus" android="add" size={20} color={c.tint} />
    </Pressable>
  );

  if (places.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        {status === 'checking' ? (
          <ActivityIndicator />
        ) : (
          <>
            <Icon ios="thermometer.sun" android="thermostat" size={48} color={c.secondaryText} />
            <Text style={styles.emptyTitle}>No locations yet</Text>
            <Text style={[styles.emptyBody, { color: c.secondaryText }]}>
              {status === 'denied'
                ? 'Location access is off. Add a city, or allow location access in Settings to see the temperature where you are.'
                : 'Add a city to see its temperature.'}
            </Text>
            <Pressable
              onPress={() => router.push('/city-search')}
              style={[styles.primary, { backgroundColor: c.tint }]}
              accessibilityRole="button">
              <Text style={[styles.primaryText, { color: c.tintText }]}>Add a City</Text>
            </Pressable>
            {status === 'denied' && (
              <Pressable onPress={() => Linking.openSettings()} hitSlop={10}>
                <Text style={[styles.link, { color: c.tint }]}>Open Settings</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        ref={listRef}
        data={places}
        keyExtractor={(p) => p.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <WeatherPage
            place={item}
            isCurrentLocation={item.id === CURRENT_LOCATION_ID}
            width={width}
            topInset={insets.top + 28}
            bottomInset={insets.bottom + TAB_BAR_SPACE}
            onLongPressTitle={item.id === CURRENT_LOCATION_ID ? undefined : () => confirmRemove(item)}
          />
        )}
      />

      {places.length > 1 && (
        <View style={[styles.dots, { top: insets.top + 16 }]} pointerEvents="none">
          {places.map((p, i) =>
            p.id === CURRENT_LOCATION_ID ? (
              <Icon
                key={p.id}
                ios="location.fill"
                android="near_me"
                size={9}
                color={i === activePage ? c.text : c.tertiaryText}
              />
            ) : (
              <View key={p.id} style={[styles.dot, { backgroundColor: i === activePage ? c.text : c.tertiaryText }]} />
            ),
          )}
        </View>
      )}

      {addButton}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  addButton: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '600', marginTop: 8 },
  emptyBody: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  primary: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  primaryText: { fontSize: 17, fontWeight: '600' },
  link: { fontSize: 16, marginTop: 4 },
});
