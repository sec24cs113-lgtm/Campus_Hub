# CampusHub

Academic marketplace built with Next.js (App Router), TypeScript, Tailwind CSS,
shadcn/ui, and Supabase.

## Project structure

- `app/` — Next.js App Router pages (marketplace, admin dashboard, auth, etc.)
- `components/`, `lib/`, `hooks/` — shared UI components, Supabase client, and utilities
- `app/api/promote-admin/route.ts` — Next.js API route that calls the Supabase
  `create-admin` Edge Function
- `supabase/functions/create-admin/` — Supabase Edge Function that creates/promotes
  an admin user via the Supabase Admin API (deployed separately from the Next.js app)
- `supabase/migrations/` — database schema migrations
- `legacy-vite-app/` — an earlier Vite + React Router prototype of this project that
  predates the Next.js rewrite. It is not part of the live app and is excluded from
  the Next.js build; kept only for reference. Safe to delete if you don't need it.

## Local development

```bash
npm install
cp .env.example .env   # fill in your Supabase URL/anon key
npm run dev
```

## Deploying

### 1. Next.js app → Vercel

1. Push this repository to GitHub.
2. Import it into Vercel (Next.js is auto-detected, no extra config needed).
3. Add these Environment Variables in Vercel → Project Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

### 2. Supabase Edge Function (`create-admin`)

This function is deployed to Supabase directly, not to Vercel:

```bash
supabase functions deploy create-admin
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_URL` is provided to edge functions automatically by Supabase.

### 3. Database migrations

```bash
supabase db push
```

## Notes

- The floating "Upload" button, admin dashboard, marketplace, leaderboard, and all
  existing pages/styling are unchanged from the original project.
- `/api/promote-admin` (Next.js) calls the `create-admin` Supabase Edge Function —
  this flow is fully preserved.
