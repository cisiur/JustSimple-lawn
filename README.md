# 🌿 JustSimple Lawn

A clean, no-nonsense Android app that answers one question every morning: **should I water my lawn today?**

It pulls real-time weather data, checks recent rainfall and the upcoming forecast, and gives you a clear recommendation — no guesswork, no complex settings.

---

## Features

| | Free | Premium |
|---|---|---|
| Watering recommendation | ✅ | ✅ |
| Weather summary (rain, temperature) | ✅ | ✅ |
| Locations | 1 | up to 4 |
| Banner ads | shown | removed |
| Daily reminder notification | ❌ | ✅ |
| Multilanguage | ✅ | ✅ |

**Supported languages:** English, Polish, German, Spanish, French, Italian — auto-detected from the device, with manual override in Settings.

---

## How the recommendation works

The rules engine evaluates three conditions in order:

1. **Recent rain** — if ≥ 5 mm fell in the last 24 h → **Skip**
2. **Forecast rain** — if ≥ 3 mm is expected in the next 24 h → **Skip**
3. **Hot & dry** — if today's high is ≥ 28 °C and no rain → **Water**
4. **Default dry** — no meaningful rain at all → **Water**

All thresholds are centralised in `src/weather/weatherConfig.ts` and are easy to adjust.

Weather data is fetched from [Open-Meteo](https://open-meteo.com/) — free, open-source, no API key required. Results are cached for 30 minutes per location.

---

## Tech stack

| Layer | Library / Service |
|---|---|
| Framework | [Expo](https://expo.dev/) SDK 54 + React Native 0.81.5 |
| Language | TypeScript |
| Navigation | React Navigation (bottom tabs) |
| Storage | AsyncStorage |
| Weather API | [Open-Meteo](https://open-meteo.com/) (free, no key) |
| Ads | Google AdMob via `react-native-google-mobile-ads` |
| Purchases | RevenueCat via `react-native-purchases` |
| Notifications | `expo-notifications` |
| Location | `expo-location` |
| Builds | EAS Build |

---

## Project structure

```
src/
├── ads/                  # AdBanner component (inline + bottom sticky)
├── components/           # DecisionBadge, WeatherSummary, LocationCard, …
├── constants/            # theme.ts (colours, spacing, font sizes)
├── i18n/                 # translations.ts, i18n.ts (core), I18nContext.tsx
├── navigation/           # AppNavigator (bottom tab navigator)
├── notifications/        # notificationService.ts
├── premium/              # premiumService.ts, UpgradeModal.tsx
├── rules/                # wateringRules.ts (decision engine)
├── screens/              # HomeScreen.tsx, SettingsScreen.tsx
├── services/             # locationService.ts (GPS + reverse geocoding)
├── storage/              # storageService.ts (settings, locations, cache)
└── weather/              # weatherService.ts, weatherConfig.ts, weatherTypes.ts
```

---

## Getting started

### Prerequisites

- Node.js 18+
- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli`
- Android Studio / Xcode for local builds (optional — EAS cloud builds work without them)

### Install

```bash
git clone https://github.com/your-username/JustSimple_Lawn.git
cd JustSimple_Lawn
npm install          # also runs patch-package via postinstall
```

### Run (development build)

This app uses `expo-dev-client` and native modules (AdMob, RevenueCat), so it **cannot run in Expo Go**. You need a development build.

```bash
# Build dev client once (first time or after native dependency changes)
eas build --profile development --platform android

# Then start the JS bundler
npx expo start --clear
```

Scan the QR code with the installed dev build.

---

## Environment setup

Before running `eas build`, copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
# then edit .env with your real keys
```

`.env` is git-ignored and must never be committed. For EAS cloud builds, set secrets via:

```bash
eas secret:create --scope project --name ADMOB_APP_ID_ANDROID --value "ca-app-pub-..."
```

See `.env.example` for all required variables. Missing `ADMOB_APP_ID_ANDROID` causes a warning during config evaluation and falls back to Google's test ID (safe for dev, not for production).

---

## Configuration

### AdMob

Set `ADMOB_APP_ID_ANDROID` (and `ADMOB_APP_ID_IOS`) in `.env` or as EAS secrets. Then add your real Ad Unit IDs for banners:

```bash
# .env
ADMOB_APP_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
ADMOB_BANNER_BOTTOM_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_BANNER_INLINE_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

In `__DEV__` mode the app uses Google's public test IDs automatically.

### RevenueCat

Store your API keys as **EAS Secrets** (never commit them):

```bash
eas secret:create --scope project --name REVENUECAT_API_KEY_ANDROID --value "appl_..."
eas secret:create --scope project --name REVENUECAT_API_KEY_IOS     --value "appl_..."
```

Then reference them in `app.config.ts`:

```ts
extra: {
  revenueCatApiKeyAndroid: process.env.REVENUECAT_API_KEY_ANDROID,
  revenueCatApiKeyIos:     process.env.REVENUECAT_API_KEY_IOS,
}
```

Configure your products, entitlements, and offerings in the [RevenueCat dashboard](https://app.revenuecat.com/).

---

## Architecture notes

### Old architecture

`newArchEnabled: false` is set intentionally — both `react-native-google-mobile-ads` and `react-native-purchases` require the legacy bridge. A `patch-package` patch in `patches/` adds a `NativeAppModuleSpec` stub so the AdMob library compiles under the old architecture.

### i18n

Translations live in `src/i18n/translations.ts` as a typed record. Adding a new language requires:
1. Adding the code to `LanguageCode`
2. Adding the language to `SUPPORTED_LANGUAGES`
3. Adding a complete translation object typed as `Translations`

The active language is detected from `Intl.DateTimeFormat().resolvedOptions().locale` (no native module needed) and persisted to AsyncStorage. Users can override it in Settings.

### Location limit enforcement

When a user loses premium access, `enforceLocationLimit(isPremium)` is called on every screen focus. It silently trims the saved locations to 1 (free) or 4 (premium), keeping the first (top) entry.

---

## Building for production

```bash
# Android
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios
```

---

## License

MIT
