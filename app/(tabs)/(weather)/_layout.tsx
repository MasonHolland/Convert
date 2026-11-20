import { Stack } from 'expo-router';

import { usePalette } from '@/components/Themed';

export default function WeatherLayout() {
  const c = usePalette();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
      <Stack.Screen name="index" options={{ title: 'Weather' }} />
    </Stack>
  );
}
