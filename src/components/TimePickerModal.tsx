import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { WheelColumn, WHEEL_H } from './WheelColumn';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const COLUMN_W = 88;

function parseTime(hhmm: string): [number, number] {
  const [h, m] = hhmm.split(':').map(Number);
  return [Number.isFinite(h) ? h : 8, Number.isFinite(m) ? m : 0];
}

interface TimePickerModalProps {
  visible: boolean;
  value: string; // 'HH:MM'
  onConfirm: (time: string) => void;
  onDismiss: () => void;
}

export function TimePickerModal({ visible, value, onConfirm, onDismiss }: TimePickerModalProps) {
  const [hour, setHour] = useState(() => parseTime(value)[0]);
  const [minute, setMinute] = useState(() => parseTime(value)[1]);
  // nonce forces WheelColumn to remount (and reset scroll) each time the modal opens
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (visible) {
      const [h, m] = parseTime(value);
      setHour(h);
      setMinute(m);
      setNonce(n => n + 1);
    }
  }, [visible]); // intentionally excludes `value` — only reset on open

  function handleConfirm() {
    onConfirm(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/* Dim backdrop — tap to dismiss */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />

      <View style={styles.sheet}>
        <Text style={styles.title}>Reminder time</Text>

        <View style={styles.wheelsRow}>
          <WheelColumn
            key={`h-${nonce}`}
            items={HOURS}
            initialIndex={hour}
            onChange={setHour}
            width={COLUMN_W}
          />

          <Text style={styles.colon}>:</Text>

          <WheelColumn
            key={`m-${nonce}`}
            items={MINUTES}
            initialIndex={minute}
            onChange={setMinute}
            width={COLUMN_W}
          />
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 28,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 16 },
    }),
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: WHEEL_H,
    marginBottom: SPACING.lg,
  },
  colon: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm, // optical centering
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
