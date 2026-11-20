import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { usePalette } from '@/components/Themed';
import { Icon } from './Icon';

type Props = {
  title: string;
  /** Route for the gear button in the header (defaults screen). */
  settingsHref?: '/settings/currency' | '/settings/measure';
};

/** Per-tab native stack with an iOS large title and optional settings gear. */
export function TabStack({ title, settingsHref }: Props) {
  const c = usePalette();
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: c.background },
        contentStyle: { backgroundColor: c.background },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title,
          headerRight: settingsHref
            ? () => (
                <Pressable
                  onPress={() => router.push(settingsHref)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Defaults">
                  <Icon ios="gearshape" android="settings" size={22} color={c.tint} />
                </Pressable>
              )
            : undefined,
        }}
      />
    </Stack>
  );
}
