import { Tabs } from 'expo-router';

import { usePalette } from '@/components/Themed';
import { Icon } from '@/src/components/Icon';

/**
 * Web only. Native tabs render as a floating bar at the top on web, so the web demo uses
 * a regular bottom tab bar to look like the iPhone app. iOS and Android use _layout.tsx.
 */
export default function TabLayout() {
  const c = usePalette();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c.tabIconDefault,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.separator, height: 64, paddingTop: 0, paddingBottom: 6 },
        // 28 px icon + 14 px label + the item's own padding.
        tabBarItemStyle: { height: 56 },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14 },
        sceneStyle: { backgroundColor: c.background },
      }}>
      <Tabs.Screen
        name="(weather)"
        options={{
          title: 'Weather',
          tabBarIcon: ({ color }) => <Icon ios="thermometer.medium" android="thermostat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="currency"
        options={{
          title: 'Currency',
          tabBarIcon: ({ color }) => <Icon ios="dollarsign.circle" android="currency_exchange" color={color} />,
        }}
      />
      <Tabs.Screen
        name="measure"
        options={{
          title: 'Measure',
          tabBarIcon: ({ color }) => <Icon ios="ruler" android="straighten" color={color} />,
        }}
      />
    </Tabs>
  );
}
