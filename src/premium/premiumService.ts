// ─── Premium / entitlement service ───────────────────────────────────────────
//
// This module is the single source of truth for whether the user has premium.
// During Expo Go development the status is mocked via a local flag.
// Swap the implementation below for real RevenueCat SDK calls when you have
// a development build.
//
// TODO: REVENUECAT — replace entire mock block with real SDK initialisation
//       and Purchases.getCustomerInfo() entitlement check.

import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_PREMIUM_KEY = '@jsl/mock_premium';

// Change to true locally to test premium UI without a real subscription.
const MOCK_IS_PREMIUM_DEFAULT = false;

export interface PremiumStatus {
  isPremium: boolean;
  source: 'mock' | 'revenuecat';
}

export async function getPremiumStatus(): Promise<PremiumStatus> {
  // TODO: REVENUECAT — replace with real entitlement check:
  //   const info = await Purchases.getCustomerInfo();
  //   const isPremium = info.entitlements.active['premium'] !== undefined;
  //   return { isPremium, source: 'revenuecat' };

  try {
    const stored = await AsyncStorage.getItem(MOCK_PREMIUM_KEY);
    const isPremium = stored !== null ? stored === 'true' : MOCK_IS_PREMIUM_DEFAULT;
    return { isPremium, source: 'mock' };
  } catch {
    return { isPremium: false, source: 'mock' };
  }
}

// Dev-only helper — lets you toggle premium in the Settings screen during testing.
export async function setMockPremium(value: boolean): Promise<void> {
  // TODO: REVENUECAT — remove this function once real billing is active
  await AsyncStorage.setItem(MOCK_PREMIUM_KEY, value ? 'true' : 'false');
}
