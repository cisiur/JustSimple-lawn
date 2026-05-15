import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { TimePickerModal } from '../components/TimePickerModal';
import { loadSettings, saveSettings, AppSettings } from '../storage/storageService';
import { getPremiumStatus, setMockPremium } from '../premium/premiumService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, BORDER_RADIUS as BR } from '../constants/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// ─── Shared layout pieces ─────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <View style={[styles.row, last && styles.rowLast]}>{children}</View>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [locationDraft, setLocationDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Reload every time this tab is focused
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [s, p] = await Promise.all([loadSettings(), getPremiumStatus()]);
        if (!active) return;
        setSettings(s);
        setLocationDraft(s.locationName);
        setIsPremium(p.isPremium);
      })();
      return () => { active = false; };
    }, [])
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSaveLocation() {
    const name = locationDraft.trim();
    if (!name) { Alert.alert('Enter a city name first.'); return; }
    setSaving(true);
    // TODO: replace with real geocoding in Batch 3e (resolve coords from city name)
    await saveSettings({ locationName: name, latitude: null, longitude: null });
    setSettings(prev => prev ? { ...prev, locationName: name } : prev);
    setSaving(false);
    Alert.alert('Location saved', `Using "${name}" as your location.`);
  }

  async function handleReminderToggle(value: boolean) {
    await saveSettings({ reminderEnabled: value });
    setSettings(prev => prev ? { ...prev, reminderEnabled: value } : prev);
    // TODO: schedule / cancel notification in Batch 3f
  }

  async function handleTimeConfirm(hhmm: string) {
    setShowTimePicker(false);
    await saveSettings({ reminderTime: hhmm });
    setSettings(prev => prev ? { ...prev, reminderTime: hhmm } : prev);
    // TODO: reschedule notification in Batch 3f
  }

  // TODO: REVENUECAT — replace with real Purchases.purchasePackage() flow
  function handleUpgrade() {
    Alert.alert(
      'Upgrade to Premium',
      'RevenueCat purchase flow will be wired here in a later build.\n\nFor now use the dev toggle below to test premium UI.',
    );
  }

  // Dev-only: toggle mock premium without billing
  async function handleMockPremiumToggle(value: boolean) {
    await setMockPremium(value);
    setIsPremium(value);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Location ─────────────────────────────────────────────────────── */}
        <SectionHeader title="Location" />
        <Card>
          <Row>
            <Text style={styles.rowLabel}>City name</Text>
          </Row>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={locationDraft}
              onChangeText={setLocationDraft}
              placeholder="e.g. Warsaw"
              placeholderTextColor={COLORS.textSecondary}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSaveLocation}
            />
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveLocation}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : <Text style={styles.saveButtonText}>Save</Text>
              }
            </TouchableOpacity>
          </View>
          <Row last>
            <Text style={styles.hintText}>
              {/* TODO: add GPS button in Batch 3e */}
              GPS detection will be added in a future update.
            </Text>
          </Row>
        </Card>

        {/* ── Daily reminder ────────────────────────────────────────────────── */}
        <SectionHeader title="Daily Reminder" />
        {isPremium ? (
          <Card>
            <Row>
              <Text style={styles.rowLabel}>Enable reminder</Text>
              <Switch
                value={settings.reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ true: COLORS.primary, false: COLORS.border }}
                thumbColor={COLORS.white}
              />
            </Row>
            {settings.reminderEnabled && (
              <Row last>
                <Text style={styles.rowLabel}>Reminder time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {formatTime12h(settings.reminderTime)}
                  </Text>
                </TouchableOpacity>
              </Row>
            )}
          </Card>
        ) : (
          <Card>
            <View style={styles.lockedRow}>
              <Text style={styles.lockIcon}>🔒</Text>
              <View style={styles.lockedText}>
                <Text style={styles.lockedTitle}>Premium feature</Text>
                <Text style={styles.lockedSubtitle}>
                  Get a daily push notification with today's watering recommendation.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* ── Premium status ────────────────────────────────────────────────── */}
        <SectionHeader title="Plan" />
        {isPremium ? (
          <Card>
            <Row last>
              <View>
                <Text style={styles.premiumActiveTitle}>⭐ You're on Premium</Text>
                <Text style={styles.hintText}>No ads · Daily reminder notification</Text>
              </View>
            </Row>
          </Card>
        ) : (
          <Card>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Free plan</Text>
                <Text style={styles.hintText}>Banner ad shown · No reminders</Text>
              </View>
            </Row>
            <Row last>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Premium</Text>
                <Text style={styles.hintText}>No ads · Daily reminder notification</Text>
              </View>
              <TouchableOpacity style={styles.upgradeChip} onPress={handleUpgrade}>
                <Text style={styles.upgradeChipText}>Upgrade</Text>
              </TouchableOpacity>
            </Row>
          </Card>
        )}

        {/* ── Dev tools (only in development builds / Expo Go) ──────────────── */}
        {__DEV__ && (
          <>
            <SectionHeader title="Developer Tools" />
            <Card>
              <Row last>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>Mock premium</Text>
                  <Text style={styles.hintText}>
                    Toggle premium UI without billing.{'\n'}
                    Removed automatically in production.
                  </Text>
                </View>
                <Switch
                  value={isPremium}
                  onValueChange={handleMockPremiumToggle}
                  trackColor={{ true: COLORS.primary, false: COLORS.border }}
                  thumbColor={COLORS.white}
                />
              </Row>
            </Card>
          </>
        )}

        {/* ── About ─────────────────────────────────────────────────────────── */}
        <SectionHeader title="About" />
        <Card>
          <Row last>
            <Text style={styles.hintText}>
              Weather data provided by Open-Meteo (open-meteo.com) — free and open-source.
            </Text>
          </Row>
        </Card>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <TimePickerModal
        visible={showTimePicker}
        value={settings.reminderTime}
        onConfirm={handleTimeConfirm}
        onDismiss={() => setShowTimePicker(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  scroll: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionHeader: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  hintText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZE.md,
  },
  timeButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lockIcon: {
    fontSize: FONT_SIZE.xl,
  },
  lockedText: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  lockedSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  upgradeButton: {
    margin: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  upgradeChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BR.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  upgradeChipText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  premiumActiveTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
});
