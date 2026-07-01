export type DashboardSlug = "dallas" | "geo" | "job" | "job-v2" | "utd-finance";

export type DashboardConfig = {
  slug: DashboardSlug;
  title: string;
  category: "Longitudinal Analyses" | "Behavioral Persona Analyses";
  taxonomy: string;
  outcomeLabel: string;
  selectorLabel: "Institution" | "Program + Institution";
  selectorValue: string;
  productCode: string;
  fileName: string;
};

export const DASHBOARDS: Record<DashboardSlug, DashboardConfig> = {
  dallas: {
    slug: "dallas",
    title: "Dallas College Economic Mobility",
    category: "Behavioral Persona Analyses",
    taxonomy: "Persona-Level Insights",
    outcomeLabel: "Behavioral segment and persona outcomes",
    selectorLabel: "Institution",
    selectorValue: "Dallas College",
    productCode: "dallas",
    fileName: "DallasCollege_EconomicMobility.html"
  },
  geo: {
    slug: "geo",
    title: "Regional Mobility",
    category: "Longitudinal Analyses",
    taxonomy: "Regional Mobility",
    outcomeLabel: "Geographic Outcomes",
    selectorLabel: "Institution",
    selectorValue: "All institutions",
    productCode: "geo",
    fileName: "Geo_Dashboard.html"
  },
  job: {
    slug: "job",
    title: "Industry Mobility",
    category: "Longitudinal Analyses",
    taxonomy: "Industry Mobility",
    outcomeLabel: "Industry Outcomes",
    selectorLabel: "Institution",
    selectorValue: "All institutions",
    productCode: "job",
    fileName: "Job_Dashboard.html"
  },
  "job-v2": {
    slug: "job-v2",
    title: "Career Mobility",
    category: "Longitudinal Analyses",
    taxonomy: "Career Mobility",
    outcomeLabel: "Career & Milestone Outcomes",
    selectorLabel: "Institution",
    selectorValue: "All institutions",
    productCode: "job-v2",
    fileName: "Job_Dashboardv2_RectangleLogo.html"
  },
  "utd-finance": {
    slug: "utd-finance",
    title: "Program-Level Mobility",
    category: "Longitudinal Analyses",
    taxonomy: "Program-Level Mobility",
    outcomeLabel: "Program-specific outcomes",
    selectorLabel: "Program + Institution",
    selectorValue: "Finance, University of Texas at Dallas",
    productCode: "utd-finance",
    fileName: "UTD_Finance_Dashboard_(1).html"
  }
};

export const DASHBOARD_LIST = Object.values(DASHBOARDS);
