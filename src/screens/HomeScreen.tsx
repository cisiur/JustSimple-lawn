import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LocationCard } from '../components/LocationCard';
import type { LocationResult } from '../components/LocationCard';
import { PremiumBadge } from '../components/PremiumBadge';
import { AdBanner } from '../ads/AdBanner';
import { getPremiumStatus } from '../premium/premiumService';
import { evaluateWatering } from '../rules/wateringRules';
import { fetchForecastWithCache } from '../weather/weatherService';
import { loadSettings } from '../storage/storageService';
import type { RootTabParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

type NavProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

// ─── State ────────────────────────────────────────────────────────────────────

type GlobalStatus = 'loading' | 'no-location' | 'ready';

interface ScreenState {
  globalStatus: GlobalStatus;
  results:      LocationResult[];
  isPremium:    boolean;
}

const INITIAL: ScreenState = {
  globalStatus: 'loading',
  results:      [],
  isPremium:    false,
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [state, setState] = useState<ScreenState>(INITIAL);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setState(prev => ({ ...prev, globalStatus: 'loading' }));

    const [settings, { isPremium }] = await Promise.all([
      loadSettings(),
      getPremiumStatus(),
    ]);

    if (!settings.locations.length) {
      setState({ globalStatus: 'no-location', results: [], isPremium });
      setRefreshing(false);
      return;
    }

    // Show loading skeletons immediately
    setState({
      globalStatus: 'ready',
      results: settings.locations.map(loc => ({
        location: loc,
        status:   'loading',
        decision: null,
        error:    null,
      })),
      isPremium,
    });

    // Fetch all locations in parallel
    const settled = await Promise.allSettled(
      settings.locations.map(loc =>
        fetchForecastWithCache(loc.latitude, loc.longitude),
      ),
    );

    const results: LocationResult[] = settings.locations.map((loc, i) => {
      const r = settled[i];
      if (r.status === 'fulfilled') {
        return {
          location: loc,
          status:   'ready',
          decision: evaluateWatering(r.value),
          error:    null,
        };
      }
      return {
        location: loc,
        status:   'error',
        decision: null,
        error:    r.reason instanceof Error ? r.reason.message : 'Something went wrong.',
      };
    });

    setState({ globalStatus: 'ready', results, isPremium });
    setRefreshing(false);
  }, []);

  // Reload whenever this tab becomes active
  useFocusEffect(
    useCallback(() => { load(); }, [load]),
  );

  const { globalStatus, results, isPremium } = state;

  // ── Render ──────────────────────────────────────────────────────────────────

  if (globalStatus === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (globalStatus === 'no-location') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
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
      </SafeAreaView>
    );
  }

  const multiLoc = results.length > 1;

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
        {/* Header — only when single location (name comes from card when multi) */}
        {!multiLoc && (
          <View style={styles.header}>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location} numberOfLines={1}>
                {results[0]?.location.name || 'Unknown location'}
              </Text>
            </View>
            <PremiumBadge isPremium={isPremium} />
          </View>
        )}

        {multiLoc && (
          <View style={styles.headerMulti}>
            <Text style={styles.headerMultiTitle}>Today</Text>
            <PremiumBadge isPremium={isPremium} />
          </View>
        )}

        {/* Location cards — one per saved location */}
        {results.map((result, index) => (
          <View key={result.location.id}>
            <LocationCard result={result} showName={multiLoc} />

            {/* Inline ad after the first card only (free users) */}
            {index === 0 && (
              <AdBanner visible={!isPremium} placement="inline" />
            )}

            {/* Divider between cards */}
            {index < results.length - 1 && <View style={styles.divider} />}
          </View>
        ))}

        <Text style={styles.updateNote}>
          Pull down to refresh · data updates every 30 min
        </Text>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.xl,
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
    textAlign: 'center',
  },
  noLocBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  headerMulti: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerMultiTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  updateNote: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
