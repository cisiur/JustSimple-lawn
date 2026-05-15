import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { TimePickerModal } from '../components/TimePickerModal';
import { UpgradeModal } from '../premium/UpgradeModal';
import { useI18n } from '../i18n/I18nContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import type { LanguageCode } from '../i18n/translations';
import {
  loadSettings,
  saveSettings,
  addLocation,
  removeLocation,
  clearWeatherCache,
  enforceLocationLimit,
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
  const { t, languageSetting, changeLanguage } = useI18n();

  const [settings, setSettings]           = useState<AppSettings | null>(null);
  const [isPremium, setIsPremium]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [cityDraft, setCityDraft]         = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showUpgrade, setShowUpgrade]     = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [s, { isPremium: p }] = await Promise.all([loadSettings(), getPremiumStatus()]);
        if (!active) return;
        // Trim locations to plan limit (no-op if already within limit)
        const trimmed = await enforceLocationLimit(p);
        setSettings({ ...s, locations: trimmed });
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
    if (!name) { Alert.alert(t('alert.enterCity')); return; }
    setSaving(true);
    try {
      const results = await geocodeCity(name);
      if (!results.length) {
        Alert.alert(t('alert.cityNotFound'), t('alert.cityNotFound.body', { name }));
        return;
      }
      const { name: n, latitude, longitude, country, admin1 } = results[0];
      const displayName = [n, admin1, country].filter(Boolean).join(', ');
      const newLoc = await addLocation({ name: displayName, latitude, longitude });
      await clearWeatherCache();
      setSettings(prev => prev ? { ...prev, locations: [...prev.locations, newLoc] } : prev);
      setCityDraft('');
    } catch (e) {
      Alert.alert(t('alert.addError'), e instanceof Error ? e.message : t('alert.addError'));
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
      Alert.alert(t('alert.locationError'), e instanceof Error ? e.message : t('alert.locationError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveLocation(loc: Location) {
    Alert.alert(
      t('settings.locations.remove.title'),
      t('settings.locations.remove.message', { name: loc.name }),
      [
        { text: t('settings.locations.remove.cancel'), style: 'cancel' },
        {
          text: t('settings.locations.remove.confirm'), style: 'destructive',
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
        Alert.alert(t('alert.permissionRequired'), t('alert.permissionRequired.body'));
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
    // If downgrading, trim locations to free limit right away
    const trimmed = await enforceLocationLimit(value);
    setSettings(prev => prev ? { ...prev, locations: trimmed } : prev);
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
        <SectionHeader title={t('settings.locations', { n: locations.length, max: maxLocations })} />
        <Card>
          {/* Saved locations list */}
          {locations.length === 0 && (
            <Row last>
              <Text style={styles.hintText}>{t('settings.locations.none')}</Text>
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
                  placeholder={t('settings.locations.search')}
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
                    : <Text style={styles.saveButtonText}>{t('settings.locations.add')}</Text>
                  }
                </TouchableOpacity>
              </View>
              <Row last>
                <TouchableOpacity
                  style={[styles.gpsButton, saving && styles.saveButtonDisabled]}
                  onPress={handleAddGPS}
                  disabled={saving}
                >
                  <Text style={styles.gpsButtonText}>{t('settings.locations.useGPS')}</Text>
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
                  <Text style={styles.lockedTitle}>{t('locked.title')}</Text>
                  <Text style={styles.hintText}>
                    {t('settings.locations.locked', { max: MAX_LOCATIONS_PREMIUM })}
                  </Text>
                </View>
                <TouchableOpacity style={styles.upgradeChip} onPress={() => setShowUpgrade(true)}>
                  <Text style={styles.upgradeChipText}>{t('settings.upgrade.chip')}</Text>
                </TouchableOpacity>
              </View>
            </Row>
          )}
        </Card>

        {/* ── Language ─────────────────────────────────────────────────────── */}
        <SectionHeader title={t('settings.language')} />
        <Card>
          <Row last>
            <Text style={styles.rowLabel}>{t('settings.language')}</Text>
            <TouchableOpacity
              style={styles.langSelector}
              onPress={() => setShowLangPicker(true)}
            >
              <Text style={styles.langSelectorValue}>
                {languageSetting === 'auto'
                  ? t('settings.language.auto')
                  : SUPPORTED_LANGUAGES.find(l => l.code === languageSetting)?.label}
              </Text>
              <Text style={styles.langChevron}>›</Text>
            </TouchableOpacity>
          </Row>
        </Card>

        {/* ── Daily reminder ────────────────────────────────────────────────── */}
        <SectionHeader title={t('settings.reminder')} />
        {isPremium ? (
          <Card>
            <Row>
              <Text style={styles.rowLabel}>{t('settings.reminder.enable')}</Text>
              <Switch
                value={settings.reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ true: COLORS.primary, false: COLORS.border }}
                thumbColor={COLORS.white}
              />
            </Row>
            {settings.reminderEnabled && (
              <Row last>
                <Text style={styles.rowLabel}>{t('settings.reminder.time')}</Text>
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
                <Text style={styles.lockedTitle}>{t('locked.title')}</Text>
                <Text style={styles.hintText}>{t('settings.reminder.locked')}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.upgradeButton} onPress={() => setShowUpgrade(true)}>
              <Text style={styles.upgradeButtonText}>{t('settings.upgrade')}</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* ── Plan ─────────────────────────────────────────────────────────── */}
        <SectionHeader title={t('settings.plan')} />
        {isPremium ? (
          <Card>
            <Row last>
              <View>
                <Text style={styles.premiumActiveTitle}>{t('settings.plan.active')}</Text>
                <Text style={styles.hintText}>{t('settings.plan.active.hint')}</Text>
              </View>
            </Row>
          </Card>
        ) : (
          <Card>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{t('settings.plan.free')}</Text>
                <Text style={styles.hintText}>{t('settings.plan.free.hint')}</Text>
              </View>
            </Row>
            <Row last>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{t('settings.plan.premium')}</Text>
                <Text style={styles.hintText}>{t('settings.plan.premium.hint')}</Text>
              </View>
              <TouchableOpacity style={styles.upgradeChip} onPress={() => setShowUpgrade(true)}>
                <Text style={styles.upgradeChipText}>{t('settings.upgrade.chip')}</Text>
              </TouchableOpacity>
            </Row>
          </Card>
        )}

        {/* ── Developer Tools ───────────────────────────────────────────────── */}
        {__DEV__ && (
          <>
            <SectionHeader title={t('settings.dev')} />
            <Card>
              <Row last>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{t('settings.dev.mock')}</Text>
                  <Text style={styles.hintText}>{t('settings.dev.mock.hint')}</Text>
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
        <SectionHeader title={t('settings.about')} />
        <Card>
          <Row last>
            <Text style={styles.hintText}>{t('settings.about.credit')}</Text>
          </Row>
        </Card>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <UpgradeModal
        visible={showUpgrade}
        onDismiss={() => setShowUpgrade(false)}
        onPurchased={handlePurchased}
      />

      {/* ── Language picker modal ─────────────────────────────────────────── */}
      <Modal
        visible={showLangPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangPicker(false)}
      >
        <TouchableOpacity
          style={styles.langBackdrop}
          activeOpacity={1}
          onPress={() => setShowLangPicker(false)}
        />
        <View style={styles.langSheet}>
          <Text style={styles.langSheetTitle}>{t('settings.language')}</Text>

          {/* Auto option */}
          {((['auto', ...SUPPORTED_LANGUAGES.map(l => l.code)] as const)).map((code, idx) => {
            const isAuto     = code === 'auto';
            const isSelected = languageSetting === code;
            const label      = isAuto
              ? t('settings.language.auto')
              : SUPPORTED_LANGUAGES.find(l => l.code === code)!.label;
            const isLast     = idx === SUPPORTED_LANGUAGES.length; // auto + all langs
            return (
              <TouchableOpacity
                key={code}
                style={[styles.langOption, isLast && styles.langOptionLast]}
                onPress={() => {
                  changeLanguage(code as LanguageCode | 'auto');
                  setShowLangPicker(false);
                }}
              >
                <Text style={[styles.langOptionText, isSelected && styles.langOptionTextSelected]}>
                  {label}
                </Text>
                {isSelected && <Text style={styles.langOptionCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>

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
    flex: 1,
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
  // Language — trigger row
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  langSelectorValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  langChevron: {
    fontSize: 20,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  // Language — modal backdrop
  langBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  // Language — modal sheet (centre card)
  langSheet: {
    position: 'absolute',
    top: '50%',
    left: SPACING.xl,
    right: SPACING.xl,
    transform: [{ translateY: -180 }],
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  langSheetTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  langOptionLast: {
    // no extra style needed — border-top already separates items
  },
  langOptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  langOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  langOptionCheck: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
