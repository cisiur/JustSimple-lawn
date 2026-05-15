import type { ExpoConfig } from 'expo/config';

// Expo CLI automatically reads .env from the project root.
// All process.env variables below must be declared in .env (see .env.example).

const config: ExpoConfig = {
  name: 'JustSimple Lawn',
  slug: 'justsimple-lawn',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.justsimple.lawn',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#4CAF50',
    },
    package: 'com.justsimple.lawn',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-location',
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#4CAF50',
      },
    ],
  ],
  extra: {
    // TODO: ADMOB — insert real ad unit IDs before production build
    admobAppIdAndroid: process.env.ADMOB_APP_ID_ANDROID ?? '',
    admobBannerAndroid: process.env.ADMOB_BANNER_AD_UNIT_ANDROID ?? '',
    admobAppIdIos: process.env.ADMOB_APP_ID_IOS ?? '',
    admobBannerIos: process.env.ADMOB_BANNER_AD_UNIT_IOS ?? '',
    // TODO: REVENUECAT — insert real public SDK keys before production build
    revenueCatKeyAndroid: process.env.REVENUECAT_API_KEY_ANDROID ?? '',
    revenueCatKeyIos: process.env.REVENUECAT_API_KEY_IOS ?? '',
  },
};

export default config;
