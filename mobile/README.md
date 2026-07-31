# TimeKeeper Mobile

React Native (Expo Router) client for TimeKeeper, with two independent modes:

- **Team mode** — connects to a `api/` server you point it at (like Mattermost's server picker). Full auth, multi-user comments (with author), same data everyone else on that server sees.
- **Individual mode** — no server, no account. All data lives on-device in SQLite (via Drizzle ORM). Comments become freeform notes-on-a-task with no author.

The mode is chosen on first launch and remembered; it can be changed later from the in-app Settings sheet (gear icon in the header) without losing either mode's data — switching just changes which store the app reads/writes.

## Setup

```sh
npm install
```

No `.env` is required to run in Individual mode. For Team mode, the server URL is entered *in the app* (not a build-time env var) — `.env.example`'s `EXPO_PUBLIC_API_URL` is only used to prefill that field for convenience during development.

- iOS Simulator / Android Emulator: `http://localhost:3000` works as a server URL.
- Physical device (Expo Go or dev build): use your machine's LAN IP, e.g. `http://192.168.1.23:3000` — the device can't resolve `localhost` to your dev machine.

## Run

```sh
npm start        # then press i / a / w, or scan the QR code with Expo Go
npm run ios
npm run android
```

## Structure

- `app/` — Expo Router routes (file-based).
  - `mode-select.tsx` — first-launch Team/Individual picker.
  - `server-setup.tsx` — Team mode server URL entry + reachability check.
  - `login.tsx` — Team mode auth only.
  - `(app)/` — the protected tab group (`tasks/`, `notes/`), reachable once a mode is fully set up (gated in `app/_layout.tsx` via `Stack.Protected`).
- `src/data/` — the mode-agnostic data layer screens actually call:
  - `types.ts` — shared `Task`/`Note`/`TaskComment`/etc. shapes and the `DataRepo` interface both backends implement.
  - `apiRepo.ts` — wraps `src/api/*` (Team mode, REST).
  - `localRepo.ts` — wraps `src/db/*` (Individual mode, SQLite).
  - `index.ts` — `getRepo(mode)` picks the right one; screens call `getRepo(mode).tasks.getTasks()` etc., never the api/db modules directly.
- `src/db/` — Individual mode's local storage: `schema.ts` (Drizzle schema), `migrations/` (generated via `drizzle-kit generate`), `client.ts` (opens the DB), `useLocalDb.ts` (runs migrations + seeds default statuses on startup), `tasks.ts`/`notes.ts`/`comments.ts` (the actual local CRUD).
- `src/api/` — Team mode's REST client per resource, mirroring the Angular services. Server URL is read dynamically from AsyncStorage per-request (see `src/api/client.ts`), not baked in at build time.
- `src/context/` — `AppModeContext` (mode + server URL, persisted), `AuthContext` (Team mode session in `expo-secure-store`), `ThemeContext` (light/dark, persisted in AsyncStorage).
- `src/notifications/` — local due-date notifications, in both modes:
  - `planner.ts` — pure decision logic (no RN/Expo imports, unit-testable on its own): given a task, works out which notifications should fire and when. Only "In Progress" tasks with a due date get notifications — a "due soon" one at the existing urgency threshold (60 min out) and an "overdue" one at the due date itself. Times already in the past are skipped rather than fired retroactively.
  - `scheduler.ts` — the `expo-notifications` side: Android notification channels (one per type, so users can mute/adjust each independently), permission handling, and `syncTaskNotifications(task)` / `cancelTaskNotifications(id)`.
  - Wired in transparently at `getRepo()` (`src/data/index.ts`) — every `createTask`/`updateTask` reschedules from the task's current state, every `deleteTask` cancels. Screens don't need to know notifications exist.
- `src/screens/` — screen components, referenced by the thin route files under `app/`.
- `src/utils/taskUrgency.ts` — same urgency thresholds/labels as the Angular app.

## Notes

- Changing servers (or switching into Team mode with a new one) clears the current session, since a token from one server is meaningless to another.
- Status pickers use a custom `SelectModal` component instead of a native picker library, to avoid an extra native dependency.
- Web (`--web`) does not work at all, in either mode — `app/_layout.tsx` loads the local SQLite DB unconditionally (via `useLocalDb`), and `expo-sqlite`'s web target needs WASM/CORS setup that hasn't been added, since web isn't a target platform for this app (see `app.json`'s `platforms`).
- Local notifications (`src/notifications/`) don't run in Expo Go at all — importing `expo-notifications` throws immediately on Expo Go's Android client as of SDK 53+, despite docs saying local (non-push) notifications remain supported there. The scheduler detects Expo Go and no-ops instead of crashing; the feature only actually works in a real dev/production build. See `docs/local-notifications.md`.
