import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { Text, usePalette } from '@/components/Themed';
import { dual } from '../lib/temperature';

type Props = {
  celsius: number;
  /** "hero" = big current temp, "inline" = "21° / 70°" on one line, "stacked" = °C above °F. */
  variant?: 'hero' | 'inline' | 'stacked';
  style?: StyleProp<TextStyle>;
};

/** Shows a temperature in both Celsius and Fahrenheit. */
export function DualTemp({ celsius, variant = 'inline', style }: Props) {
  const c = usePalette();
  const t = dual(celsius);
  const label = `${t.c} degrees Celsius, ${t.f} degrees Fahrenheit`;

  if (variant === 'hero') {
    return (
      <View style={styles.hero} accessible accessibilityLabel={label}>
        <Text style={styles.heroMain}>
          {t.c}
          <Text style={styles.heroUnit}>°C</Text>
        </Text>
        <View style={[styles.heroDivider, { backgroundColor: c.separator }]} />
        <Text style={[styles.heroMain, { color: c.secondaryText }]}>
          {t.f}
          <Text style={styles.heroUnit}>°F</Text>
        </Text>
      </View>
    );
  }

  if (variant === 'stacked') {
    return (
      <View style={styles.stacked} accessible accessibilityLabel={label}>
        <Text style={[styles.stackedC, style]}>{t.c}°C</Text>
        <Text style={[styles.stackedF, { color: c.secondaryText }]}>{t.f}°F</Text>
      </View>
    );
  }

  return (
    <Text style={style} accessibilityLabel={label}>
      {t.c}°C <Text style={{ color: c.secondaryText }}>/ {t.f}°F</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  heroMain: { fontSize: 76, fontWeight: '200', fontVariant: ['tabular-nums'] },
  heroUnit: { fontSize: 32, fontWeight: '300' },
  heroDivider: { width: StyleSheet.hairlineWidth * 2, height: 64 },
  stacked: { alignItems: 'center' },
  stackedC: { fontSize: 17, fontWeight: '600', fontVariant: ['tabular-nums'] },
  stackedF: { fontSize: 13, marginTop: 2, fontVariant: ['tabular-nums'] },
});
