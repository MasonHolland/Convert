import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useSyncExternalStore } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { WebDemo } from '@/src/components/WebDemo';
import { hasHydrated, onHydrated } from '@/src/store/useAppStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Keep the splash screen up until saved defaults/cities are loaded,
  // so each tab opens on the user's defaults rather than flashing the built-ins.
  const ready = useSyncExternalStore(onHydrated, hasHydrated, hasHydrated);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: palette.tint, background: palette.background, card: palette.card },
  };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="auto" />
      <WebDemo>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="city-search" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="settings/currency" options={{ presentation: 'modal', title: 'Currency Defaults' }} />
          <Stack.Screen name="settings/measure" options={{ presentation: 'modal', title: 'Measurement Defaults' }} />
        </Stack>
      </WebDemo>
    </ThemeProvider>
  );
}
