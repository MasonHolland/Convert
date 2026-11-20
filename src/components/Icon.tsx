import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

type Props = {
  ios: Extract<SymbolViewProps['name'], { ios?: unknown }>['ios'];
  android: Extract<SymbolViewProps['name'], { android?: unknown }>['android'];
  size?: number;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
};

/** SF Symbol on iOS, Material Symbol on Android/web. */
export function Icon({ ios, android, size = 22, color, style }: Props) {
  return <SymbolView name={{ ios, android, web: android }} size={size} tintColor={color} style={style} />;
}
