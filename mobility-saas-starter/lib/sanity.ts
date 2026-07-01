import { DASHBOARD_LIST, DASHBOARDS, type DashboardConfig, type DashboardSlug } from "@/lib/dashboards";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-19";

export type PortalSettings = {
  title: string;
  intro?: string;
  supportEmail?: string;
};

export type PortalDashboard = DashboardConfig & {
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type SanityDashboardRecord = {
  slug?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
};

function canUseSanity() {
  return Boolean(projectId);
}

async function sanityFetch<T>(query: string): Promise<T | null> {
  if (!canUseSanity()) return null;

  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    const data = (await response.json()) as { result?: T };
    return data.result ?? null;
  } catch {
    return null;
  }
}

export async function getPortalSettings(): Promise<PortalSettings> {
  const settings = await sanityFetch<PortalSettings>(
    '*[_type == "portalSettings"][0]{title, intro, supportEmail}'
  );

  return {
    title: settings?.title || "Dashboard Library",
    intro: settings?.intro,
    supportEmail: settings?.supportEmail
  };
}

export async function getPortalDashboardList(): Promise<PortalDashboard[]> {
  const records = await sanityFetch<SanityDashboardRecord[]>(
    '*[_type == "portalDashboard" && isActive != false] | order(sortOrder asc){slug, title, description, isActive, sortOrder}'
  );

  if (!records?.length) return DASHBOARD_LIST;

  const merged = records
    .map((record) => {
      const fallback = record.slug ? DASHBOARDS[record.slug as DashboardSlug] : null;
      if (!fallback) return null;
      return {
        ...fallback,
        description: record.description,
        isActive: record.isActive,
        sortOrder: record.sortOrder
      };
    })
    .filter((item): item is PortalDashboard => Boolean(item));

  return merged.length ? merged : DASHBOARD_LIST;
}

export async function getPortalDashboard(slug: string): Promise<PortalDashboard | null> {
  const fallback = DASHBOARDS[slug as DashboardSlug];
  if (!fallback) return null;

  const record = await sanityFetch<SanityDashboardRecord>(
    `*[_type == "portalDashboard" && slug == ${JSON.stringify(slug)}][0]{slug, title, description, isActive, sortOrder}`
  );

  if (!record || record.isActive === false) return fallback;

  return {
    ...fallback,
    description: record.description,
    isActive: record.isActive,
    sortOrder: record.sortOrder
  };
}

export function getSanityStudioUrl() {
  return process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || null;
}
