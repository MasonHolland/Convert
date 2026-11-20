import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, usePalette } from '@/components/Themed';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** iOS-style segmented control. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const c = usePalette();
  return (
    <View style={[styles.track, { backgroundColor: c.fill }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              if (!active) {
                Haptics.selectionAsync().catch(() => {});
                onChange(o.value);
              }
            }}
            style={[styles.segment, active && [styles.active, { backgroundColor: c.card }]]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}>
            <Text style={[styles.label, active && styles.activeLabel]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 9, padding: 2 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 7 },
  active: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '500' },
  activeLabel: { fontWeight: '600' },
});
