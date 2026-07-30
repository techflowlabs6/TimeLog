# TimeLog — Feature & Permissions Documentation

Complete reference for every feature in the app, what it does, and exactly who can do what.
Keep this file updated as you ship items from `Roadmap.jsx`.

---

## 1. Roles

There are exactly two roles today, stored in `profiles.role`:

| Role | How you get it |
|---|---|
| **member** | Default role for every new signup (Google or email/password) |
| **admin** | Manually promoted by running SQL: `update public.profiles set role = 'admin' where email = '...'` |

There is no self-service way to become admin — this is intentional, so project structure
can't be changed by just anyone who signs up.

---

## 2. Full permissions matrix

| Capability | Signed out | Member | Admin |
|---|:---:|:---:|:---:|
| View login page | ✅ | — | — |
| Sign up (Google or email/password) | ✅ | — | — |
| Sign in | ✅ | — | — |
| View Team Dashboard (all charts, all people's hours) | ❌ | ✅ | ✅ |
| Filter dashboard by date range / project | ❌ | ✅ | ✅ |
| Log a new time entry for **themselves** | ❌ | ✅ | ✅ |
| Log a time entry on behalf of someone else | ❌ | ❌ | ❌ *(not possible in v1.0 — see Roadmap v1.2)* |
| View **My Entries** (their own log) | ❌ | ✅ | ✅ |
| Edit their own entry's notes | ❌ | ✅ | ✅ |
| Edit their own entry's date/project/duration | ❌ | ❌ *(v1.1 feature)* | ❌ *(v1.1 feature)* |
| Delete their own entry | ❌ | ✅ | ✅ |
| Edit or delete **someone else's** entry | ❌ | ❌ | ❌ *(blocked at the database level, no exceptions)* |
| View the Roadmap page | ❌ | ✅ | ✅ |
| Check/uncheck Roadmap items | ❌ | ✅ (local to their browser) | ✅ (local to their browser) |
| View list of all projects | ❌ | ✅ | ✅ |
| Create a new project | ❌ | ❌ | ✅ |
| Rename / recolor a project | ❌ | ❌ | ✅ |
| Activate / deactivate a project | ❌ | ❌ | ✅ |
| Delete a project (and its time entries) | ❌ | ❌ | ✅ |
| Promote another user to admin | ❌ | ❌ | ❌ *(SQL-only in v1.0, by design)* |

**How this is enforced:** every row above that says ❌ for a signed-in role isn't just hidden
in the UI — it's blocked by Postgres Row Level Security policies on the database itself
(see `supabase/migrations/0001_init.sql`). Even a technically savvy member calling the
Supabase API directly, bypassing the UI entirely, cannot violate this table.

---

## 3. Feature-by-feature detail

### 3.1 Authentication (`Login.jsx`, `AuthContext.jsx`)
- **Google OAuth** — one-click sign-in/sign-up via Supabase's Google provider. First-time
  Google sign-in auto-creates a `profiles` row via a Postgres trigger, pulling name/email/avatar
  from the Google account.
- **Email + password** — classic sign-up/sign-in form. Password minimum 6 characters
  (Supabase Auth default). Same auto-profile-creation trigger fires on signup.
- **Session persistence** — sessions are stored and auto-refreshed by Supabase's client SDK,
  so users stay logged in across browser restarts until they explicitly sign out.
- **Sign out** — available from the bottom of the sidebar on every authenticated page.
- **Route protection** — `ProtectedRoute.jsx` redirects signed-out users to `/login`, and
  redirects non-admins away from `/admin/projects` back to the dashboard.

### 3.2 Log Time (`LogTime.jsx`)
- Select any **active** project from a dropdown (inactive/archived projects are hidden here).
- Pick a date (defaults to today).
- Two entry modes:
  - **Start / end time** — pick two clock times; duration is calculated automatically.
    Handles overnight ranges (e.g. 22:00 → 02:00 correctly computes 4 hours).
  - **Manual duration** — type hours directly (supports quarter-hour increments, e.g. 1.25).
- Optional free-text notes field ("what did you work on?").
- Live duration preview before saving.
- On save, the entry is inserted with `user_id` forced to the logged-in user — nobody can
  submit an entry under someone else's name, even by tampering with the request.

### 3.3 My Entries (`MyLog.jsx`)
- Table of every entry the signed-in user has ever logged, newest first.
- Shows date, project (with its color swatch), duration in hours, and notes.
- **Edit** — currently limited to the notes field only (v1.1 will extend this to
  date/project/duration).
- **Delete** — removes the entry after a confirmation prompt. Deletion is immediate and
  permanent (no undo in v1.0).
- A user can only ever see and act on rows where `user_id` matches their own account —
  this is enforced by RLS, not just by the query the UI happens to send.

### 3.4 Team Dashboard (`Dashboard.jsx`)
The shared view every signed-in team member sees, showing everyone's logged time.

- **Filters** — date range (from/to) and a single-project filter. All charts and stat cards
  react to the current filter selection; clearing filters resets to all-time, all-projects.
- **Stat cards**:
  - Total hours logged, all-time (not affected by filters — always the true lifetime total)
  - Hours logged this calendar week (Mon–Sun)
  - Hours logged this calendar month
  - Active members / active projects count
- **Pie chart — hours by project** — one slice per project that has logged time in the
  current filter, colored using each project's assigned `color_hex` so the color is
  consistent everywhere it appears in the app. Hover for exact hours; legend on the right.
- **Pie chart — hours by person** — one slice per person who has logged time in the current
  filter, each assigned a distinct color from a fixed palette (not user-customizable in v1.0).
- **Stacked bar chart — person × project** — one bar per person, segmented by project, so you
  can see at a glance not just how much someone worked but *what* they worked on. Segment
  colors match the project pie chart exactly.
- All chart data is computed client-side from the full `time_entries` table (readable by any
  authenticated user under RLS) — there's no separate reporting backend in v1.0.

### 3.5 Roadmap (`Roadmap.jsx`)
- Shows the shipped v1.0 feature list (locked, always checked) plus the three planned
  releases (v1.1, v1.2, v2.0) as checkable to-do lists.
- Checkbox state is saved to `localStorage` **on the device/browser being used** — it is not
  synced across devices or team members in v1.0. Two different teammates checking items will
  see two different progress states. Syncing this to Supabase is a natural small addition
  once it's needed (see Roadmap v1.1 discussion).

### 3.6 Admin → Projects (`AdminProjects.jsx`) — admin only
- **Create** a project with a name and one of 8 preset accent colors.
- **Recolor** any existing project by clicking a different swatch.
- **Activate / Deactivate** — deactivated projects disappear from the Log Time dropdown
  (so no new entries can be logged against them) but historical entries and dashboard
  numbers are untouched.
- **Delete** — permanently removes a project **and cascades to delete every time entry**
  logged against it (enforced by the database foreign key `on delete cascade`). The UI
  requires an explicit confirmation before this happens because it is irreversible.
- This entire page is invisible in navigation and blocked at the route level for non-admins;
  the underlying insert/update/delete operations are also blocked by RLS even if someone
  tried to call them directly.

---

## 4. Data model summary

| Table | Purpose | Key relationships |
|---|---|---|
| `profiles` | One row per user; name, email, avatar, role | `id` = `auth.users.id` |
| `projects` | The trackable projects (5 seeded by default) | `created_by` → `profiles.id` |
| `time_entries` | Every logged block of time | `user_id` → `profiles.id`, `project_id` → `projects.id` |

Full column definitions, indexes, and every RLS policy are in
`supabase/migrations/0001_init.sql` — that file is the single source of truth for what's
actually enforced; this document explains what it means in practice.

---

## 5. What's deliberately *not* possible in v1.0

Worth stating explicitly so it's not mistaken for a bug:

- No one can log time on someone else's behalf (including admins).
- No one can edit or delete another person's entries (including admins).
- There's no way to un-delete a project or a time entry once removed.
- There's no per-project hour budget or over-budget warning yet.
- There's no email/Slack notification when someone logs time yet.
- There's no approval workflow — every logged entry is final and visible on the dashboard
  immediately.

All of the above are tracked as planned work in the in-app **Roadmap** page.
