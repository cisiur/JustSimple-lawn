// ─── AdBanner ─────────────────────────────────────────────────────────────────
//
// Expo Go / dev:  renders a clearly labelled placeholder — no native SDK loaded.
// Production build steps (requires dev build, NOT Expo Go):
//   1. npm install react-native-google-mobile-ads
//   2. Add to app.config.ts plugins:
//        ['react-native-google-mobile-ads', {
//           androidAppId: process.env.ADMOB_APP_ID_ANDROID,
//           iosAppId:     process.env.ADMOB_APP_ID_IOS,
//        }]
//   3. Replace MockBanner below with:
//        import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
//        import Constants from 'expo-constants';
//        import { Platform } from 'react-native';
//        const unitId = __DEV__
//          ? TestIds.BANNER
//          : Platform.OS === 'android'
//            ? Constants.expoConfig?.extra?.admobBannerAndroid
//            : Constants.expoConfig?.extra?.admobBannerIos;
//        <BannerAd unitId={unitId} size={BannerAdSize.BANNER} />
//
// TODO: ADMOB — swap MockBanner for real BannerAd once dev build is set up.

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE } from '../constants/theme';

interface AdBannerProps {
  /** Pass false for premium users — renders nothing */
  visible: boolean;
}

export function AdBanner({ visible }: AdBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* TODO: ADMOB — replace this View with <BannerAd /> */}
      <Text style={styles.label}>Ad • Free plan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.adBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
  },
});
