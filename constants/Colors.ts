/** iOS system-style palette (grouped backgrounds, label colors, system blue). */
const Colors = {
  light: {
    text: '#000000',
    secondaryText: '#6C6C70',
    tertiaryText: '#A1A1A6',
    background: '#F2F2F7',
    card: '#FFFFFF',
    cardPressed: '#E5E5EA',
    separator: '#C6C6C8',
    tint: '#007AFF',
    tintText: '#FFFFFF',
    fill: '#E9E9EB',
    danger: '#FF3B30',
    warm: '#FF9500',
    cool: '#5AC8FA',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#007AFF',
  },
  dark: {
    text: '#FFFFFF',
    secondaryText: '#AEAEB2',
    tertiaryText: '#636366',
    background: '#000000',
    card: '#1C1C1E',
    cardPressed: '#2C2C2E',
    separator: '#38383A',
    tint: '#0A84FF',
    tintText: '#FFFFFF',
    fill: '#2C2C2E',
    danger: '#FF453A',
    warm: '#FF9F0A',
    cool: '#64D2FF',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#0A84FF',
  },
};

export type Palette = typeof Colors.light;
export default Colors;
