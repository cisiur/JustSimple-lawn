import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { t } from '../i18n/i18n';

const REMINDER_IDENTIFIER = 'justsimple-lawn-daily-reminder';

// ─── Android notification channel ────────────────────────────────────────────

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('lawn-reminders', {
    name: 'Lawn Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// ─── Schedule / cancel ────────────────────────────────────────────────────────

/**
 * Schedule (or reschedule) a daily notification at the given HH:MM time.
 * Cancels any previously scheduled reminder first so there's never a duplicate.
 */
export async function scheduleDailyReminder(hhmm: string): Promise<void> {
  const [hour, minute] = hhmm.split(':').map(Number);

  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: `🌿 ${t('notification.title')}`,
      body:  t('notification.body'),
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
}

export async function isReminderScheduled(): Promise<boolean> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.some(n => n.identifier === REMINDER_IDENTIFIER);
}

// ─── App-level handler (call once in App.tsx) ─────────────────────────────────

/**
 * Set how notifications behave when the app is in the foreground.
 * Call this once at startup in App.tsx.
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
