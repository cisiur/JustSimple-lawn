import type { ExpoConfig } from 'expo/config';

// Expo CLI automatically reads .env from the project root.
// All process.env variables below must be declared in .env (see .env.example).

// Google's official test IDs — safe to use in dev builds before real IDs arrive.
const TEST_ADMOB_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_ADMOB_APP_ID_IOS     = 'ca-app-pub-3940256099942544~1458002511';

if (!process.env.ADMOB_APP_ID_ANDROID) {
  console.warn('[app.config] ADMOB_APP_ID_ANDROID is not set — using test ID');
}

const admobAppIdAndroid = process.env.ADMOB_APP_ID_ANDROID || TEST_ADMOB_APP_ID_ANDROID;
const admobAppIdIos     = process.env.ADMOB_APP_ID_IOS     || TEST_ADMOB_APP_ID_IOS;

const config: ExpoConfig = {
  name: 'JustSimple Lawn',
  slug: 'justsimple-lawn',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: false, // TODO: re-enable when react-native-google-mobile-ads
                         // and react-native-purchases fully support new arch
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
    // IMPORTANT: increment versionCode before every Play Store release
    versionCode: 1,
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
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: admobAppIdAndroid,
        iosAppId:     admobAppIdIos,
      },
    ],
  ],
  extra: {
    eas: {
      projectId: 'ede092fd-706d-4209-b50e-75caf0ac624c',
    },
    admobAppIdAndroid,
    admobAppIdIos,
    admobBannerBottomAndroid: process.env.ADMOB_BANNER_BOTTOM_ANDROID ?? '',
    admobBannerBottomIos:     process.env.ADMOB_BANNER_BOTTOM_IOS     ?? '',
    admobBannerInlineAndroid: process.env.ADMOB_BANNER_INLINE_ANDROID ?? '',
    admobBannerInlineIos:     process.env.ADMOB_BANNER_INLINE_IOS     ?? '',
    revenueCatKeyAndroid: process.env.REVENUECAT_API_KEY_ANDROID ?? '',
    revenueCatKeyIos:     process.env.REVENUECAT_API_KEY_IOS     ?? '',
  },
};

export default config;
