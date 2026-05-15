import { View, Text, StyleSheet } from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

interface WeatherSummaryProps {
  recentRainMm:  number;
  expectedRainMm: number;
  todayMaxTempC: number;
}

interface StatProps {
  icon:  string;
  value: string;
  label: string;
}

function Stat({ icon, value, label }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function fmtMm(mm: number): string {
  return `${mm % 1 === 0 ? mm : mm.toFixed(1)} mm`;
}

export function WeatherSummary({ recentRainMm, expectedRainMm, todayMaxTempC }: WeatherSummaryProps) {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <Stat
        icon="🌧"
        value={fmtMm(recentRainMm)}
        label={t('weather.recentRain')}
      />
      <View style={styles.divider} />
      <Stat
        icon="⛅"
        value={fmtMm(expectedRainMm)}
        label={t('weather.forecastRain')}
      />
      <View style={styles.divider} />
      <Stat
        icon="🌡"
        value={`${Math.round(todayMaxTempC)}°C`}
        label={t('weather.todayHigh')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    fontSize: FONT_SIZE.lg,
  },
  statValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
});
