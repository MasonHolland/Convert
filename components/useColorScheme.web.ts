import { useColorScheme as useColorSchemeCore } from 'react-native';

// The web build is a single-page app (no server rendering), so it can follow the
// browser's prefers-color-scheme the same way the native app follows iOS.
export const useColorScheme = () => {
  const coreScheme = useColorSchemeCore();
  return coreScheme === 'dark' ? 'dark' : 'light';
};
