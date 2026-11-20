import { Pressable, StyleSheet, View } from 'react-native';

import { Text, usePalette } from '@/components/Themed';
import { Icon } from './Icon';

type Props = {
  isDefault: boolean;
  defaultLabel: string;
  onSave: () => void;
  onReset: () => void;
};

/** Shows the saved default pair, or offers to save the current pair as the default. */
export function SaveDefaultBar({ isDefault, defaultLabel, onSave, onReset }: Props) {
  const c = usePalette();

  if (isDefault) {
    return (
      <View style={styles.bar}>
        <Icon ios="pin.fill" android="push_pin" size={13} color={c.secondaryText} />
        <Text style={[styles.text, { color: c.secondaryText }]}>Default: {defaultLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <Pressable onPress={onSave} hitSlop={8} accessibilityRole="button">
        <Text style={[styles.action, { color: c.tint }]}>Set as default</Text>
      </Pressable>
      <Text style={{ color: c.tertiaryText }}>·</Text>
      <Pressable onPress={onReset} hitSlop={8} accessibilityRole="button">
        <Text style={[styles.action, { color: c.tint }]}>Back to {defaultLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  text: { fontSize: 13 },
  action: { fontSize: 15, fontWeight: '500' },
});
