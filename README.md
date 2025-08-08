# VC LAB (PWA)

A **batch-first incubation tracker** with timers, live board, plate view, label printing, and **Calendar sync (Google / ICS)**. Offline-first; optional Supabase sync.

## Quick start
```bash
npm i
npm run dev
```

Open http://localhost:5173

## Features in this scaffold
- Batch-first creation of N samples with base conditions (temp, rpm, duration)
- Live board: Now / Next 60 min / Overdue lanes
- Plate view (6 / 24 / 96)
- Local notifications (best-effort) + **Calendar sync** for reliable reminders
- Label PDF with QR codes
- PWA offline caching
- Optional Supabase persistence

## Google Calendar (client-only)
1. Create a **Google Cloud** project → enable **Google Calendar API**.
2. Configure **OAuth consent screen** (External → test mode OK).
3. Create OAuth **Web** client → add `http://localhost:5173` as an authorized origin.
4. Set env: `VITE_GOOGLE_CLIENT_ID=...`
5. Run dev and click **Add to Google Calendar**.

> This uses **Google Identity Services** in the browser with PKCE; no server needed.

## ICS export
Click **Download ICS** and import to Google/Outlook if you prefer manual 1‑way sync.

## Supabase (optional)
- Create project → copy **URL** and **anon key** into `.env`
- Create table `batches` with JSON column `samples`:
  ```sql
  create table if not exists public.batches (
    id text primary key,
    name text,
    project text,
    created_at timestamptz,
    plate_type text,
    samples jsonb
  );
  alter table public.batches enable row level security;
  create policy "read all" on public.batches for select using (true);
  create policy "upsert all" on public.batches for
    insert with check (true), update using (true);
  ```

## Deploy to Vercel (or Netlify)
- Push this repo to GitHub.
- In Vercel, **Import Project** → set **Environment Variables**.
- Build command: `npm run build`. Output: `dist`.
- Add `public/sw.js` and `public/manifest.webmanifest` in the deployment (Vite copies `public/*`).

## Roadmap (next steps)
- Two-way edits + event IDs from Google
- Team mode, conflict guard
- Resource tracking and tolerance bands
- Outlook (MSAL) integration
- Background worker (Supabase Edge Functions or Vercel Cron) for server-backed alerts

---

MIT © 2025 VC LAB
