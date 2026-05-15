import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

interface TimePickerModalProps {
  visible: boolean;
  value: string; // 'HH:MM'
  onConfirm: (time: string) => void;
  onDismiss: () => void;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function parseTime(hhmm: string): [number, number] {
  const [h, m] = hhmm.split(':').map(Number);
  return [Number.isFinite(h) ? h : 8, Number.isFinite(m) ? m : 0];
}

function formatDisplay(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export function TimePickerModal({ visible, value, onConfirm, onDismiss }: TimePickerModalProps) {
  const [initH, initM] = parseTime(value);
  const [hour, setHour] = useState(initH);
  const [minute, setMinute] = useState(initM);

  // Re-sync when the modal opens with a new value
  const [lastValue, setLastValue] = useState(value);
  if (visible && value !== lastValue) {
    const [h, m] = parseTime(value);
    setHour(h);
    setMinute(m);
    setLastValue(value);
  }

  function stepHour(delta: number) {
    setHour(h => (h + delta + 24) % 24);
  }

  function stepMinute(delta: number) {
    // Step in 5-minute increments
    setMinute(m => {
      const next = m + delta * 5;
      return ((next % 60) + 60) % 60;
    });
  }

  function handleConfirm() {
    onConfirm(`${pad(hour)}:${pad(minute)}`);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />

      <View style={styles.sheet}>
        <Text style={styles.title}>Select reminder time</Text>

        <View style={styles.pickerRow}>
          {/* Hour column */}
          <View style={styles.column}>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => stepHour(1)}>
              <Text style={styles.arrow}>▲</Text>
            </TouchableOpacity>
            <View style={styles.valueBox}>
              <Text style={styles.valueText}>{formatDisplay(hour)}</Text>
            </View>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => stepHour(-1)}>
              <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>
            <Text style={styles.columnLabel}>Hour</Text>
          </View>

          <Text style={styles.colon}>:</Text>

          {/* Minute column */}
          <View style={styles.column}>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => stepMinute(1)}>
              <Text style={styles.arrow}>▲</Text>
            </TouchableOpacity>
            <View style={styles.valueBox}>
              <Text style={styles.valueText}>{pad(minute)}</Text>
            </View>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => stepMinute(-1)}>
              <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>
            <Text style={styles.columnLabel}>Min</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  column: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  arrowBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  arrow: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.primary,
    fontWeight: '700',
  },
  valueBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minWidth: 96,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  valueText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  columnLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colon: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
