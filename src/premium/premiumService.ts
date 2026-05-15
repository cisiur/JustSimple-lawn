import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ─── Runtime detection ────────────────────────────────────────────────────────
// react-native-purchases is not bundled in Expo Go. We detect the environment
// at runtime so the mock path stays active in Expo Go automatically.

const isExpoGo = Constants.executionEnvironment === 'storeClient';

let Purchases: any = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Purchases = require('react-native-purchases').default;
  } catch {
    // Module missing — stay in mock mode
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ENTITLEMENT_ID = 'premium'; // Must match the entitlement identifier in RevenueCat dashboard
const MOCK_KEY = '@jsl/mock_premium';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PremiumStatus {
  isPremium: boolean;
  source: 'mock' | 'revenuecat';
}

export interface PremiumPackage {
  identifier: string;
  productId: string;
  priceString: string;
  packageType: 'MONTHLY' | 'ANNUAL' | 'LIFETIME' | 'UNKNOWN';
  _raw?: unknown; // holds the real PurchasesPackage when using RevenueCat
}

// ─── SDK initialisation (called once in App.tsx) ──────────────────────────────

export function configureRevenueCat(): void {
  if (!Purchases) return;

  const key = Platform.OS === 'android'
    ? (Constants.expoConfig?.extra?.revenueCatKeyAndroid as string | undefined)
    : (Constants.expoConfig?.extra?.revenueCatKeyIos as string | undefined);

  if (!key) {
    console.warn('[RevenueCat] API key not set — check your .env file.');
    return;
  }

  Purchases.configure({ apiKey: key });
}

// ─── Entitlement check ───────────────────────────────────────────────────────

export async function getPremiumStatus(): Promise<PremiumStatus> {
  // In dev builds the mock toggle takes priority so you can test premium UI
  // without needing real purchases. Compiled out in production.
  if (__DEV__) {
    try {
      const stored = await AsyncStorage.getItem(MOCK_KEY);
      if (stored === 'true') return { isPremium: true, source: 'mock' };
    } catch { /* ignore */ }
  }

  if (Purchases) {
    try {
      const info = await Purchases.getCustomerInfo();
      const isPremium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      return { isPremium, source: 'revenuecat' };
    } catch {
      // Fall through to mock on SDK error
    }
  }

  // Mock fallback (Expo Go or SDK error)
  try {
    const stored = await AsyncStorage.getItem(MOCK_KEY);
    return { isPremium: stored === 'true', source: 'mock' };
  } catch {
    return { isPremium: false, source: 'mock' };
  }
}

// ─── Offerings ───────────────────────────────────────────────────────────────

export async function getOfferings(): Promise<PremiumPackage[]> {
  if (Purchases) {
    try {
      const offerings = await Purchases.getOfferings();
      const pkgs = offerings.current?.availablePackages ?? [];
      return pkgs.map((pkg: any): PremiumPackage => ({
        identifier:  pkg.identifier,
        productId:   pkg.product.identifier,
        priceString: pkg.product.priceString,
        packageType: pkg.packageType as PremiumPackage['packageType'],
        _raw: pkg,
      }));
    } catch {
      // Fall through to mock
    }
  }

  // Mock offering
  return [
    {
      identifier:  '$rc_monthly',
      productId:   'com.justsimple.lawn.premium_monthly',
      priceString: '$2.99 / month',
      packageType: 'MONTHLY',
    },
  ];
}

// ─── Purchase ────────────────────────────────────────────────────────────────

export async function purchasePremium(pkg: PremiumPackage): Promise<boolean> {
  if (Purchases && pkg._raw) {
    const { customerInfo } = await Purchases.purchasePackage(pkg._raw);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  }

  // Mock purchase
  await AsyncStorage.setItem(MOCK_KEY, 'true');
  return true;
}

// ─── Restore ─────────────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<boolean> {
  if (Purchases) {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  }

  return false; // nothing to restore in mock mode
}

// ─── Dev helper ──────────────────────────────────────────────────────────────

export async function setMockPremium(value: boolean): Promise<void> {
  await AsyncStorage.setItem(MOCK_KEY, value ? 'true' : 'false');
}
