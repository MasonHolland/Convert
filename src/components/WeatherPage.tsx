import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Text, usePalette } from '@/components/Themed';
import type { Forecast, Place } from '../api/weather';
import { useForecast } from '../hooks/useForecast';
import { dual } from '../lib/temperature';
import { formatHour, formatUpdated, formatWeekday } from '../lib/time';
import { DualTemp } from './DualTemp';
import { Icon } from './Icon';

type Props = {
  place: Place;
  isCurrentLocation: boolean;
  width: number;
  topInset: number;
  bottomInset: number;
  onLongPressTitle?: () => void;
};

export function WeatherPage({ place, isCurrentLocation, width, topInset, bottomInset, onLongPressTitle }: Props) {
  const c = usePalette();
  const { forecast, loading, error, refresh } = useForecast(place);

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 8, paddingBottom: bottomInset + 24 }]}
      refreshControl={<RefreshControl refreshing={loading && !!forecast} onRefresh={refresh} />}>
      <Pressable onLongPress={onLongPressTitle} delayLongPress={400} style={styles.titleWrap}>
        {isCurrentLocation && (
          <View style={styles.myLocation}>
            <Icon ios="location.fill" android="near_me" size={12} color={c.secondaryText} />
            <Text style={[styles.myLocationText, { color: c.secondaryText }]}>My Location</Text>
          </View>
        )}
        <Text style={styles.place} numberOfLines={1}>
          {place.name}
        </Text>
        {place.subtitle ? (
          <Text style={[styles.subtitle, { color: c.secondaryText }]} numberOfLines={1}>
            {place.subtitle}
          </Text>
        ) : null}
      </Pressable>

      {forecast ? (
        <ForecastBody forecast={forecast} stale={!!error} />
      ) : error ? (
        <View style={styles.center}>
          <Icon ios="wifi.slash" android="wifi_off" size={28} color={c.secondaryText} />
          <Text style={[styles.message, { color: c.secondaryText }]}>Couldn’t load weather.</Text>
          <Pressable onPress={refresh} hitSlop={10}>
            <Text style={[styles.retry, { color: c.tint }]}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      )}
    </ScrollView>
  );
}

function ForecastBody({ forecast, stale }: { forecast: Forecast; stale: boolean }) {
  const c = usePalette();
  const weekMin = Math.min(...forecast.daily.map((d) => d.low));
  const weekMax = Math.max(...forecast.daily.map((d) => d.high));
  const span = Math.max(weekMax - weekMin, 1);
  const hi = dual(forecast.today.high);
  const lo = dual(forecast.today.low);

  return (
    <>
      <View style={styles.hero}>
        <DualTemp celsius={forecast.current.temp} variant="hero" />
        <Text style={[styles.heroLine, { color: c.secondaryText }]}>
          Feels like <DualTemp celsius={forecast.current.feelsLike} />
        </Text>
        <Text style={styles.heroHiLo}>
          H: {hi.c}°C / {hi.f}°F{'   '}L: {lo.c}°C / {lo.f}°F
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: c.card }]}>
        <CardTitle ios="clock" android="schedule" title="Next 24 hours" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourly}>
          {forecast.hourly.map((h, i) => (
            <View key={h.time} style={styles.hour}>
              <Text style={[styles.hourLabel, { color: c.secondaryText }]}>{i === 0 ? 'Now' : formatHour(h.time)}</Text>
              <DualTemp celsius={h.temp} variant="stacked" />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.card, { backgroundColor: c.card }]}>
        <CardTitle ios="calendar" android="calendar_month" title="7-day forecast" />
        {forecast.daily.map((d, i) => {
          const left = ((d.low - weekMin) / span) * 100;
          const width = Math.max(((d.high - d.low) / span) * 100, 4);
          return (
            <View key={d.date} style={[styles.dayRow, i > 0 && { borderTopColor: c.separator, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <Text style={styles.dayName}>{i === 0 ? 'Today' : formatWeekday(d.date)}</Text>
              <View style={styles.dayTemp}>
                <DualTemp celsius={d.low} variant="stacked" style={{ color: c.secondaryText }} />
              </View>
              <View style={[styles.track, { backgroundColor: c.fill }]}>
                <View
                  style={[
                    styles.range,
                    { left: `${left}%`, width: `${width}%`, backgroundColor: d.high >= 20 ? c.warm : c.cool },
                  ]}
                />
              </View>
              <View style={styles.dayTemp}>
                <DualTemp celsius={d.high} variant="stacked" />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={[styles.updated, { color: c.tertiaryText }]}>
        {stale ? 'Offline — ' : ''}Updated {formatUpdated(forecast.fetchedAt)} · Open-Meteo
      </Text>
    </>
  );
}

function CardTitle({ ios, android, title }: { ios: 'clock' | 'calendar'; android: 'schedule' | 'calendar_month'; title: string }) {
  const c = usePalette();
  return (
    <View style={[styles.cardTitle, { borderBottomColor: c.separator }]}>
      <Icon ios={ios} android={android} size={13} color={c.secondaryText} />
      <Text style={[styles.cardTitleText, { color: c.secondaryText }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  titleWrap: { alignItems: 'center', paddingTop: 16 },
  myLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  myLocationText: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  place: { fontSize: 32, fontWeight: '500' },
  subtitle: { fontSize: 15, marginTop: 2 },
  hero: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  heroLine: { fontSize: 17 },
  heroHiLo: { fontSize: 17, fontWeight: '500' },
  card: { borderRadius: 16, paddingHorizontal: 14, paddingBottom: 8, marginBottom: 14 },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardTitleText: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  hourly: { gap: 18, paddingVertical: 12, paddingRight: 8 },
  hour: { alignItems: 'center', gap: 8, minWidth: 44 },
  hourLabel: { fontSize: 14, fontWeight: '500' },
  dayRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  dayName: { width: 52, fontSize: 17, fontWeight: '500' },
  dayTemp: { width: 52 },
  track: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  range: { position: 'absolute', top: 0, bottom: 0, borderRadius: 3 },
  updated: { textAlign: 'center', fontSize: 12, marginTop: 4 },
  center: { alignItems: 'center', paddingVertical: 80, gap: 10 },
  message: { fontSize: 16 },
  retry: { fontSize: 17, fontWeight: '600' },
});
