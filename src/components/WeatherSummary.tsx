import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

interface WeatherSummaryProps {
  recentRainMm: number;
  expectedRainMm: number;
  todayMaxTempC: number;
}

interface StatProps {
  icon: string;
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

export function WeatherSummary({ recentRainMm, expectedRainMm, todayMaxTempC }: WeatherSummaryProps) {
  return (
    <View style={styles.container}>
      <Stat
        icon="🌧"
        value={`${recentRainMm % 1 === 0 ? recentRainMm : recentRainMm.toFixed(1)} mm`}
        label="Rain last 24h"
      />
      <View style={styles.divider} />
      <Stat
        icon="⛅"
        value={`${expectedRainMm % 1 === 0 ? expectedRainMm : expectedRainMm.toFixed(1)} mm`}
        label="Rain next 24h"
      />
      <View style={styles.divider} />
      <Stat
        icon="🌡"
        value={`${Math.round(todayMaxTempC)}°C`}
        label="Today's high"
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
