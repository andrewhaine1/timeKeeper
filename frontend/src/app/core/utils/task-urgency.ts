import { Task } from '../services/task.service';
import { TASK_CONFIG } from '../config';

/**
 * Urgency levels drive both the badge colour and the left-border colour on task cards.
 *
 * new        → grey   (status = New, regardless of due date)
 * approaching→ amber  (In Progress, due date exists, > threshold remaining)
 * urgent     → orange (In Progress, due date exists, ≤ threshold remaining)
 * overdue    → red    (any non-complete/closed task past its due date)
 * completed  → green
 * closed     → dark grey
 * normal     → blue   (In Progress but no due date set)
 */
export type UrgencyLevel =
  | 'new'
  | 'approaching'
  | 'urgent'
  | 'overdue'
  | 'completed'
  | 'closed'
  | 'normal';

export function getTaskUrgency(
  task: Task,
  thresholdMinutes = TASK_CONFIG.URGENCY_THRESHOLD_MINUTES
): UrgencyLevel {
  const name = task.status.name;

  if (name === 'Completed') return 'completed';
  if (name === 'Closed') return 'closed';
  if (name === 'New') return 'new';

  // In Progress from here on
  if (!task.dueDate) return 'normal';

  const msRemaining = new Date(task.dueDate).getTime() - Date.now();
  if (msRemaining < 0) return 'overdue';
  if (msRemaining <= thresholdMinutes * 60 * 1000) return 'urgent';
  return 'approaching';
}

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  new: 'New',
  approaching: 'In Progress',
  urgent: 'Due Soon',
  overdue: 'Overdue',
  completed: 'Completed',
  closed: 'Closed',
  normal: 'In Progress',
};
