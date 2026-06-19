# Cohort Science CMS

This Sanity Studio is the shared CMS for both Cohort Science sites:

- Public website content: pages, Journal posts, and team members.
- Portal product content: portal settings, dashboard labels/descriptions, announcements, and help articles.

## Setup

Create one Sanity project and set:

```bash
export SANITY_STUDIO_PROJECT_ID="your_project_id"
export SANITY_STUDIO_DATASET="production"
```

Then run:

```bash
npm install
npm run dev
```

## Public Site

Set the same project details in `/sanity-config.js` so the static public site can read published Journal posts from Sanity.

## Portal

Set the same project details in `mobility-saas-starter/.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_STUDIO_URL=https://your-studio-url
```

## Migration Seed

`seed/publicPosts.json` preserves the existing Journal content for import/migration into Sanity.
