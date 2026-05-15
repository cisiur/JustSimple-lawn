import { View, Text, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import { COLORS, FONT_SIZE } from '../constants/theme';

// ─── Runtime detection ────────────────────────────────────────────────────────

const isExpoGo = Constants.executionEnvironment === 'storeClient';

let BannerAd: any = null;
let BannerAdSize: any = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const admob = require('react-native-google-mobile-ads');
    BannerAd     = admob.BannerAd;
    BannerAdSize = admob.BannerAdSize;
  } catch {
    // Module missing — stay on placeholder
  }
}

// ─── Ad unit IDs per placement ────────────────────────────────────────────────

const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_BANNER_IOS     = 'ca-app-pub-3940256099942544/2934735716';

const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;

function resolveUnitId(androidKey: string, iosKey: string): string {
  if (__DEV__) return Platform.OS === 'android' ? TEST_BANNER_ANDROID : TEST_BANNER_IOS;
  return Platform.OS === 'android'
    ? (extra?.[androidKey] ?? '')
    : (extra?.[iosKey]    ?? '');
}

const UNIT_IDS = {
  bottom: resolveUnitId('admobBannerBottomAndroid', 'admobBannerBottomIos'),
  inline: resolveUnitId('admobBannerInlineAndroid', 'admobBannerInlineIos'),
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface AdBannerProps {
  visible:   boolean;   // false for premium users
  placement: 'bottom' | 'inline';
}

export function AdBanner({ visible, placement }: AdBannerProps) {
  if (!visible) return null;

  const unitId  = UNIT_IDS[placement];
  const isBottom = placement === 'bottom';
  const containerStyle = isBottom ? styles.bottomContainer : styles.inlineContainer;

  if (!isExpoGo && BannerAd && BannerAdSize && unitId) {
    // ANCHORED_ADAPTIVE_BANNER fills whatever width the parent gives it.
    // Fall back to BANNER if the constant is somehow unavailable.
    const adSize = BannerAdSize.ANCHORED_ADAPTIVE_BANNER ?? BannerAdSize.BANNER;
    return (
      <View style={containerStyle}>
        <BannerAd
          unitId={unitId}
          size={adSize}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    );
  }

  // Expo Go / missing SDK — placeholder
  return (
    <View style={containerStyle}>
      <Text style={styles.label}>Ad • Free plan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Bottom sticky bar — sits outside the ScrollView, spans full screen width
  bottomContainer: {
    width: '100%',
    minHeight: 50,
    backgroundColor: COLORS.adBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    overflow: 'hidden',
  },
  // Inline card — inherits the scroll container's horizontal padding
  inlineContainer: {
    width: '100%',
    minHeight: 50,
    backgroundColor: COLORS.adBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
  },
});
