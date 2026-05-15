import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { DecisionBadge } from './DecisionBadge';
import { WeatherSummary } from './WeatherSummary';
import { AdBanner } from '../ads/AdBanner';
import type { WateringDecision } from '../weather/weatherTypes';
import type { Location } from '../storage/storageService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationResult {
  location: Location;
  status:   'loading' | 'ready' | 'error';
  decision: WateringDecision | null;
  error:    string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LocationCardProps {
  result:       LocationResult;
  showName:     boolean;   // hide when only one location
  showInlineAd: boolean;   // show ad between badge and weather summary
}

export function LocationCard({ result, showName, showInlineAd }: LocationCardProps) {
  const { location, status, decision, error } = result;

  return (
    <View style={styles.wrapper}>
      {showName && (
        <View style={styles.nameRow}>
          <Text style={styles.pin}>📍</Text>
          <Text style={styles.name} numberOfLines={1}>{location.name}</Text>
        </View>
      )}

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching weather…</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            Could not load weather data.{'\n'}{error}
          </Text>
        </View>
      )}

      {status === 'ready' && decision && (
        <>
          <DecisionBadge decision={decision.decision} reason={decision.reason} />

          {/* Inline ad sits between the big decision card and the weather data */}
          <AdBanner visible={showInlineAd} placement="inline" />

          <Text style={styles.sectionLabel}>Weather summary</Text>
          <WeatherSummary
            recentRainMm={decision.recentRainMm}
            expectedRainMm={decision.expectedRainMm}
            todayMaxTempC={decision.todayMaxTempC}
          />
        </>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pin: {
    fontSize: FONT_SIZE.md,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  center: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  errorCard: {
    backgroundColor: COLORS.redLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.red,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
