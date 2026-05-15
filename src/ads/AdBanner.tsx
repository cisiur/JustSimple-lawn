// ─── AdBanner ─────────────────────────────────────────────────────────────────
//
// In Expo Go: renders a clearly labelled placeholder (no real SDK loaded).
// In a development/production build: swap the placeholder View for the real
// react-native-google-mobile-ads BannerAd component.
//
// TODO: ADMOB — replace MockBanner with real BannerAd when building outside Expo Go:
//   import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
//   import Constants from 'expo-constants';
//   const adUnitId = Platform.OS === 'android'
//     ? Constants.expoConfig?.extra?.admobBannerAndroid
//     : Constants.expoConfig?.extra?.admobBannerIos;

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';

interface AdBannerProps {
  visible: boolean; // false for premium users
}

export function AdBanner({ visible }: AdBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* TODO: ADMOB — replace this View with <BannerAd /> */}
      <Text style={styles.label}>Ad placeholder — free plan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.adBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
});
