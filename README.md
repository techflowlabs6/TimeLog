# TimeLog — Team Time Tracking Dashboard

Track time across 5 projects, see who worked how much on what, with pie charts and a
person × project breakdown. Auth and data are 100% Supabase — Google OAuth or email/password.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard → **New project**.
2. Once it's created, open **Project Settings → API** and copy:
   - Project URL
   - `anon` public key

## 2. Run the database migration

1. Open **SQL Editor** in your Supabase project.
2. Paste the full contents of `supabase/migrations/0001_init.sql` and run it.
   This creates `profiles`, `projects`, `time_entries`, the auto-profile trigger,
   all Row Level Security policies, and seeds 5 starter projects (rename them to
   your real project names, or use the in-app admin panel).
3. Sign up once in the app (see step 5), then in the SQL editor run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   This makes you an admin so you can manage projects from the UI.

## 3. Enable Google OAuth (optional but recommended)

1. In Supabase: **Authentication → Providers → Google** → toggle on.
2. In [Google Cloud Console](https://console.cloud.google.com/), create an OAuth
   Client ID (Web application). Add these Authorized redirect URIs:
   - `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
3. Copy the Google Client ID + Secret into the Supabase provider settings and save.
4. In **Authentication → URL Configuration**, set your Site URL
   (e.g. `http://localhost:5173` for local dev, your real domain for production).

Email/password sign-in works out of the box with no extra setup — it's enabled
by default in Supabase Auth.

## 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the values from step 1.

## 5. Install and run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`, sign up, then promote yourself to admin (step 2.3)
to unlock the Projects admin page.

## 6. Deploy

Build with `npm run build` and deploy the `dist/` folder to Vercel, Netlify, or
any static host. Remember to set the same env vars in your hosting provider's
dashboard, and add your production URL to Supabase's Site URL / Redirect URLs.

## Security notes

- All data access is gated by Postgres Row Level Security — every table requires
  an authenticated Supabase session.
- Users can only insert, edit, or delete their **own** time entries.
- Only users with `role = 'admin'` in `profiles` can create/edit/delete projects.
- All authenticated team members can **read** all time entries and profiles —
  this is what powers the shared team dashboard. If you want entries to be
  private by default, tighten the `select` policy on `time_entries` in the
  migration file.
- No custom auth, passwords, or tokens are handled by this app directly —
  everything goes through Supabase Auth.

## Full feature & permissions documentation

See [`docs/FEATURES.md`](./docs/FEATURES.md) for a complete breakdown of every feature and
an exact who-can-do-what permissions matrix (signed out / member / admin).

## Project structure

```
src/
  lib/supabaseClient.js       Supabase client init
  context/AuthContext.jsx     session + profile state, sign in/out helpers
  components/                 Sidebar, charts, stat cards, route guard
  pages/
    Login.jsx                 Google OAuth + email/password
    Dashboard.jsx              pie charts, bar chart, stat cards, filters
    LogTime.jsx                log a new entry (range or manual duration)
    MyLog.jsx                  your own entries, editable/deletable
    AdminProjects.jsx          admin-only project CRUD
supabase/migrations/0001_init.sql   full schema + RLS + seed data
```
