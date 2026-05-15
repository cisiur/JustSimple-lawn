import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { DecisionBadge } from '../components/DecisionBadge';
import { WeatherSummary } from '../components/WeatherSummary';
import { PremiumBadge } from '../components/PremiumBadge';
import { AdBanner } from '../ads/AdBanner';
import { getPremiumStatus } from '../premium/premiumService';
import { evaluateWatering } from '../rules/wateringRules';
import { fetchForecastWithCache } from '../weather/weatherService';
import { loadSettings } from '../storage/storageService';
import type { WateringDecision } from '../weather/weatherTypes';
import type { RootTabParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

type NavProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

// ─── State shape ──────────────────────────────────────────────────────────────

type Status = 'loading' | 'no-location' | 'ready' | 'error';

interface ScreenState {
  status: Status;
  decision: WateringDecision | null;
  locationName: string;
  isPremium: boolean;
  error: string | null;
}

const INITIAL_STATE: ScreenState = {
  status: 'loading',
  decision: null,
  locationName: '',
  isPremium: false,
  error: null,
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [state, setState] = useState<ScreenState>(INITIAL_STATE);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setState(prev => ({ ...prev, status: 'loading', error: null }));

    try {
      const [settings, { isPremium }] = await Promise.all([
        loadSettings(),
        getPremiumStatus(),
      ]);

      if (!settings.latitude || !settings.longitude) {
        setState({
          status: 'no-location',
          decision: null,
          locationName: '',
          isPremium,
          error: null,
        });
        return;
      }

      const weather = await fetchForecastWithCache(
        settings.latitude,
        settings.longitude,
      );
      const decision = evaluateWatering(weather);

      setState({
        status: 'ready',
        decision,
        locationName: settings.locationName,
        isPremium,
        error: null,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Something went wrong.';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: `Could not load weather data.\n${message}`,
      }));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Reload every time this tab becomes active (e.g. after saving location)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const { status, decision, locationName, isPremium, error } = state;

  function renderContent() {
    switch (status) {
      case 'loading':
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching weather…</Text>
          </View>
        );

      case 'no-location':
        return (
          <View style={styles.center}>
            <Text style={styles.noLocEmoji}>📍</Text>
            <Text style={styles.noLocTitle}>No location set</Text>
            <Text style={styles.noLocBody}>
              Set your city in Settings to get today's watering recommendation.
            </Text>
            <TouchableOpacity
              style={styles.goToSettingsBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.goToSettingsBtnText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        );

      case 'error':
        return (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        );

      case 'ready':
        if (!decision) return null;
        return (
          <>
            <DecisionBadge decision={decision.decision} reason={decision.reason} />
            <AdBanner visible={!isPremium} placement="inline" />
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
        );
    }
  }

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
        {/* Header */}
        {(status === 'ready' || status === 'error') && (
          <View style={styles.header}>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location} numberOfLines={1}>
                {locationName || 'Unknown location'}
              </Text>
            </View>
            <PremiumBadge isPremium={isPremium} />
          </View>
        )}

        {renderContent()}
      </ScrollView>

      <AdBanner visible={!isPremium} placement="bottom" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  noLocEmoji: {
    fontSize: FONT_SIZE.hero,
  },
  noLocTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  noLocBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
  goToSettingsBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  goToSettingsBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
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
    lineHeight: 22,
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
