/**
 * Application-wide configuration.
 * Adjust URGENCY_THRESHOLD_MINUTES to change when tasks turn orange on approach to their due date.
 */
export const TASK_CONFIG = {
  /** Minutes before due date at which an In Progress task is flagged as urgent (orange). */
  URGENCY_THRESHOLD_MINUTES: 60,
};
