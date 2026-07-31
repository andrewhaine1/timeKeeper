import { Task } from '@/src/data/types';
import { TASK_CONFIG } from '@/src/config';

export type NotificationChannelId = 'task-due-soon' | 'task-overdue';

export interface PlannedNotification {
  identifier: string;
  title: string;
  body: string;
  /** Epoch ms */
  date: number;
  channelId: NotificationChannelId;
}

export const dueSoonId = (taskId: string) => `task-${taskId}-due-soon`;
export const overdueId = (taskId: string) => `task-${taskId}-overdue`;

/**
 * Only "In Progress" tasks with a due date get due-date notifications — mirrors
 * getTaskUrgency's rule that New/Completed/Closed never compute due-date urgency.
 * Notifications already in the past are skipped rather than fired immediately,
 * since the in-app urgency badge already communicates that state.
 */
export function planTaskNotifications(task: Task, now = Date.now()): PlannedNotification[] {
  if (task.status.name !== 'In Progress' || !task.dueDate) return [];

  const due = new Date(task.dueDate).getTime();
  const dueSoonAt = due - TASK_CONFIG.URGENCY_THRESHOLD_MINUTES * 60 * 1000;
  const plans: PlannedNotification[] = [];

  if (dueSoonAt > now) {
    plans.push({
      identifier: dueSoonId(task._id),
      title: 'Task due soon',
      body: task.shortDescription,
      date: dueSoonAt,
      channelId: 'task-due-soon',
    });
  }

  if (due > now) {
    plans.push({
      identifier: overdueId(task._id),
      title: 'Task overdue',
      body: task.shortDescription,
      date: due,
      channelId: 'task-overdue',
    });
  }

  return plans;
}
