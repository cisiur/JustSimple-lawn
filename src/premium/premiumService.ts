// ─── Premium / entitlement service ───────────────────────────────────────────
//
// This module is the single source of truth for premium access.
//
// Current mode: MOCK (Expo Go — no native billing SDK loaded).
// To activate RevenueCat (requires dev build):
//   1. npm install react-native-purchases
//   2. Add to app.config.ts plugins: 'react-native-purchases'
//   3. Call Purchases.configure() in App.tsx (see TODO below)
//   4. Uncomment the RevenueCat blocks and remove the mock blocks.
//
// TODO: REVENUECAT — replace mock blocks with real SDK calls throughout.

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types (mirror RevenueCat's shape so the swap is minimal) ────────────────

export interface PremiumStatus {
  isPremium: boolean;
  source: 'mock' | 'revenuecat';
}

/** A single purchasable package (monthly, annual, etc.) */
export interface PremiumPackage {
  identifier: string;       // RevenueCat package identifier, e.g. '$rc_monthly'
  productId: string;        // Store product ID
  priceString: string;      // Human-readable price, e.g. '$2.99/month'
  packageType: 'MONTHLY' | 'ANNUAL' | 'LIFETIME' | 'UNKNOWN';
  // TODO: REVENUECAT — add: rcPackage: PurchasesPackage (from react-native-purchases)
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ENTITLEMENT_ID = 'premium';   // Must match RevenueCat dashboard entitlement ID
const MOCK_KEY = '@jsl/mock_premium';

// ─── Entitlement check ───────────────────────────────────────────────────────

export async function getPremiumStatus(): Promise<PremiumStatus> {
  // TODO: REVENUECAT — replace with:
  //   const info = await Purchases.getCustomerInfo();
  //   const isPremium = typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  //   return { isPremium, source: 'revenuecat' };

  try {
    const stored = await AsyncStorage.getItem(MOCK_KEY);
    return { isPremium: stored === 'true', source: 'mock' };
  } catch {
    return { isPremium: false, source: 'mock' };
  }
}

// ─── Offerings ───────────────────────────────────────────────────────────────

/** Return available purchase packages. */
export async function getOfferings(): Promise<PremiumPackage[]> {
  // TODO: REVENUECAT — replace with:
  //   const offerings = await Purchases.getOfferings();
  //   return (offerings.current?.availablePackages ?? []).map(pkg => ({
  //     identifier: pkg.identifier,
  //     productId: pkg.product.identifier,
  //     priceString: pkg.product.priceString,
  //     packageType: pkg.packageType as PremiumPackage['packageType'],
  //     rcPackage: pkg,
  //   }));

  return [
    {
      identifier: '$rc_monthly',
      productId: 'com.justsimple.lawn.premium_monthly',
      priceString: '$2.99 / month',
      packageType: 'MONTHLY',
    },
  ];
}

// ─── Purchase ────────────────────────────────────────────────────────────────

/**
 * Trigger a purchase for the given package identifier.
 * Returns true if the user is now premium, false if cancelled / failed.
 */
export async function purchasePremium(pkg: PremiumPackage): Promise<boolean> {
  // TODO: REVENUECAT — replace with:
  //   const { customerInfo } = await Purchases.purchasePackage(pkg.rcPackage);
  //   return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';

  // Mock: immediately grant premium
  await AsyncStorage.setItem(MOCK_KEY, 'true');
  return true;
}

// ─── Restore purchases ───────────────────────────────────────────────────────

/** Restore previously purchased entitlements. Returns true if premium restored. */
export async function restorePurchases(): Promise<boolean> {
  // TODO: REVENUECAT — replace with:
  //   const info = await Purchases.restorePurchases();
  //   return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';

  // Mock: nothing to restore
  return false;
}

// ─── Dev-only helpers ────────────────────────────────────────────────────────

/** Toggle mock premium without billing. Only available in __DEV__ builds. */
export async function setMockPremium(value: boolean): Promise<void> {
  // TODO: REVENUECAT — remove once real billing is active
  await AsyncStorage.setItem(MOCK_KEY, value ? 'true' : 'false');
}
