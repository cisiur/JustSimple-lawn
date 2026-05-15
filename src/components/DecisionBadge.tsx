import { View, Text, StyleSheet } from 'react-native';
import { WateringDecisionType } from '../weather/weatherTypes';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE } from '../constants/theme';

interface DecisionBadgeProps {
  decision: WateringDecisionType;
  reason: string;
}

const CONFIG: Record<WateringDecisionType, { emoji: string; label: string; bg: string; text: string }> = {
  water: {
    emoji: '💧',
    label: 'Water today',
    bg: COLORS.primaryLight,
    text: COLORS.primaryDark,
  },
  skip: {
    emoji: '☔',
    label: 'Skip today',
    bg: COLORS.redLight,
    text: COLORS.red,
  },
  uncertain: {
    emoji: '🌤',
    label: 'Check later',
    bg: COLORS.amberLight,
    text: COLORS.amber,
  },
};

export function DecisionBadge({ decision, reason }: DecisionBadgeProps) {
  const { emoji, label, bg, text } = CONFIG[decision];

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
      <Text style={styles.reason}>{reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  emoji: {
    fontSize: FONT_SIZE.hero,
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  reason: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
