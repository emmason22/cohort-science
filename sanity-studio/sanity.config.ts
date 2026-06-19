import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "cohortScience",
  title: "Cohort Science CMS",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Public Website")
              .child(
                S.list()
                  .title("Public Website")
                  .items([
                    S.documentTypeListItem("publicPage").title("Pages"),
                    S.documentTypeListItem("publicJournalPost").title("Journal Posts"),
                    S.documentTypeListItem("teamMember").title("Team Members")
                  ])
              ),
            S.divider(),
            S.listItem()
              .title("Portal")
              .child(
                S.list()
                  .title("Portal")
                  .items([
                    S.documentTypeListItem("portalSettings").title("Portal Settings"),
                    S.documentTypeListItem("portalDashboard").title("Dashboards"),
                    S.documentTypeListItem("portalAnnouncement").title("Announcements"),
                    S.documentTypeListItem("portalHelpArticle").title("Help Articles")
                  ])
              )
          ])
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes
  }
});
