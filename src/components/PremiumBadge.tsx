import { View, Text, StyleSheet } from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

interface PremiumBadgeProps {
  isPremium: boolean;
}

export function PremiumBadge({ isPremium }: PremiumBadgeProps) {
  const { t } = useI18n();

  return (
    <View style={[styles.badge, isPremium ? styles.premium : styles.free]}>
      <Text style={[styles.text, isPremium ? styles.premiumText : styles.freeText]}>
        {isPremium ? t('badge.premium') : t('badge.free')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
  },
  premium: {
    backgroundColor: '#FFF8E1',
  },
  free: {
    backgroundColor: COLORS.surface,
  },
  text: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  premiumText: {
    color: '#F59E0B',
  },
  freeText: {
    color: COLORS.textSecondary,
  },
});
