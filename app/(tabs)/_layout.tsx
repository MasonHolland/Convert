import { NativeTabs } from 'expo-router/native-tabs';

import { usePalette } from '@/components/Themed';

/** Native iOS tab bar (UITabBarController) / Material bottom navigation on Android. */
export default function TabLayout() {
  const c = usePalette();

  return (
    <NativeTabs tintColor={c.tint}>
      <NativeTabs.Trigger name="(weather)">
        <NativeTabs.Trigger.Icon sf={{ default: 'thermometer.medium', selected: 'thermometer.sun.fill' }} md="thermostat" />
        <NativeTabs.Trigger.Label>Weather</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="currency">
        <NativeTabs.Trigger.Icon sf={{ default: 'dollarsign.circle', selected: 'dollarsign.circle.fill' }} md="currency_exchange" />
        <NativeTabs.Trigger.Label>Currency</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="measure">
        <NativeTabs.Trigger.Icon sf={{ default: 'ruler', selected: 'ruler.fill' }} md="straighten" />
        <NativeTabs.Trigger.Label>Measure</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
