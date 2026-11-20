import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, usePalette } from '@/components/Themed';
import { Icon } from './Icon';

/** iOS inset-grouped section with header and footer text. */
export function Section({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const c = usePalette();
  return (
    <View style={styles.section}>
      {title ? <Text style={[styles.header, { color: c.secondaryText }]}>{title}</Text> : null}
      <View style={[styles.card, { backgroundColor: c.card }]}>{children}</View>
      {footer ? <Text style={[styles.footer, { color: c.secondaryText }]}>{footer}</Text> : null}
    </View>
  );
}

type RowProps = {
  label: string;
  value?: string;
  leading?: string;
  onPress?: () => void;
  first?: boolean;
  /** Trailing accessory: chevron (default when pressable) or a remove button. */
  onRemove?: () => void;
  tint?: boolean;
};

export function Row({ label, value, leading, onPress, first, onRemove, tint }: RowProps) {
  const c = usePalette();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.cardPressed : 'transparent' }]}
      accessibilityRole={onPress ? 'button' : undefined}>
      {!first && <View style={[styles.sep, { backgroundColor: c.separator }]} />}
      {leading ? <Text style={styles.leading}>{leading}</Text> : null}
      <Text style={[styles.label, tint && { color: c.tint }]}>{label}</Text>
      {value ? <Text style={[styles.value, { color: c.secondaryText }]}>{value}</Text> : null}
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} accessibilityLabel={`Remove ${label}`}>
          <Icon ios="minus.circle.fill" android="remove_circle" size={22} color={c.danger} />
        </Pressable>
      ) : onPress && !tint ? (
        <Icon ios="chevron.right" android="chevron_right" size={14} color={c.tertiaryText} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  header: { fontSize: 13, textTransform: 'uppercase', marginLeft: 16, marginBottom: 6 },
  footer: { fontSize: 13, marginHorizontal: 16, marginTop: 6 },
  card: { borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 46, paddingHorizontal: 16, gap: 10 },
  sep: { position: 'absolute', top: 0, left: 16, right: 0, height: StyleSheet.hairlineWidth },
  leading: { fontSize: 22 },
  label: { flex: 1, fontSize: 17 },
  value: { fontSize: 17 },
});
