import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

interface PremiumBadgeProps {
  isPremium: boolean;
}

export function PremiumBadge({ isPremium }: PremiumBadgeProps) {
  return (
    <View style={[styles.badge, isPremium ? styles.premium : styles.free]}>
      <Text style={[styles.text, isPremium ? styles.premiumText : styles.freeText]}>
        {isPremium ? '⭐ Premium' : 'Free plan'}
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
