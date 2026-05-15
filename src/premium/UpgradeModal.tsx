import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import {
  getOfferings,
  purchasePremium,
  restorePurchases,
  PremiumPackage,
} from './premiumService';
import { useI18n } from '../i18n/I18nContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

interface UpgradeModalProps {
  visible:    boolean;
  onDismiss:  () => void;
  onPurchased: () => void; // called after successful purchase or restore
}

export function UpgradeModal({ visible, onDismiss, onPurchased }: UpgradeModalProps) {
  const { t } = useI18n();

  const [packages, setPackages]                 = useState<PremiumPackage[]>([]);
  const [selected, setSelected]                 = useState<PremiumPackage | null>(null);
  const [loading, setLoading]                   = useState(false);
  const [loadingOfferings, setLoadingOfferings] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoadingOfferings(true);
    getOfferings()
      .then(pkgs => {
        setPackages(pkgs);
        setSelected(pkgs[0] ?? null);
      })
      .finally(() => setLoadingOfferings(false));
  }, [visible]);

  async function handlePurchase() {
    if (!selected) return;
    setLoading(true);
    try {
      const success = await purchasePremium(selected);
      if (success) {
        onPurchased();
        onDismiss();
      } else {
        Alert.alert(t('premium.cancelled'), t('premium.cancelled.body'));
      }
    } catch (e) {
      Alert.alert(t('premium.failed'), e instanceof Error ? e.message : t('premium.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert(t('premium.restored'), t('premium.restored.body'), [
          { text: t('alert.ok'), onPress: () => { onPurchased(); onDismiss(); } },
        ]);
      } else {
        Alert.alert(t('premium.nothingToRestore'), t('premium.nothingToRestore.body'));
      }
    } catch (e) {
      Alert.alert(t('alert.addError'), e instanceof Error ? e.message : t('alert.addError'));
    } finally {
      setLoading(false);
    }
  }

  const PREMIUM_FEATURES: { icon: string; textKey: 'premium.feature.noAds' | 'premium.feature.reminder' | 'premium.feature.locations' }[] = [
    { icon: '🚫', textKey: 'premium.feature.noAds' },
    { icon: '🔔', textKey: 'premium.feature.reminder' },
    { icon: '📍', textKey: 'premium.feature.locations' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />

      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.handle} />
        <Text style={styles.title}>{t('premium.title')}</Text>
        <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>

        {/* Feature list */}
        <View style={styles.features}>
          {PREMIUM_FEATURES.map(f => (
            <View key={f.textKey} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{t(f.textKey)}</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        {loadingOfferings ? (
          <ActivityIndicator color={COLORS.primary} style={styles.offeringLoader} />
        ) : (
          <View style={styles.plans}>
            {packages.map(pkg => (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.plan, selected?.identifier === pkg.identifier && styles.planSelected]}
                onPress={() => setSelected(pkg)}
              >
                <Text style={[styles.planType, selected?.identifier === pkg.identifier && styles.planTypeSelected]}>
                  {pkg.packageType === 'MONTHLY'
                    ? t('premium.package.monthly')
                    : pkg.packageType === 'ANNUAL'
                    ? t('premium.package.annual')
                    : pkg.packageType}
                </Text>
                <Text style={[styles.planPrice, selected?.identifier === pkg.identifier && styles.planPriceSelected]}>
                  {pkg.priceString}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.subscribeBtn, (loading || !selected) && styles.subscribeBtnDisabled]}
          onPress={handlePurchase}
          disabled={loading || !selected}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.subscribeBtnText}>
                {t('premium.subscribe', { price: selected?.priceString ?? '…' })}
              </Text>
          }
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={loading} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>{t('premium.restore')}</Text>
        </TouchableOpacity>

        {/* Legal note */}
        <Text style={styles.legal}>{t('premium.legal')}</Text>

        <View style={{ height: Platform.OS === 'ios' ? SPACING.xl : SPACING.md }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 16 },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  features: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  featureIcon: {
    fontSize: FONT_SIZE.xl,
  },
  featureText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  plans: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  plan: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  planSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  planType: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planTypeSelected: {
    color: COLORS.primaryDark,
  },
  planPrice: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  planPriceSelected: {
    color: COLORS.primaryDark,
  },
  offeringLoader: {
    marginBottom: SPACING.lg,
  },
  subscribeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subscribeBtnDisabled: {
    opacity: 0.6,
  },
  subscribeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  restoreText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  legal: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: SPACING.xs,
  },
});
