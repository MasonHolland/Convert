import { createElement, useState, type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { usePalette } from '@/components/Themed';

const REPO = 'https://github.com/MasonHolland/Convert#run-it-on-your-phone';
const DISMISSED_KEY = 'convert.webDemo.bannerDismissed';
// Set by scripts/media so README screenshots show the app without the banner or frame.
const CAPTURE_KEY = 'webDemo.capture';

type Mode = 'frame' | 'plain' | 'banner';

function storage(key: string, value?: string) {
  try {
    if (value === undefined) return window.localStorage.getItem(key);
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private mode); the banner just comes back next time.
  }
  return null;
}

function initialMode(): Mode {
  if (storage(CAPTURE_KEY) === '1') return 'plain';
  // Inside the desktop frame: the frame page already explains it's a demo.
  if (window.self !== window.top) return 'plain';
  // A desktop browser gets the app in a phone-sized frame instead of stretched to the window.
  if (window.matchMedia('(min-width: 760px) and (pointer: fine)').matches) return 'frame';
  return storage(DISMISSED_KEY) === '1' ? 'plain' : 'banner';
}

/**
 * Web only. Convert is an iPhone app; the web build is a demo of it.
 * - Desktop: shows the app at phone size in an iframe, with a note beside it.
 * - Phone browser: a small dismissible "web demo" banner above the app.
 */
export function WebDemo({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const c = usePalette();

  if (mode === 'frame') {
    return (
      <View style={[styles.page, { backgroundColor: c.fill }]}>
        <View style={styles.phone}>
          <View style={[styles.screen, { backgroundColor: c.background }]}>
            {createElement('iframe', {
            src: window.location.pathname,
            title: 'Convert web demo',
              style: { width: 393, height: '100%', border: 0, display: 'block' },
            })}
          </View>
        </View>
        <View style={styles.note}>
          <Text style={[styles.title, { color: c.text }]}>Convert</Text>
          <Text style={[styles.body, { color: c.secondaryText }]}>
            Weather in °C and °F, currency and unit conversion. It’s an iPhone app; this is a web demo of it, shown at
            iPhone size.
          </Text>
          <Text style={[styles.body, { color: c.secondaryText }]}>
            On a phone it uses your location, and on iPhone you also get the native tab bar, sheets and haptics.
          </Text>
          <Pressable onPress={() => Linking.openURL(REPO)} accessibilityRole="link">
            <Text style={[styles.link, { color: c.tint }]}>Run it on your iPhone →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {mode === 'banner' && (
        <View style={[styles.banner, { backgroundColor: c.card, borderBottomColor: c.separator }]}>
          <Text style={[styles.bannerText, { color: c.secondaryText }]}>
            Web demo of an iPhone app.{' '}
            <Text style={{ color: c.tint }} onPress={() => Linking.openURL(REPO)} accessibilityRole="link">
              Get it on iPhone
            </Text>
          </Text>
          <Pressable
            onPress={() => {
              storage(DISMISSED_KEY, '1');
              setMode('plain');
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Hide this message">
            <Text style={[styles.close, { color: c.secondaryText }]}>✕</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.fill}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 56, padding: 24 },
  // The bezel sits outside the 393 x 852 screen, so the app gets the full iPhone width.
  phone: {
    padding: 10,
    height: '100%',
    maxHeight: 852 + 20,
    borderRadius: 54,
    backgroundColor: '#1C1C1E',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  screen: { width: 393, flex: 1, borderRadius: 44, overflow: 'hidden' },
  note: { maxWidth: 320, gap: 14 },
  title: { fontSize: 34, fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 24 },
  link: { fontSize: 17, fontWeight: '600' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bannerText: { flex: 1, fontSize: 14 },
  close: { fontSize: 15, paddingHorizontal: 4 },
});
