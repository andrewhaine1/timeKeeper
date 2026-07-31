# Local Notifications for Task Due Dates

Any task with status **In Progress** and a due date gets two scheduled local
notifications — **"Task due soon"** at the existing 60-minute urgency
threshold, and **"Task overdue"** right at the due date. Nothing fires for
New/Completed/Closed statuses or tasks without a due date.

This is fully automatic: creating, editing, or deleting a task through either
Team or Individual mode reschedules/cancels notifications for you. Screens
never call any notification code directly.

## How it's built

- `src/notifications/planner.ts` — pure decision logic, no RN/Expo imports,
  so it's unit-testable on its own.
- `src/notifications/scheduler.ts` — the actual `expo-notifications` calls
  (permissions, Android channels, scheduling).
- Wired in at `getRepo()` (`src/data/index.ts`) so both data backends
  (Team/API and Individual/SQLite) get it for free.
- Two Android notification channels — due-soon (orange, high importance) and
  overdue (red, max importance) — set up once at app startup, so each can be
  muted/adjusted independently by the user.

## Verified

- Checked the exact `expo-notifications` API against its shipped type
  definitions rather than docs — `channelId` belongs in the `trigger` object,
  not `content`, which the docs summary didn't make clear.
- `tsc --noEmit` and `expo export --platform android` both clean.
- 13 test cases against the planner logic covering every status/timing edge
  case (New/Completed/Closed never notify, already-past times are skipped
  rather than firing retroactively, exact threshold math, deterministic
  per-task identifiers) — all passed.

## Known limitations

- **Doesn't run at all in Expo Go.** Despite docs saying local (non-push)
  notifications remain supported there, in practice importing
  `expo-notifications` throws immediately on Expo Go's Android client as of
  SDK 53+ ("Android Push notifications ... was removed from Expo Go"), even
  though nothing here touches push. `src/notifications/scheduler.ts` detects
  this via `Constants.executionEnvironment === ExecutionEnvironment.StoreClient`
  (`expo-constants`) and lazily `require`s `expo-notifications` only outside
  that environment, so the app itself doesn't crash — but the feature is a
  silent no-op in Expo Go. It only actually works in a real dev/production
  build (`expo run:android`, `expo run:ios`, or an EAS build).
- The custom notification icon/accent color configured in `app.json`'s
  `expo-notifications` plugin entry also only applies in a real build —
  config plugins don't run against Expo Go.
