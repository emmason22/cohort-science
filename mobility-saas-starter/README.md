# Mobility SaaS Starter (Private Client Review)

This app is configured for **invite-only staging review** of proprietary dashboards.

## What is implemented
- Clerk authentication for `/app/*`
- Email allowlist enforcement via `ALLOWED_REVIEW_EMAILS`
- Supabase entitlement checks per dashboard product code
- Sanity CMS hooks for client-managed portal copy and dashboard metadata
- Private dashboard delivery route (`/app/view/:slug`) so raw HTML is not public
- Access audit logging (`access_events`) for allowed/denied attempts
- No-index headers and private cache headers for protected content
- Stripe webhook left optional for later billing integration

## Dashboard product codes
- `dallas`
- `geo`
- `job`
- `job-v2`
- `utd-finance`

## Environments
Use separate projects/keys for each:
- `local` (developer machine)
- `staging` (client review)
- `production` (live)

Never share secrets across staging and production.

## Setup
```bash
cd mobility-saas-starter
npm install
cp .env.example .env.local
```

Fill `.env.local`:
- `APP_ENV` (`local`, `staging`, `production`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ALLOWED_REVIEW_EMAILS` (comma-separated invited emails)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_STUDIO_URL`
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (optional until billing is enabled)

Run SQL in Supabase:
- `supabase-schema.sql`

Start dev server:
```bash
npm run dev
```

## Manual entitlement management (Stripe deferred)
Grant access to a user by Clerk user id:
```sql
insert into entitlements (clerk_user_id, product_code, stripe_subscription_id, is_active)
values
('user_XXXXXXXX', 'geo', 'manual-staging', true)
on conflict (clerk_user_id, product_code)
do update set is_active = excluded.is_active, updated_at = now();
```

Revoke access:
```sql
update entitlements
set is_active = false, updated_at = now()
where clerk_user_id = 'user_XXXXXXXX' and product_code = 'geo';
```

## Client review workflow
See `docs/CLIENT_REVIEW_RUNBOOK.md` for weekly review cadence, gating, and promotion checklist.

## Stripe status
`/api/stripe/webhook` returns `501` until Stripe env vars are configured.
