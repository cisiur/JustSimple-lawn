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
import { UpgradeModal } from '../premium/UpgradeModal';
import {
  loadSettings,
  saveSettings,
  addLocation,
  removeLocation,
  clearWeatherCache,
  AppSettings,
  Location,
  MAX_LOCATIONS_FREE,
  MAX_LOCATIONS_PREMIUM,
} from '../storage/storageService';
import { getPremiumStatus, setMockPremium } from '../premium/premiumService';
import { geocodeCity } from '../weather/weatherService';
import { requestDeviceLocation, reverseGeocode } from '../services/locationService';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../notifications/notificationService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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
  const [settings, setSettings]       = useState<AppSettings | null>(null);
  const [isPremium, setIsPremium]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [cityDraft, setCityDraft]     = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [s, { isPremium: p }] = await Promise.all([loadSettings(), getPremiumStatus()]);
        if (!active) return;
        setSettings(s);
        setIsPremium(p);
      })();
      return () => { active = false; };
    }, []),
  );

  // ── Location handlers ────────────────────────────────────────────────────────

  const maxLocations = isPremium ? MAX_LOCATIONS_PREMIUM : MAX_LOCATIONS_FREE;
  const locations    = settings?.locations ?? [];
  const canAdd       = locations.length < maxLocations;

  async function handleAddCity() {
    const name = cityDraft.trim();
    if (!name) { Alert.alert('Enter a city name first.'); return; }
    setSaving(true);
    try {
      const results = await geocodeCity(name);
      if (!results.length) {
        Alert.alert('City not found', `"${name}" returned no results. Try a different spelling.`);
        return;
      }
      const { name: n, latitude, longitude, country, admin1 } = results[0];
      const displayName = [n, admin1, country].filter(Boolean).join(', ');
      const newLoc = await addLocation({ name: displayName, latitude, longitude });
      await clearWeatherCache();
      setSettings(prev => prev ? { ...prev, locations: [...prev.locations, newLoc] } : prev);
      setCityDraft('');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add location.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddGPS() {
    setSaving(true);
    try {
      const coords      = await requestDeviceLocation();
      const displayName = await reverseGeocode(coords.latitude, coords.longitude);
      const newLoc      = await addLocation({ name: displayName, ...coords });
      await clearWeatherCache();
      setSettings(prev => prev ? { ...prev, locations: [...prev.locations, newLoc] } : prev);
    } catch (e) {
      Alert.alert('Location error', e instanceof Error ? e.message : 'Could not get GPS location.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveLocation(loc: Location) {
    Alert.alert(
      'Remove location',
      `Remove "${loc.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            await removeLocation(loc.id);
            await clearWeatherCache();
            setSettings(prev =>
              prev ? { ...prev, locations: prev.locations.filter(l => l.id !== loc.id) } : prev,
            );
          },
        },
      ],
    );
  }

  // ── Reminder handlers ────────────────────────────────────────────────────────

  async function handleReminderToggle(value: boolean) {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Permission required', 'Enable notifications in your device settings.');
        return;
      }
      await saveSettings({ reminderEnabled: true });
      setSettings(prev => prev ? { ...prev, reminderEnabled: true } : prev);
      await scheduleDailyReminder(settings?.reminderTime ?? '08:00');
    } else {
      await saveSettings({ reminderEnabled: false });
      setSettings(prev => prev ? { ...prev, reminderEnabled: false } : prev);
      await cancelDailyReminder();
    }
  }

  async function handleTimeConfirm(hhmm: string) {
    setShowTimePicker(false);
    await saveSettings({ reminderTime: hhmm });
    setSettings(prev => prev ? { ...prev, reminderTime: hhmm } : prev);
    if (settings?.reminderEnabled) await scheduleDailyReminder(hhmm);
  }

  // ── Premium ──────────────────────────────────────────────────────────────────

  function handlePurchased() { setIsPremium(true); }

  async function handleMockPremiumToggle(value: boolean) {
    await setMockPremium(value);
    setIsPremium(value);
  }

  // ── Loading state ────────────────────────────────────────────────────────────

  if (!settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Locations ────────────────────────────────────────────────────── */}
        <SectionHeader title={`Locations (${locations.length} / ${maxLocations})`} />
        <Card>
          {/* Saved locations list */}
          {locations.length === 0 && (
            <Row last>
              <Text style={styles.hintText}>No location added yet.</Text>
            </Row>
          )}
          {locations.map((loc, idx) => (
            <Row key={loc.id} last={idx === locations.length - 1 && !canAdd}>
              <Text style={styles.locationName} numberOfLines={1}>{loc.name}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveLocation(loc)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.removeBtn}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </Row>
          ))}

          {/* Add location form — shown when under the limit */}
          {canAdd && (
            <>
              <View style={styles.addRow}>
                <TextInput
                  style={styles.input}
                  value={cityDraft}
                  onChangeText={setCityDraft}
                  placeholder="Search city…"
                  placeholderTextColor={COLORS.textSecondary}
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={handleAddCity}
                  editable={!saving}
                />
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleAddCity}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color={COLORS.white} />
                    : <Text style={styles.saveButtonText}>Add</Text>
                  }
                </TouchableOpacity>
              </View>
              <Row last>
                <TouchableOpacity
                  style={[styles.gpsButton, saving && styles.saveButtonDisabled]}
                  onPress={handleAddGPS}
                  disabled={saving}
                >
                  <Text style={styles.gpsButtonText}>📍  Use my current location</Text>
                </TouchableOpacity>
              </Row>
            </>
          )}

          {/* Upgrade prompt when free user hits the limit */}
          {!canAdd && !isPremium && (
            <Row last>
              <View style={styles.lockedRow}>
                <Text style={styles.lockIcon}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lockedTitle}>Premium feature</Text>
                  <Text style={styles.hintText}>
                    Upgrade to track up to {MAX_LOCATIONS_PREMIUM} locations.
                  </Text>
                </View>
                <TouchableOpacity style={styles.upgradeChip} onPress={() => setShowUpgrade(true)}>
                  <Text style={styles.upgradeChipText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            </Row>
          )}
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
                    {formatTime(settings.reminderTime)}
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
                <Text style={styles.hintText}>
                  Get a daily push notification with today's watering recommendation.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.upgradeButton} onPress={() => setShowUpgrade(true)}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* ── Plan ─────────────────────────────────────────────────────────── */}
        <SectionHeader title="Plan" />
        {isPremium ? (
          <Card>
            <Row last>
              <View>
                <Text style={styles.premiumActiveTitle}>⭐ You're on Premium</Text>
                <Text style={styles.hintText}>No ads · Up to 4 locations · Daily reminder</Text>
              </View>
            </Row>
          </Card>
        ) : (
          <Card>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Free plan</Text>
                <Text style={styles.hintText}>1 location · Banner ads · No reminders</Text>
              </View>
            </Row>
            <Row last>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Premium</Text>
                <Text style={styles.hintText}>Up to 4 locations · No ads · Daily reminder</Text>
              </View>
              <TouchableOpacity style={styles.upgradeChip} onPress={() => setShowUpgrade(true)}>
                <Text style={styles.upgradeChipText}>Upgrade</Text>
              </TouchableOpacity>
            </Row>
          </Card>
        )}

        {/* ── Developer Tools ───────────────────────────────────────────────── */}
        {__DEV__ && (
          <>
            <SectionHeader title="Developer Tools" />
            <Card>
              <Row last>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>Mock premium</Text>
                  <Text style={styles.hintText}>Toggle premium UI without billing.</Text>
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

      <UpgradeModal
        visible={showUpgrade}
        onDismiss={() => setShowUpgrade(false)}
        onPurchased={handlePurchased}
      />

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
  locationName: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  removeBtn: {
    padding: SPACING.xs,
  },
  removeBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    minWidth: 56,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZE.md,
  },
  gpsButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  gpsButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
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
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
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
    borderRadius: BORDER_RADIUS.full,
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
