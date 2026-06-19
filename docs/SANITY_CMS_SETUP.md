# Sanity CMS Setup

Sanity is the shared CMS for both Cohort Science sites.

## Content Areas

- Public website: pages, Journal posts, team members.
- Portal product: portal settings, dashboard labels/descriptions, announcements, help articles.

## Environment Values

Use one Sanity project and one production dataset:

```bash
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

For the portal app, add:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-06-19
NEXT_PUBLIC_SANITY_STUDIO_URL=https://your-studio-url
```

For the public static site, update `/sanity-config.js`:

```js
window.COHORT_SANITY = {
  projectId: "your_project_id",
  dataset: "production",
  apiVersion: "2026-06-19"
};
```

## Import Existing Journal Posts

From `sanity-studio`:

```bash
npm install
npm run prepare:public-posts
npm run import:public-posts
```

The public site falls back to `sanity-studio/seed/publicPosts.json` until `sanity-config.js` has a project ID.
