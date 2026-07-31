import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { Task } from '@/src/data/types';
import { dueSoonId, overdueId, planTaskNotifications, NotificationChannelId } from './planner';

type NotificationsModule = typeof import('expo-notifications');

/**
 * Expo Go's Android client throws immediately on import of expo-notifications as of SDK 53+
 * (not just for push — the whole module), regardless of only using local-notification APIs.
 * A real dev/production build doesn't have this restriction, so we only load the module there.
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let cachedModule: NotificationsModule | null = null;

function getNotifications(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (!cachedModule) {
    cachedModule = require('expo-notifications');
  }
  return cachedModule;
}

export function configureNotificationHandler() {
  const Notifications = getNotifications();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationChannels() {
  if (Platform.OS !== 'android') return;
  const Notifications = getNotifications();
  if (!Notifications) return;

  const channels: Record<NotificationChannelId, { name: string; importance: number; lightColor: string }> = {
    'task-due-soon': { name: 'Task due soon', importance: Notifications.AndroidImportance.HIGH, lightColor: '#fd7e14' },
    'task-overdue': { name: 'Task overdue', importance: Notifications.AndroidImportance.MAX, lightColor: '#dc3545' },
  };

  for (const [id, config] of Object.entries(channels)) {
    await Notifications.setNotificationChannelAsync(id, { ...config, enableLights: true });
  }
}

export async function cancelTaskNotifications(taskId: string) {
  const Notifications = getNotifications();
  if (!Notifications) return;

  await Notifications.cancelScheduledNotificationAsync(dueSoonId(taskId)).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(overdueId(taskId)).catch(() => {});
}

async function ensurePermission(Notifications: NotificationsModule): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Cancels any existing notifications for this task, then reschedules from its current state. */
export async function syncTaskNotifications(task: Task) {
  const Notifications = getNotifications();
  if (!Notifications) return;

  await cancelTaskNotifications(task._id);

  const plans = planTaskNotifications(task);
  if (plans.length === 0) return;

  if (!(await ensurePermission(Notifications))) return;

  for (const plan of plans) {
    await Notifications.scheduleNotificationAsync({
      identifier: plan.identifier,
      content: { title: plan.title, body: plan.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(plan.date),
        channelId: plan.channelId,
      },
    });
  }
}
