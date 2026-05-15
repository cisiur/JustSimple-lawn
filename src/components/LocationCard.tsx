import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { DecisionBadge } from './DecisionBadge';
import { WeatherSummary } from './WeatherSummary';
import { AdBanner } from '../ads/AdBanner';
import { useI18n } from '../i18n/I18nContext';
import type { WateringDecision, ReasonKey } from '../weather/weatherTypes';
import type { Location } from '../storage/storageService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationResult {
  location: Location;
  status:   'loading' | 'ready' | 'error';
  decision: WateringDecision | null;
  error:    string | null;
}

// ─── Reason formatting ────────────────────────────────────────────────────────

function fmtMm(mm: number): string {
  return mm % 1 === 0 ? `${mm}` : mm.toFixed(1);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LocationCardProps {
  result:       LocationResult;
  showName:     boolean;   // hide when only one location
  showInlineAd: boolean;   // show ad between badge and weather summary
}

export function LocationCard({ result, showName, showInlineAd }: LocationCardProps) {
  const { location, status, decision, error } = result;
  const { t } = useI18n();

  // Translate the reason key with the appropriate numeric param
  function translateReason(key: ReasonKey, d: WateringDecision): string {
    switch (key) {
      case 'reason.recentRain':
        return t(key, { mm: fmtMm(d.recentRainMm) });
      case 'reason.forecastRain':
        return t(key, { mm: fmtMm(d.expectedRainMm) });
      case 'reason.hotAndDry':
        return t(key, { temp: Math.round(d.todayMaxTempC) });
      default:
        return t(key);
    }
  }

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
          <Text style={styles.loadingText}>{t('home.weather.loading')}</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            {t('home.weather.error')}{'\n'}{error}
          </Text>
        </View>
      )}

      {status === 'ready' && decision && (
        <>
          <DecisionBadge
            decision={decision.decision}
            reason={translateReason(decision.reason, decision)}
          />

          {/* Inline ad sits between the big decision card and the weather data */}
          <AdBanner visible={showInlineAd} placement="inline" />

          <Text style={styles.sectionLabel}>{t('home.weatherSummary')}</Text>
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
