import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text, usePalette } from '@/components/Themed';
import { Icon } from './Icon';

type Side = {
  /** Big label on the picker button, e.g. "USD" or "kg". */
  code: string;
  /** Smaller label, e.g. "US Dollar". */
  name: string;
  leading?: string;
  onPress: () => void;
};

type Props = {
  from: Side;
  to: Side;
  amount: string;
  onChangeAmount: (text: string) => void;
  result: string;
  onSwap: () => void;
};

/** Input row on top, result row below, swap button between. Shared by Currency and Measure. */
export function ConverterCard({ from, to, amount, onChangeAmount, result, onSwap }: Props) {
  const c = usePalette();

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={styles.row}>
        <UnitButton side={from} />
        <TextInput
          value={amount}
          onChangeText={onChangeAmount}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={c.tertiaryText}
          style={[styles.input, { color: c.text }]}
          selectTextOnFocus
          maxLength={18}
          accessibilityLabel={`Amount in ${from.name}`}
        />
      </View>

      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: c.separator }]} />
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onSwap();
          }}
          style={({ pressed }) => [styles.swap, { backgroundColor: pressed ? c.cardPressed : c.fill }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Swap">
          <Icon ios="arrow.up.arrow.down" android="swap_vert" size={18} color={c.tint} />
        </Pressable>
        <View style={[styles.line, { backgroundColor: c.separator }]} />
      </View>

      <View style={styles.row}>
        <UnitButton side={to} />
        <Text
          style={[styles.result, { color: c.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          selectable
          accessibilityLabel={`Result in ${to.name}: ${result}`}>
          {result}
        </Text>
      </View>
    </View>
  );
}

function UnitButton({ side }: { side: Side }) {
  const c = usePalette();
  return (
    <Pressable
      onPress={side.onPress}
      style={({ pressed }) => [styles.unit, { opacity: pressed ? 0.6 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`Change ${side.name}`}>
      <View style={styles.unitTop}>
        {side.leading ? <Text style={styles.leading}>{side.leading}</Text> : null}
        <Text style={styles.code}>{side.code}</Text>
        <Icon ios="chevron.down" android="expand_more" size={12} color={c.secondaryText} />
      </View>
      <Text style={[styles.name, { color: c.secondaryText }]} numberOfLines={1}>
        {side.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 72, gap: 12 },
  unit: { width: 128 },
  unitTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leading: { fontSize: 22 },
  code: { fontSize: 20, fontWeight: '600' },
  name: { fontSize: 13, marginTop: 2 },
  input: { flex: 1, fontSize: 34, fontWeight: '300', textAlign: 'right', fontVariant: ['tabular-nums'] },
  result: { flex: 1, fontSize: 34, fontWeight: '600', textAlign: 'right', fontVariant: ['tabular-nums'] },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  swap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
