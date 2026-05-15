import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DecisionBadge } from '../components/DecisionBadge';
import { WeatherSummary } from '../components/WeatherSummary';
import { PremiumBadge } from '../components/PremiumBadge';
import { AdBanner } from '../ads/AdBanner';
import { getPremiumStatus } from '../premium/premiumService';
import { evaluateWatering } from '../rules/wateringRules';
import { WateringDecision } from '../weather/weatherTypes';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

// ─── Mocked data ──────────────────────────────────────────────────────────────
// Replaced with real Open-Meteo data in Batch 3e.

const MOCK_WEATHER = {
  hourly: {
    // 72 hours: 24h past + 48h future (Open-Meteo format with past_days=1)
    time: Array.from({ length: 72 }, (_, i) => {
      const d = new Date();
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() - 24 + i);
      return d.toISOString().slice(0, 16);
    }),
    precipitation: Array.from({ length: 72 }, (_, i) => {
      // Simulate 2mm of rain 20 hours ago, dry otherwise
      return i === 4 ? 2 : 0;
    }),
    temperature2m: Array.from({ length: 72 }, (_, i) => 18 + Math.sin(i / 6) * 5),
  },
  daily: {
    time: ['yesterday', 'today', 'tomorrow'].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 1 + i);
      return d.toISOString().slice(0, 10);
    }),
    precipitationSum: [2, 0, 0],
    temperature2mMax: [20, 24, 26],
  },
  timezone: 'auto',
};

const MOCK_LOCATION = 'Warsaw, Poland';

// ─── Screen ───────────────────────────────────────────────────────────────────

interface ScreenState {
  loading: boolean;
  refreshing: boolean;
  isPremium: boolean;
  decision: WateringDecision | null;
  error: string | null;
}

export default function HomeScreen() {
  const [state, setState] = useState<ScreenState>({
    loading: true,
    refreshing: false,
    isPremium: false,
    decision: null,
    error: null,
  });

  const load = useCallback(async (isRefresh = false) => {
    setState(prev => ({
      ...prev,
      loading: !isRefresh,
      refreshing: isRefresh,
      error: null,
    }));

    try {
      // TODO: replace MOCK_WEATHER with real weatherService.fetchWeather() in Batch 3e
      const decision = evaluateWatering(MOCK_WEATHER);
      const { isPremium } = await getPremiumStatus();

      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        isPremium,
        decision,
      }));
    } catch (e) {
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: 'Could not load weather data. Pull down to retry.',
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { loading, refreshing, isPremium, decision, error } = state;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location} numberOfLines={1}>
              {/* TODO: replace with real location from storageService in Batch 3e */}
              {MOCK_LOCATION}
            </Text>
          </View>
          <PremiumBadge isPremium={isPremium} />
        </View>

        {/* Main content */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Checking the weather…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : decision ? (
          <>
            <DecisionBadge decision={decision.decision} reason={decision.reason} />

            <Text style={styles.sectionLabel}>Weather summary</Text>
            <WeatherSummary
              recentRainMm={decision.recentRainMm}
              expectedRainMm={decision.expectedRainMm}
              todayMaxTempC={decision.todayMaxTempC}
            />

            <Text style={styles.updateNote}>
              Pull down to refresh · data updates every 30 min
            </Text>
          </>
        ) : null}
      </ScrollView>

      {/* Banner ad — hidden for premium users */}
      <AdBanner visible={!isPremium} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  locationIcon: {
    fontSize: FONT_SIZE.md,
  },
  location: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  errorCard: {
    backgroundColor: COLORS.redLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.red,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.xs,
  },
  updateNote: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
