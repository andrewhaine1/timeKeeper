/**
 * Suggested default for the Team-mode server URL field (see .env.example) — not the
 * runtime source of truth, which is entered by the user and persisted in AsyncStorage
 * (see src/context/AppModeContext.tsx). On a physical device or Android emulator,
 * localhost does not point at your dev machine — use your LAN IP instead.
 */
export const DEFAULT_SERVER_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const TASK_CONFIG = {
  /** Minutes before due date at which an In Progress task is flagged as urgent (orange). */
  URGENCY_THRESHOLD_MINUTES: 60,
};
